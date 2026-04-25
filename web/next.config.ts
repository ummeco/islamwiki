import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? 'ummeco',
  project: process.env.SENTRY_PROJECT ?? 'islamwiki-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
})
