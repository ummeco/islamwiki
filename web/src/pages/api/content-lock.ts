// FILE: src/pages/api/content-lock.ts
// PURPOSE: GET /api/content-lock?type=&slug= (lock status, rate-limited) and
//   POST /api/content-lock (lock/unlock, Moderator trust>=3). Astro port of
//   app/api/content-lock/route.ts.
// SECURITY: POST requires authenticated session + canLockPages (trustLevel>=3);
//   all Hasura access via hasuraAdmin (admin secret server-only); rate-limited per IP.
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { hasuraAdmin } from '@/lib/hasura-admin'
import { canLockPages } from '@/lib/contributor/trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const GET: APIRoute = async ({ request }) => {
  const rl = await checkRateLimit(`lock-get:${getClientIp(request.headers)}`, { limit: 60, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('type')
  const contentSlug = searchParams.get('slug')
  if (!contentType || !contentSlug) {
    return json({ error: 'type and slug required' }, 400)
  }

  const data = await hasuraAdmin<{ iw_content_locks: { id: string; lock_level: number; locked_by: string; lock_reason: string | null }[] }>(
    `query IsLocked($type: String!, $slug: String!) {
      iw_content_locks(where: { content_type: { _eq: $type }, content_slug: { _eq: $slug } }) {
        id lock_level locked_by lock_reason
      }
    }`,
    { type: contentType, slug: contentSlug }
  )

  const lock = data.iw_content_locks[0] ?? null
  return json({ locked: !!lock, lock })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const rl = await checkRateLimit(`lock-post:${getClientIp(request.headers)}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })

  const user = await getSessionUserFromCookies(cookies)
  if (!user) return json({ error: 'Unauthorized' }, 401)
  if (!canLockPages(user.trustLevel)) {
    return json({ error: 'Requires Moderator level (3+)' }, 403)
  }

  const { action, contentType, contentSlug, lockReason, lockLevel = 2 } = await request.json()
  if (!contentType || !contentSlug) {
    return json({ error: 'contentType and contentSlug required' }, 400)
  }

  if (action === 'lock') {
    await hasuraAdmin(
      `mutation LockContent($obj: iw_content_locks_insert_input!) {
        insert_iw_content_locks_one(
          object: $obj
          on_conflict: { constraint: iw_content_locks_content_type_content_slug_key, update_columns: [lock_level, locked_by, lock_reason] }
        ) { id }
      }`,
      { obj: { content_type: contentType, content_slug: contentSlug, locked_by: user.userId, lock_reason: lockReason ?? null, lock_level: lockLevel } }
    )
    return json({ success: true, action: 'locked' })
  }

  if (action === 'unlock') {
    await hasuraAdmin(
      `mutation UnlockContent($type: String!, $slug: String!) {
        delete_iw_content_locks(where: { content_type: { _eq: $type }, content_slug: { _eq: $slug } }) { affected_rows }
      }`,
      { type: contentType, slug: contentSlug }
    )
    return json({ success: true, action: 'unlocked' })
  }

  return json({ error: 'action must be lock or unlock' }, 400)
}
