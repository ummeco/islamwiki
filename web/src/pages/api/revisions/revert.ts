// FILE: src/pages/api/revisions/revert.ts
// PURPOSE: POST /api/revisions/revert — revert a revision (Editor trust>=2 via canRevertEdits),
//   submits an inverse revision and applies an edit_reverted trust delta to the original editor.
//   Astro port of app/api/revisions/revert/route.ts.
// SECURITY: rate-limited per IP; auth required; canRevertEdits(trustLevel) gate (>=2);
//   reason mandatory; all writes via lib (Hasura admin server-only).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { submitRevision, getRevisionById } from '@/lib/contributor/revisions'
import { getUserTrust, upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS, canRevertEdits } from '@/lib/contributor/trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const rl = await checkRateLimit(`revert:${getClientIp(request.headers)}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })

  const user = await getSessionUserFromCookies(cookies)
  if (!user) return json({ error: 'Unauthorized' }, 401)
  if (!canRevertEdits(user.trustLevel)) {
    return json({ error: 'Requires Editor level (2+)' }, 403)
  }

  const { revisionId, reason } = await request.json()
  if (!revisionId) return json({ error: 'revisionId required' }, 400)
  if (!reason) return json({ error: 'reason required for revert' }, 400)

  const [original, editorTrust] = await Promise.all([
    getRevisionById(revisionId),
    getUserTrust(user.userId),
  ])
  if (!original) return json({ error: 'Revision not found' }, 404)

  const revert = await submitRevision({
    contentType: original.content_type,
    contentSlug: original.content_slug,
    contentId: original.content_id ?? undefined,
    editorId: user.userId,
    editorUsername: user.username || user.email || 'Anonymous',
    previousContent: original.new_content,
    newContent: original.previous_content ?? '',
    changeSummary: `Revert: ${reason}`,
    isMinor: false,
    editorTrustScore: editorTrust?.trust_score ?? 0,
  })

  await upsertUserTrust(original.editor_id, original.editor_username, TRUST_DELTAS.edit_reverted)

  return json({ revert })
}
