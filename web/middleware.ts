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

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // nonce allows Next.js runtime + Vercel analytics scripts; no unsafe-eval
    `script-src 'self' 'nonce-${nonce}' https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://api.islam.wiki https://islam.wiki data: blob:",
    "media-src https://everyayah.com https://mp3quran.net",
    "font-src 'self' data:",
    "connect-src 'self' https://api.islam.wiki https://everyayah.com https://auth.ummat.dev https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- CSP nonce ---
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // --- Locale detection ---
  const { locale, strippedPath } = extractLocale(pathname)

  // If /en/ prefix is used explicitly, redirect to unprefixed URL
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const cleanPath = pathname.replace(/^\/en\/?/, '/') || '/'
    return NextResponse.redirect(new URL(cleanPath, request.url), 301)
  }

  // Forward x-nonce to RSCs via request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // For non-default locales, rewrite to actual path and set locale header
  let response: NextResponse
  if (locale !== DEFAULT_LOCALE) {
    const rewriteUrl = new URL(strippedPath, request.url)
    response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Set security headers on response
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)
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
    // All routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
