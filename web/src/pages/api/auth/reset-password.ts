// FILE: src/pages/api/auth/reset-password.ts
// PURPOSE: GET /api/auth/reset-password?refreshToken=<t>&type=passwordReset — password reset
//   callback. Exchanges the refresh token for a short-lived session, sets cookies, redirects
//   to /auth/change-password. Astro port of app/api/auth/reset-password/route.ts.
// SECURITY: requires type=passwordReset; tokens httpOnly; secure in prod; redirects on invalid/expired.
import type { APIRoute } from 'astro'
import { refreshAccessToken } from '@/lib/auth-client'

export const prerender = false

export const GET: APIRoute = async ({ request, cookies }) => {
  const { searchParams } = new URL(request.url)
  const refreshToken = searchParams.get('refreshToken')
  const type = searchParams.get('type')

  if (!refreshToken || type !== 'passwordReset') {
    return Response.redirect(new URL('/auth/forgot-password?error=invalid_link', request.url), 302)
  }

  const { data, error } = await refreshAccessToken(refreshToken)

  if (error || !data) {
    return Response.redirect(new URL('/auth/forgot-password?error=link_expired', request.url), 302)
  }

  const isProd = import.meta.env.PROD

  // Set short-lived session for password change only
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

  // Redirect to change-password page
  return Response.redirect(new URL('/auth/change-password', request.url), 302)
}
