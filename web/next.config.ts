import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://api.islam.wiki https://islam.wiki data: blob:",
      "media-src https://everyayah.com https://mp3quran.net",
      "font-src 'self' data:",
      "connect-src 'self' https://api.islam.wiki https://everyayah.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

const nextConfig: NextConfig = {
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

export default nextConfig
