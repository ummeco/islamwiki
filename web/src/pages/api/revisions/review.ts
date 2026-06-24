// FILE: src/pages/api/revisions/review.ts
// PURPOSE: POST /api/revisions/review — approve/deny a revision (Editor trust>=2), applies the
//   matching trust delta to the editor. Astro port of app/api/revisions/review/route.ts.
// SECURITY: rate-limited per IP; auth required; trustLevel>=2 gate; reviewers cannot review
//   their own edits; action constrained to approved|denied; writes via lib (admin server-only).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { reviewRevision, getRevisionById } from '@/lib/contributor/revisions'
import { upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS } from '@/lib/contributor/trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const rl = await checkRateLimit(`review:${getClientIp(request.headers)}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })

  const user = await getSessionUserFromCookies(cookies)
  if (!user) return json({ error: 'Unauthorized' }, 401)
  if (user.trustLevel < 2) {
    return json({ error: 'Requires Editor level (2+)' }, 403)
  }

  const { revisionId, action } = await request.json()
  if (!revisionId || !['approved', 'denied'].includes(action)) {
    return json({ error: 'revisionId and action (approved|denied) required' }, 400)
  }

  const existing = await getRevisionById(revisionId)
  if (!existing) return json({ error: 'Revision not found' }, 404)
  if (existing.editor_id === user.userId) {
    return json({ error: 'Cannot review your own edits' }, 403)
  }

  const revision = await reviewRevision(revisionId, user.userId, action)
  const delta = action === 'approved' ? TRUST_DELTAS.edit_approved : TRUST_DELTAS.edit_denied
  const field = action === 'approved' ? 'edits_approved' : 'edits_rejected'
  await upsertUserTrust(revision.editor_id, revision.editor_username, delta, field)

  return json({ revision })
}
