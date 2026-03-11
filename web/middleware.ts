import { NextResponse, type NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

const LOCALES = ['en', 'ar', 'id'] as const
const DEFAULT_LOCALE = 'en'

interface JWTPayload {
  sub: string
  exp: number
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-default-role'?: string
    'x-hasura-allowed-roles'?: string[]
  }
  displayName?: string
  email?: string
}

function extractLocale(pathname: string): { locale: string; strippedPath: string } {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (maybeLocale && LOCALES.includes(maybeLocale as typeof LOCALES[number]) && maybeLocale !== DEFAULT_LOCALE) {
    const strippedPath = '/' + segments.slice(2).join('/') || '/'
    return { locale: maybeLocale, strippedPath }
  }
  return { locale: DEFAULT_LOCALE, strippedPath: pathname }
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const payload = jwtDecode<JWTPayload>(token)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

function getTrustLevelFromRole(role: string | undefined): number {
  const map: Record<string, number> = {
    owner: 5,
    admin: 4,
    moderator: 3,
    editor: 2,
    user: 0,
  }
  return map[role ?? 'user'] ?? 0
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
    checkPath.startsWith('/auth/') ||
    checkPath === '/account' ||
    checkPath === '/signin' ||
    checkPath === '/signup' ||
    checkPath.includes('/edit')

  if (!needsAuth) return response

  // Decode JWT from iw_at cookie (edge-compatible — no external calls)
  const token = request.cookies.get('iw_at')?.value
  const jwtPayload = token ? decodeJWT(token) : null
  const isLoggedIn = jwtPayload !== null

  const role = jwtPayload?.['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
  const trustLevel = getTrustLevelFromRole(role)

  // Already logged in? Redirect away from auth pages
  if (isLoggedIn) {
    if (checkPath === '/account' || checkPath === '/signin' || checkPath === '/signup') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (checkPath.startsWith('/auth/') && checkPath !== '/auth/change-password') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected: must be logged in
  if (!isLoggedIn) {
    if (checkPath.startsWith('/admin')) {
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
  if (isLoggedIn && checkPath.startsWith('/admin') && trustLevel < 4) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Locale prefixed routes (ar, id)
    '/(ar|id)/:path*',
    // Auth-protected routes
    '/admin/:path*',
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
