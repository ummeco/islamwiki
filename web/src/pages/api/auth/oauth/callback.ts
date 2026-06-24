// FILE: src/pages/api/auth/oauth/callback.ts
// PURPOSE: GET /api/auth/oauth/callback — Google OAuth callback. Hasura Auth redirects here
//   with refreshToken (and optionally accessToken) in URL params; exchanges if needed, sets
//   iw_at/iw_rt cookies, redirects home. Astro port of app/api/auth/oauth/callback/route.ts.
// SECURITY: tokens stored httpOnly; secure flag in production; redirects on failure.
import type { APIRoute } from 'astro'
import { refreshAccessToken } from '@/lib/auth-client'

export const prerender = false

export const GET: APIRoute = async ({ request, cookies }) => {
  const { searchParams } = new URL(request.url)

  // Hasura Auth sends tokens as URL params after OAuth redirect
  const refreshToken = searchParams.get('refreshToken')
  const accessToken = searchParams.get('accessToken')

  if (!refreshToken) {
    return Response.redirect(new URL('/account?error=oauth_failed', request.url), 302)
  }

  const isProd = import.meta.env.PROD

  // If we have a refresh token but no access token, exchange it
  let at = accessToken
  let atExpiresIn = 900 // 15 min default

  if (!at) {
    const { data } = await refreshAccessToken(refreshToken)
    if (!data) {
      return Response.redirect(new URL('/account?error=oauth_failed', request.url), 302)
    }
    at = data.accessToken
    atExpiresIn = data.accessTokenExpiresIn
  }

  cookies.set('iw_at', at, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: atExpiresIn,
    path: '/',
  })

  cookies.set('iw_rt', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return Response.redirect(new URL('/', request.url), 302)
}
