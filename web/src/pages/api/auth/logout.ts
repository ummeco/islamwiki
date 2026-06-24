// FILE: src/pages/api/auth/logout.ts
// PURPOSE: POST /api/auth/logout — best-effort server-side refresh-token invalidation,
//   then clears the iw_at / iw_rt auth cookies. Astro port of app/api/auth/logout/route.ts.
// SECURITY: cookies are httpOnly; signOut() invalidates the refresh token server-side.
import type { APIRoute } from 'astro'
import { signOut } from '@/lib/auth-client'

export const POST: APIRoute = async ({ cookies }) => {
  const refreshToken = cookies.get('iw_rt')?.value

  if (refreshToken) {
    // Best-effort: invalidate refresh token server-side
    await signOut(refreshToken).catch(() => undefined)
  }

  cookies.delete('iw_at', { path: '/' })
  cookies.delete('iw_rt', { path: '/' })

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
