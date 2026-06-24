// FILE: src/pages/api/auth/magic-link.ts
// PURPOSE: GET /api/auth/magic-link?ticket=<t> — magic-link callback. Exchanges the
//   one-time ticket for tokens via Hasura Auth, sets iw_at/iw_rt cookies, redirects home.
//   Astro port of app/api/auth/magic-link/route.ts.
// SECURITY: tokens stored httpOnly; secure flag in production; redirects on invalid/expired.
import type { APIRoute } from 'astro'
import { exchangeTicket } from '@/lib/auth-client'

export const prerender = false

export const GET: APIRoute = async ({ request, cookies }) => {
  const ticket = new URL(request.url).searchParams.get('ticket')

  if (!ticket) {
    return Response.redirect(new URL('/account?error=invalid_link', request.url), 302)
  }

  const { data, error } = await exchangeTicket(ticket)

  if (error || !data) {
    return Response.redirect(new URL('/account?error=link_expired', request.url), 302)
  }

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

  return Response.redirect(new URL('/', request.url), 302)
}
