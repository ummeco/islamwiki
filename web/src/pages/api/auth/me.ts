// FILE: src/pages/api/auth/me.ts
// PURPOSE: GET /api/auth/me — return the current authenticated user. If the access token
//   is missing/expired but a refresh token exists, silently refresh and re-resolve.
//   Astro port of app/api/auth/me/route.ts.
// SECURITY: session resolved via cryptographic JWT verification (decodeToken/JWKS);
//   tokens stored httpOnly; secure flag in production; responses are no-store.
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { refreshAccessToken } from '@/lib/auth-client'

export const prerender = false

const noCache = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}

export const GET: APIRoute = async ({ cookies }) => {
  const refreshToken = cookies.get('iw_rt')?.value

  // Try to get user from current access token
  let user = await getSessionUserFromCookies(cookies)

  // If no valid access token but refresh token exists, auto-refresh
  if (!user && refreshToken) {
    const { data } = await refreshAccessToken(refreshToken)
    if (data) {
      const isProd = import.meta.env.PROD

      cookies.set('iw_at', data.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: data.accessTokenExpiresIn,
        path: '/',
      })
      cookies.set('iw_rt', data.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      // Re-fetch user with new token (cookies.get reflects the value just set)
      user = await getSessionUserFromCookies(cookies)
    }
  }

  if (!user) {
    return new Response(JSON.stringify({ user: null }), { status: 200, headers: noCache })
  }

  return new Response(
    JSON.stringify({
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        trustLevel: user.trustLevel,
      },
    }),
    { status: 200, headers: noCache }
  )
}
