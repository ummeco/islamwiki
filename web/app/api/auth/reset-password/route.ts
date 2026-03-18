export const dynamic = 'force-dynamic'

/**
 * Password reset callback handler.
 * Hasura Auth redirects here after verifying the reset ticket.
 * URL format: /api/auth/reset-password?refreshToken=<token>&type=passwordReset
 *
 * We exchange the refreshToken for an access token, set auth cookies,
 * then redirect to /auth/change-password so the user can set their new password.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { refreshAccessToken } from '@/lib/auth-client'

export async function GET(request: NextRequest) {
  const refreshToken = request.nextUrl.searchParams.get('refreshToken')
  const type = request.nextUrl.searchParams.get('type')

  if (!refreshToken || type !== 'passwordReset') {
    return NextResponse.redirect(new URL('/auth/forgot-password?error=invalid_link', request.url))
  }

  const { data, error } = await refreshAccessToken(refreshToken)

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
