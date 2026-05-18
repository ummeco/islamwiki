import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withBundleAnalyzer from '@next/bundle-analyzer'

// T12: Bundle analyzer — run with ANALYZE=true pnpm build
const analyzeBundles = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

// S9-28: i18n locale config. Handled in middleware.ts (custom routing) — Next.js
// App Router doesn't use next.config i18n for routing, but we declare locales here
// for next-intl compatibility and to ensure the router knows the locale surface.
// URL prefix: /ar/, /id/ (auto-detected via Accept-Language header; /en/ redirects to /).
const I18N_LOCALES = ['en', 'ar', 'id'] as const

// CSP is applied per-request in middleware.ts with a unique nonce (removes unsafe-eval/unsafe-inline for scripts)
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

// outputFileTracingExcludes is at root level (not experimental) in Next.js 16
// Cast to any since it's not yet in the public NextConfig type definition
const nextConfig: any = {
  // All content pages are statically generated — exclude large data directories
  // from serverless function bundles (they're only needed at build time)
  outputFileTracingExcludes: {
    '*': [
      './data/hadith/**',
      './data/quran/**',
      './data/relations/**',
      './data/qa/**',
      './data/seerah/**',
      './data/people/**',
      './data/articles/**',
      './data/wiki/**',
      './data/media/**',
      './data/taxonomy/**',
      './data/sects/**',
    ],
  },
  images: {
    // T-P7-Q-PERF-06: AVIF first, WebP fallback. Next.js handles JPEG/PNG fallback automatically.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.islam.wiki',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // T11: API routes must never be cached — prevent stale auth/data responses.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
  webpack(config: any) {
    // ioredis is an optional runtime dep (Redis adapter). Mark as external so
    // Webpack/Turbopack doesn't try to bundle it during the Next.js build.
    config.externals = [...(config.externals ?? []), 'ioredis']
    return config
  },
  async redirects() {
    // Slug-based URLs redirect to canonical numeric URLs: /quran/al-baqarah → /quran/2
    const surahs = require('./data/quran/surahs.json') as Array<{ number: number; slug: string }>
    const slugRedirects = surahs.flatMap((s) => [
      { source: `/quran/${s.slug}`, destination: `/quran/${s.number}`, permanent: true },
      { source: `/quran/${s.slug}/:ayah`, destination: `/quran/${s.number}/:ayah`, permanent: true },
    ])
    return [
      ...slugRedirects,
      {
        source: '/auth/login',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/account',
        permanent: true,
      },
    ]
  },
}

// S9-05 / T25.07: Source maps uploaded to self-hosted GlitchTip at errors.ummat.dev.
// SENTRY_AUTH_TOKEN (=GLITCHTIP_AUTH_TOKEN) must be set in the Vercel project env.
export default withSentryConfig(analyzeBundles(nextConfig), {
  org: process.env.SENTRY_ORG ?? 'ummeco',
  project: process.env.SENTRY_PROJECT ?? 'islamwiki-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Upload source maps when SENTRY_AUTH_TOKEN is present (CI/Vercel), hide from browser
  sourcemaps: process.env.SENTRY_AUTH_TOKEN
    ? { disable: false, deleteSourcemapsAfterUpload: true }
    : { disable: true },
  disableLogger: true,
  automaticVercelMonitors: false,
})
