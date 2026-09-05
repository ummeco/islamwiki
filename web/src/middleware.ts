// FILE: src/middleware.ts
// PURPOSE: Astro middleware for islam.wiki — ports the Next.js middleware.ts verbatim
//   in behavior: per-request CSP nonce, locale detection + rewrite (/ar/ /id/),
//   /en/ → / 301 redirect, JWT verification (jose JWKS against auth.ummat.dev),
//   role → trust-level mapping, propagation of role/user-id into locals + request
//   headers, and auth-path guards (/admin /auth/ /account /signin /signup */edit).
//
// SECURITY (preserved exactly):
//   - JWT cryptographically verified via createRemoteJWKSet (never trust unsigned claims).
//   - Admin routes require trustLevel >= 4.
//   - CSP nonce is per-request (crypto.randomUUID); nonce exposed via locals.nonce for
//     <script>/<style> tags in layouts. strict-dynamic propagates trust to injected sheets.
//   - x-islamwiki-role / x-islamwiki-user-id forwarded on request headers so API routes
//     can gate without re-verifying the JWT (mirrors Next.js behavior).
// REF: ports islamwiki/web/middleware.ts · P2-E3-W02-S02-T01

import { defineMiddleware } from 'astro:middleware'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { setRuntimeContentBase } from '@/lib/data/runtime-data'

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

const AUTH_URL =
  import.meta.env.NEXT_PUBLIC_AUTH_URL ??
  import.meta.env.PUBLIC_AUTH_URL ??
  'https://auth.ummat.dev'
const JWKS = createRemoteJWKSet(new URL(`${AUTH_URL}/.well-known/jwks.json`))

function extractLocale(pathname: string): { locale: string; strippedPath: string } {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (
    maybeLocale &&
    LOCALES.includes(maybeLocale as (typeof LOCALES)[number]) &&
    maybeLocale !== DEFAULT_LOCALE
  ) {
    const strippedPath = '/' + segments.slice(2).join('/') || '/'
    return { locale: maybeLocale, strippedPath }
  }
  return { locale: DEFAULT_LOCALE, strippedPath: pathname }
}

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Canonical Hasura roles → islamwiki trust levels.
// Must stay in sync with lib/contributor/trust.ts TrustLevel definitions.
const ROLE_TRUST_MAP: Record<string, number> = {
  owner: 5,
  admin: 4,
  moderator: 3,
  curator: 2, // Primary-source submitter — same editorial access as editor
  editor: 2,
  trusted: 1, // Trust level 1: minor edits auto-approved, 5 edits/day cap
  user: 0,
  public: 0,
}

function getTrustLevelFromRole(role: string | undefined): number {
  return ROLE_TRUST_MAP[role ?? 'user'] ?? 0
}

function buildCsp(nonce: string): string {
  // DEV: `astro dev` serves Vite's own client runtime (@vite/client, HMR,
  // astro:scripts/page.js, the dev toolbar) as inline + module scripts that
  // carry no nonce. Under the production policy below those are all blocked,
  // and because 'strict-dynamic' is present the browser ignores host/inline
  // allowances entirely — so NOTHING loads, no island ever hydrates, and every
  // client:load component is inert. That made local development islandless and
  // made e2e tests of any interactive component impossible against the dev
  // server (they saw server-rendered markup that never became interactive).
  //
  // So in dev we drop 'strict-dynamic' (required — it would neuter the
  // allowances below) and permit inline/eval, which Vite's HMR needs, plus the
  // localhost websocket. Production is completely unchanged: still nonce-based
  // with 'strict-dynamic' and no unsafe-inline / unsafe-eval anywhere.
  if (import.meta.env.DEV) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      'media-src https://everyayah.com https://mp3quran.net',
      "font-src 'self' data:",
      "connect-src 'self' ws://localhost:* http://localhost:* https://api.islam.wiki https://everyayah.com https://auth.ummat.dev",
      "frame-ancestors 'none'",
    ].join('; ')
  }

  return [
    "default-src 'self'",
    // nonce allows runtime + analytics scripts; no unsafe-eval.
    // 'strict-dynamic' propagates trust to dynamically-inserted scripts (Astro islands).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com https://analytics.ummat.dev`,
    // style-src: nonce replaces 'unsafe-inline'. 'strict-dynamic' for injected sheets.
    `style-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://fonts.googleapis.com`,
    "img-src 'self' https://api.islam.wiki https://islam.wiki data: blob:",
    'media-src https://everyayah.com https://mp3quran.net',
    "font-src 'self' data:",
    "connect-src 'self' https://api.islam.wiki https://everyayah.com https://auth.ummat.dev https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
  ].join('; ')
}

const SECURITY_HEADERS: Array<[string, string]> = [
  ['X-Frame-Options', 'DENY'],
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
]

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context
  const pathname = url.pathname

  // Pin the runtime content base to the live PUBLIC request origin so SSR data
  // fetches in lib/data/runtime-data.ts resolve to the correct host. On Vercel,
  // context.url.origin is "https://localhost" inside the function — use the
  // forwarded host header instead, and never pin a localhost origin (so the
  // VERCEL_PROJECT_PRODUCTION_URL / PUBLIC_BASE_URL fallbacks win locally).
  const fwdHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const fwdProto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (fwdHost && !fwdHost.includes('localhost') && !fwdHost.startsWith('127.')) {
    setRuntimeContentBase(`${fwdProto}://${fwdHost}`)
  }

  // --- CSP nonce (per-request) ---
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // --- Locale detection ---
  const { locale, strippedPath } = extractLocale(pathname)

  // If /en/ prefix is used explicitly, redirect to unprefixed URL (301)
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const cleanPath = pathname.replace(/^\/en\/?/, '/') || '/'
    return context.redirect(cleanPath, 301)
  }

  // Use the stripped path for auth checks
  const checkPath = strippedPath

  // --- Auth guards (on matching paths only) ---
  const needsAuth =
    checkPath.startsWith('/admin') ||
    checkPath.startsWith('/auth/') ||
    checkPath === '/account' ||
    checkPath === '/signin' ||
    checkPath === '/signup' ||
    checkPath.includes('/edit')

  let role = 'public'
  let trustLevel = 0
  let userId: string | null = null
  let isLoggedIn = false

  if (needsAuth) {
    // Verify JWT from iw_at cookie using JWKS (cryptographic signature verification)
    const token = request.headers
      .get('cookie')
      ?.match(/(?:^|;\s*)iw_at=([^;]+)/)?.[1]
    const jwtPayload = token ? await verifyJWT(decodeURIComponent(token)) : null
    isLoggedIn = jwtPayload !== null

    const jwtRole =
      jwtPayload?.['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    trustLevel = getTrustLevelFromRole(jwtRole)
    role = jwtRole && jwtRole in ROLE_TRUST_MAP ? jwtRole : 'public'
    userId = jwtPayload?.sub ?? null

    // Already logged in? Redirect away from auth pages.
    if (isLoggedIn) {
      if (checkPath === '/account' || checkPath === '/signin' || checkPath === '/signup') {
        return context.redirect('/', 302)
      }
      if (checkPath.startsWith('/auth/') && checkPath !== '/auth/change-password') {
        return context.redirect('/', 302)
      }
    }

    // Protected: must be logged in.
    if (!isLoggedIn) {
      if (checkPath.startsWith('/admin') || checkPath.includes('/edit')) {
        const loginUrl = new URL('/account', url)
        loginUrl.searchParams.set('redirect', pathname)
        return context.redirect(loginUrl.pathname + loginUrl.search, 302)
      }
    }

    // Admin routes: must have trust_level >= 4.
    if (isLoggedIn && checkPath.startsWith('/admin') && trustLevel < 4) {
      return context.redirect('/', 302)
    }
  }

  // Propagate request-scoped values into locals (for pages/islands/API routes).
  context.locals.nonce = nonce
  context.locals.locale = locale
  context.locals.role = role
  context.locals.trustLevel = trustLevel
  context.locals.userId = userId

  // Propagate role/user-id into request headers so API routes can gate without
  // re-verifying the JWT (mirrors the Next.js x-islamwiki-* header forwarding).
  request.headers.set('x-nonce', nonce)
  request.headers.set('x-islamwiki-role', role)
  if (userId) request.headers.set('x-islamwiki-user-id', userId)

  // For non-default locales, rewrite to the stripped path (serve the same page).
  const response =
    locale !== DEFAULT_LOCALE ? await next(strippedPath) : await next()

  // --- Response security headers ---
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)
  response.headers.set('x-locale', locale)
  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value)
  }
  // API routes must never be cached (prevent stale auth/data).
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  return response
})
