// FILE: src/pages/api/admin/edits.ts
// PURPOSE: POST /api/admin/edits — admin revision moderation against the file-backed revision store
//   (lib/data/revisions). Astro port of the Next server actions adminApproveEdit / adminRejectEdit
//   in app/actions/admin.ts. Dispatches on `action`: approve | reject.
// SECURITY (preserved EXACTLY from app/actions/admin.ts):
//   - Both actions require an authenticated session with trustLevel >= 2 (Editor).
//   - updateRevisionStatus writes via lib/data/revisions (server-only fs store); the reviewer id
//     is the verified session user id. Reject defaults to 'Rejected by moderator' when no reason.
// NOTE: this is the file-store moderation path (lib/data/revisions). The Hasura-backed contributor
//   review flow lives at /api/revisions/review (lib/contributor/revisions) and is unchanged.
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { updateRevisionStatus } from '@/lib/data/revisions'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionUserFromCookies(cookies)
  if (!session || session.trustLevel < 2) return json({ error: 'Forbidden' }, 403)

  const form = await request.formData()
  const action = form.get('action') as string | null
  const contentType = form.get('content_type') as string | null
  const contentSlug = form.get('content_slug') as string | null
  const revisionId = form.get('revision_id') as string | null

  if (!contentType || !contentSlug || !revisionId) {
    return json({ error: 'Missing required fields' }, 400)
  }

  if (action === 'approve') {
    const result = updateRevisionStatus(
      contentType,
      contentSlug,
      revisionId,
      'approved',
      session.userId
    )
    if (!result) return json({ error: 'Revision not found or update failed.' }, 404)
    return json({ success: true })
  }

  if (action === 'reject') {
    const reason = form.get('reason') as string | null
    const result = updateRevisionStatus(
      contentType,
      contentSlug,
      revisionId,
      'rejected',
      session.userId,
      reason || 'Rejected by moderator'
    )
    if (!result) return json({ error: 'Revision not found or update failed.' }, 404)
    return json({ success: true })
  }

  return json({ error: 'action must be approve or reject' }, 400)
}
