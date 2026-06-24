// FILE: src/pages/api/admin/users.ts
// PURPOSE: POST /api/admin/users — admin user-management actions. Astro port of the Next server
//   actions updateTrustLevel / updateRole / toggleBan in app/actions/admin.ts. Dispatches on the
//   `action` field: set_trust_level (banUser→setTrustLevel), set_role, toggle_ban.
// SECURITY (preserved EXACTLY from app/actions/admin.ts — every gate byte-equivalent):
//   - set_trust_level: requires trustLevel >= 4; level 5 grant requires caller trustLevel >= 5;
//     cannot modify a target whose trust_level >= caller's unless caller is owner (5);
//     trust level clamped to 0..5.
//   - set_role: requires trustLevel >= 4; role allowlist; assigning 'owner' requires caller >= 5.
//   - toggle_ban: requires trustLevel >= 3; cannot ban a target whose trust_level >= caller's.
//   - All user writes via lib/data/users (server-only). Forbidden/invalid requests are rejected
//     rather than silently no-op'd (the Next actions returned void; here we return explicit status
//     so the client form can surface failures).
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { getUserById, updateUser } from '@/lib/data/users'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionUserFromCookies(cookies)
  if (!session) return json({ error: 'Unauthorized' }, 401)

  const form = await request.formData()
  const action = form.get('action') as string | null

  // ── Update Trust Level ── (Admin 4+; owner-only for level 5; rank guard)
  if (action === 'set_trust_level') {
    if (session.trustLevel < 4) return json({ error: 'Forbidden' }, 403)

    const userId = form.get('user_id') as string | null
    const trustLevel = Number(form.get('trust_level'))

    if (!userId || isNaN(trustLevel) || trustLevel < 0 || trustLevel > 5) {
      return json({ error: 'Invalid request' }, 400)
    }
    if (trustLevel === 5 && session.trustLevel < 5) return json({ error: 'Forbidden' }, 403)

    const target = getUserById(userId)
    if (!target) return json({ error: 'User not found' }, 404)
    if (target.trust_level >= session.trustLevel && session.trustLevel < 5) {
      return json({ error: 'Forbidden' }, 403)
    }

    updateUser(userId, { trust_level: trustLevel as 0 | 1 | 2 | 3 | 4 | 5 })
    return json({ success: true })
  }

  // ── Update Role ── (Admin 4+; owner-only to assign 'owner')
  if (action === 'set_role') {
    if (session.trustLevel < 4) return json({ error: 'Forbidden' }, 403)

    const userId = form.get('user_id') as string | null
    const role = form.get('role') as string | null
    const validRoles = ['user', 'editor', 'moderator', 'admin', 'owner']

    if (!userId || !role || !validRoles.includes(role)) {
      return json({ error: 'Invalid request' }, 400)
    }
    if (role === 'owner' && session.trustLevel < 5) return json({ error: 'Forbidden' }, 403)

    const target = getUserById(userId)
    if (!target) return json({ error: 'User not found' }, 404)

    updateUser(userId, { role: role as 'user' | 'editor' | 'moderator' | 'admin' | 'owner' })
    return json({ success: true })
  }

  // ── Ban / Unban User ── (Moderator 3+; rank guard)
  if (action === 'toggle_ban') {
    if (session.trustLevel < 3) return json({ error: 'Forbidden' }, 403)

    const userId = form.get('user_id') as string | null
    if (!userId) return json({ error: 'Invalid request' }, 400)

    const target = getUserById(userId)
    if (!target) return json({ error: 'User not found' }, 404)
    if (target.trust_level >= session.trustLevel) return json({ error: 'Forbidden' }, 403)

    updateUser(userId, { banned: !target.banned })
    return json({ success: true, banned: !target.banned })
  }

  return json({ error: 'action must be set_trust_level, set_role, or toggle_ban' }, 400)
}
