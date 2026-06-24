// FILE: src/pages/api/admin/block-ip.ts
// PURPOSE: GET/POST/DELETE/PUT /api/admin/block-ip — IP block CRUD (Admin trust>=4).
//   GET lists blocks; POST blocks an explicit IP; DELETE unblocks; PUT quick-bans the caller's
//   request IP. Astro port of app/api/admin/block-ip/route.ts.
// SECURITY: every method requires authenticated session with trustLevel>=4 (isAdmin);
//   all writes via lib/contributor/ip-block (Hasura admin secret server-only).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { blockIp, unblockIp, listBlockedIps } from '@/lib/contributor/ip-block'
import { getClientIp } from '@/lib/rate-limit'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function isAdmin(trustLevel: number) {
  return trustLevel >= 4
}

export const GET: APIRoute = async ({ cookies }) => {
  const user = await getSessionUserFromCookies(cookies)
  if (!user || !isAdmin(user.trustLevel)) {
    return json({ error: 'Forbidden' }, 403)
  }
  const blocks = await listBlockedIps()
  return json({ blocks })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getSessionUserFromCookies(cookies)
  if (!user || !isAdmin(user.trustLevel)) {
    return json({ error: 'Forbidden' }, 403)
  }

  const { ip, reason } = await request.json()
  if (!ip || !reason) {
    return json({ error: 'ip and reason required' }, 400)
  }

  await blockIp(ip, reason, user.username || user.email || user.userId)
  return json({ blocked: ip })
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const user = await getSessionUserFromCookies(cookies)
  if (!user || !isAdmin(user.trustLevel)) {
    return json({ error: 'Forbidden' }, 403)
  }

  const { ip } = await request.json()
  if (!ip) return json({ error: 'ip required' }, 400)

  const removed = await unblockIp(ip)
  return json({ unblocked: removed ? ip : null })
}

// Also allow blocking the IP from the request context (quick ban)
export const PUT: APIRoute = async ({ request, cookies }) => {
  const user = await getSessionUserFromCookies(cookies)
  if (!user || !isAdmin(user.trustLevel)) {
    return json({ error: 'Forbidden' }, 403)
  }

  const { reason } = await request.json()
  if (!reason) return json({ error: 'reason required' }, 400)

  const ip = getClientIp(request.headers)
  await blockIp(ip, reason, user.username || user.email || user.userId)
  return json({ blocked: ip })
}
