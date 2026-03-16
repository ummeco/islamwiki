/**
 * Magic link callback handler.
 * Hasura Auth sends the user here after they click the email link.
 * URL format: /api/auth/magic-link?ticket=<ticket>
 */
export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeTicket } from '@/lib/auth-client'

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket')

  if (!ticket) {
    return NextResponse.redirect(new URL('/account?error=invalid_link', request.url))
  }

  const { data, error } = await exchangeTicket(ticket)

  if (error || !data) {
    return NextResponse.redirect(new URL('/account?error=link_expired', request.url))
  }

  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('iw_at', data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: data.accessTokenExpiresIn,
    path: '/',
  })

  cookieStore.set('iw_rt', data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return NextResponse.redirect(new URL('/', request.url))
}
