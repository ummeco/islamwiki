export const dynamic = 'force-dynamic'

/**
 * Google OAuth callback handler.
 * Hasura Auth redirects here after Google login with session tokens in URL params.
 * URL format: /api/auth/oauth/callback?refreshToken=<rt>&accessToken=<at>
 */
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { refreshAccessToken } from '@/lib/auth-client'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Hasura Auth sends tokens as URL params after OAuth redirect
  const refreshToken = searchParams.get('refreshToken')
  const accessToken = searchParams.get('accessToken')

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/account?error=oauth_failed', request.url))
  }

  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  // If we have a refresh token but no access token, exchange it
  let at = accessToken
  let atExpiresIn = 900 // 15 min default

  if (!at) {
    const { data } = await refreshAccessToken(refreshToken)
    if (!data) {
      return NextResponse.redirect(new URL('/account?error=oauth_failed', request.url))
    }
    at = data.accessToken
    atExpiresIn = data.accessTokenExpiresIn
  }

  cookieStore.set('iw_at', at, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: atExpiresIn,
    path: '/',
  })

  cookieStore.set('iw_rt', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return NextResponse.redirect(new URL('/', request.url))
}
