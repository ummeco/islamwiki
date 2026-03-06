import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth'

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long_for_dev',
  cookieName: 'iw_session',
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  )

  const { pathname } = request.nextUrl

  // Already logged in? Redirect away from auth pages
  if (session.isLoggedIn) {
    if (pathname === '/account' || pathname === '/signin' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/auth/') && pathname !== '/auth/change-password') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Allow change-password if flagged
    if (pathname === '/auth/change-password' && !session.mustChangePassword) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected: must be logged in
  if (!session.isLoggedIn) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
      const loginUrl = new URL('/account', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname.includes('/edit')) {
      const loginUrl = new URL('/account', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin routes: must have trust_level >= 4
  if (
    session.isLoggedIn &&
    pathname.startsWith('/admin') &&
    session.trustLevel < 4
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Force password change if flagged
  if (
    session.isLoggedIn &&
    session.mustChangePassword &&
    !pathname.startsWith('/auth/change-password') &&
    !pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(
      new URL('/auth/change-password', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/account',
    '/signin',
    '/signup',
    '/(.*)/edit',
    '/(.*)/edit/:path*',
  ],
}
