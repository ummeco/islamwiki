// FILE: src/pages/api/trust.ts
// PURPOSE: GET /api/trust?userId= (read a trust record — self or Moderator 3+) and
//   POST /api/trust (warn: Moderator 3+ / ban: Admin 4+). Astro port of app/api/trust/route.ts.
// SECURITY: rate-limited per IP; auth required; GET restricted to self or trustLevel>=3;
//   warn gated by canWarnUsers (3+), ban gated by canBanUsers (4+); writes via lib (admin server-only).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { getUserTrust, banUser, upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS, canWarnUsers, canBanUsers } from '@/lib/contributor/trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const GET: APIRoute = async ({ request, cookies }) => {
  const rl = await checkRateLimit(`trust-get:${getClientIp(request.headers)}`, { limit: 60, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })
  const caller = await getSessionUserFromCookies(cookies)
  if (!caller) return json({ error: 'Unauthorized' }, 401)

  const userId = new URL(request.url).searchParams.get('userId')
  if (!userId) return json({ error: 'userId required' }, 400)

  // Only self or moderators (level 3+) may read full trust records
  if (caller.userId !== userId && caller.trustLevel < 3) {
    return json({ error: 'Forbidden' }, 403)
  }

  const trust = await getUserTrust(userId)
  return json({ trust })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const rl = await checkRateLimit(`trust-post:${getClientIp(request.headers)}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })

  const user = await getSessionUserFromCookies(cookies)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const { action, targetUserId, reason } = await request.json()

  if (action === 'warn') {
    if (!canWarnUsers(user.trustLevel)) {
      return json({ error: 'Requires Moderator level (3+)' }, 403)
    }
    const trust = await getUserTrust(targetUserId)
    const updated = await upsertUserTrust(targetUserId, trust?.username ?? targetUserId, TRUST_DELTAS.warned)
    return json({ trust: updated })
  }

  if (action === 'ban') {
    if (!canBanUsers(user.trustLevel)) {
      return json({ error: 'Requires Admin level (4+)' }, 403)
    }
    if (!reason) return json({ error: 'reason required' }, 400)
    await banUser(targetUserId, user.userId, reason)
    return json({ success: true })
  }

  return json({ error: 'action must be warn or ban' }, 400)
}
