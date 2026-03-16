export const dynamic = 'force-dynamic'

/**
 * Password reset callback handler.
 * Hasura Auth sends the user here after they click the reset email link.
 * URL format: /api/auth/reset-password?ticket=<ticket>
 *
 * We exchange the ticket for a session, then redirect to /auth/change-password
 * so the user can set their new password while authenticated.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeTicket } from '@/lib/auth-client'

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket')

  if (!ticket) {
    return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid_link', request.url))
  }

  const { data, error } = await exchangeTicket(ticket)

  if (error || !data) {
    return NextResponse.redirect(new URL('/auth/forgot-password?error=link_expired', request.url))
  }

  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  // Set short-lived session for password change only
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

  // Redirect to change-password page
  return NextResponse.redirect(new URL('/auth/change-password', request.url))
}
