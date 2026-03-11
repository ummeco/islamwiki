import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/auth'
import { refreshAccessToken } from '@/lib/auth-client'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('iw_at')?.value
  const refreshToken = cookieStore.get('iw_rt')?.value

  // Try to get user from current access token
  let user = await getSessionUser()

  // If no valid access token but refresh token exists, auto-refresh
  if (!user && refreshToken) {
    const { data } = await refreshAccessToken(refreshToken)
    if (data) {
      const isProd = process.env.NODE_ENV === 'production'
      const response = NextResponse.next()

      // Set new access token cookie
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

      // Re-fetch user with new token
      user = await getSessionUser()
    }
  }

  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      trustLevel: user.trustLevel,
    },
  })
}
