import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth'

const LOCALES = ['en', 'ar', 'id'] as const
const DEFAULT_LOCALE = 'en'

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long_for_dev',
  cookieName: 'iw_session',
}

function extractLocale(pathname: string): { locale: string; strippedPath: string } {
  const segments = pathname.split('/')
  // segments[0] is '' (before leading /), segments[1] might be locale
  const maybeLocale = segments[1]
  if (maybeLocale && LOCALES.includes(maybeLocale as typeof LOCALES[number]) && maybeLocale !== DEFAULT_LOCALE) {
    const strippedPath = '/' + segments.slice(2).join('/') || '/'
    return { locale: maybeLocale, strippedPath }
  }
  return { locale: DEFAULT_LOCALE, strippedPath: pathname }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Locale detection ---
  const { locale, strippedPath } = extractLocale(pathname)

  // If /en/ prefix is used explicitly, redirect to unprefixed URL
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const cleanPath = pathname.replace(/^\/en\/?/, '/') || '/'
    return NextResponse.redirect(new URL(cleanPath, request.url), 301)
  }

  // For non-default locales, rewrite to actual path and set locale header
  let response: NextResponse
  if (locale !== DEFAULT_LOCALE) {
    const rewriteUrl = new URL(strippedPath, request.url)
    response = NextResponse.rewrite(rewriteUrl)
  } else {
    response = NextResponse.next()
  }

  // Set locale header for pages to read
  response.headers.set('x-locale', locale)

  // Use the stripped path for auth checks
  const checkPath = strippedPath

  // --- Auth middleware (on matching paths only) ---
  const needsAuth =
    checkPath.startsWith('/admin') ||
    checkPath.startsWith('/profile') ||
    checkPath.startsWith('/auth/') ||
    checkPath === '/account' ||
    checkPath === '/signin' ||
    checkPath === '/signup' ||
    checkPath.includes('/edit')

  if (!needsAuth) return response

  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  )

  // Already logged in? Redirect away from auth pages
  if (session.isLoggedIn) {
    if (checkPath === '/account' || checkPath === '/signin' || checkPath === '/signup') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (checkPath.startsWith('/auth/') && checkPath !== '/auth/change-password') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (checkPath === '/auth/change-password' && !session.mustChangePassword) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected: must be logged in
  if (!session.isLoggedIn) {
    if (checkPath.startsWith('/admin') || checkPath.startsWith('/profile')) {
      const loginUrl = new URL('/account', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (checkPath.includes('/edit')) {
      const loginUrl = new URL('/account', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin routes: must have trust_level >= 4
  if (
    session.isLoggedIn &&
    checkPath.startsWith('/admin') &&
    session.trustLevel < 4
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Force password change if flagged
  if (
    session.isLoggedIn &&
    session.mustChangePassword &&
    !checkPath.startsWith('/auth/change-password') &&
    !checkPath.startsWith('/api/')
  ) {
    return NextResponse.redirect(
      new URL('/auth/change-password', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    // Locale prefixed routes (ar, id)
    '/(ar|id)/:path*',
    // Auth-protected routes
    '/admin/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/account',
    '/signin',
    '/signup',
    '/(.*)/edit',
    '/(.*)/edit/:path*',
    // Redirect /en/ to unprefixed
    '/en/:path*',
    '/en',
  ],
}
