// FILE: astro.config.mjs
// PURPOSE: Astro 5 SSR configuration for islam.wiki (Islamic knowledge base).
//
// Stack decision: D-P2-STACK-CANON — Astro for content/SEO, React islands for
// interactive auth/edit widgets via client:load. Ports the Next.js 15 app.
//
// CONSTRAINTS:
//   - output: 'server' (SSR) via @astrojs/vercel/serverless adapter.
//   - React 19 islands via @astrojs/react.
//   - Tailwind v4 via @tailwindcss/vite (NOT @astrojs/tailwind — v4 is a Vite plugin).
//   - Slug→numeric surah redirects ported from next.config.ts (data/quran/surahs.json).
//   - Auth aliases ported from next.config.ts (/auth/login, /signin, /auth/register → /account).
//   - No Next.js, no next/* imports, no next.config.ts.
// REF: P2-E3-W02-S02-T01 · D-P2-STACK-CANON · ports next.config.ts redirects()

import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/serverless'
import sitemap from '@astrojs/sitemap'
import sentry from '@sentry/astro'
import tailwindcss from '@tailwindcss/vite'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

// Slug-based URLs redirect to canonical numeric URLs: /quran/al-baqarah → /quran/2
// Ported verbatim from next.config.ts redirects(). 114 surahs × 2 patterns = 228 entries.
const surahs = require('./data/quran/surahs.json')
const surahRedirects = {}
for (const s of surahs) {
  surahRedirects[`/quran/${s.slug}`] = `/quran/${s.number}`
  surahRedirects[`/quran/${s.slug}/[ayah]`] = `/quran/${s.number}/[ayah]`
}

export default defineConfig({
  site: 'https://islam.wiki',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false }, // Umami handles analytics (D-P3-21)
    imageService: true,
  }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'id'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  redirects: {
    ...surahRedirects,
    // Auth aliases — ported from next.config.ts redirects()
    '/auth/login': '/account',
    '/auth/register': '/account',
    '/signin': '/account',
  },
  integrations: [
    react(),
    sitemap(),
    sentry({
      dsn: process.env.SENTRY_DSN_ISLAMWIKI ?? process.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        org: process.env.SENTRY_ORG ?? 'ummeco',
        project: process.env.SENTRY_PROJECT ?? 'islamwiki-web',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss()],
    build: {
      // @astrojs/react v5 destructuring params can't lower to legacy targets.
      target: 'es2022',
    },
    esbuild: {
      target: 'es2022',
    },
    optimizeDeps: {
      esbuildOptions: { target: 'es2022' },
    },
    define: {
      // Expose public env vars to client islands
      'import.meta.env.PUBLIC_HASURA_URL': JSON.stringify(process.env.PUBLIC_HASURA_URL ?? ''),
      'import.meta.env.PUBLIC_AUTH_URL': JSON.stringify(process.env.PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'),
      'import.meta.env.PUBLIC_BASE_URL': JSON.stringify(process.env.PUBLIC_BASE_URL ?? 'https://islam.wiki'),
    },
    ssr: {
      // ioredis is an optional runtime dep (Redis rate-limit adapter) — keep external.
      external: ['ioredis'],
      // `import 'server-only'` is the Next.js/RSC guard used throughout lib/** (hasura-admin,
      // auth, ai/*, data/*, contributor/*). That package only resolves to a no-op (empty.js)
      // under the `react-server` export condition; otherwise its index.js throws on load.
      // Astro server-renders .astro frontmatter — legitimate server code that imports these
      // libs. We force Vite to BUNDLE server-only into the SSR output (noExternal) and apply
      // the `react-server` condition (ssr.resolve) so it inlines the no-op empty.js — exactly
      // as Next.js does for Server Components. Without noExternal, Node's own CJS resolver
      // loads the default (throwing) index.js at prerender time. The CLIENT build gets neither
      // setting: if any island imported a server-only lib at runtime, the client build would
      // still throw at build time, preserving the admin-secret boundary. Secrets stay server-only.
      noExternal: ['server-only'],
      resolve: {
        conditions: ['react-server'],
      },
    },
  },
})
