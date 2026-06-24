/**
 * FILE: astro.config.ts
 * PURPOSE: Astro 5 SSR configuration for islamwiki/read (islam.wiki public read surface).
 *   Integrates @ummat/astro-preset for brand tokens + RTL direction.
 *   Output: server-side rendered via @astrojs/vercel adapter.
 *   Cache headers: public, s-maxage=300 on article pages (§5.2 of spec).
 * INPUTS: None — resolved from environment at build time.
 * OUTPUTS: Vercel Serverless Functions, edge-ready SSR.
 * CONSTRAINTS:
 *   - prerender = false on all article pages (SSR only — never SSG).
 *   - Multi-zone rewrites delegate /edit /review /admin to editor zone.
 *   - CSP nonce injected via middleware (FGAP-03).
 * REF: P2-E3-W02-S02-T01 · p2-islamwiki-astro-vite-spec.md §2
 */

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';
import sentry from '@sentry/astro';
import { astroUmmat } from '@ummat/astro-preset';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
  site: 'https://islam.wiki',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    astroUmmat({
      injectBrandTokens: true,
      setRtlDirection: true,
      urqlSsr: true,
    }),
    react(),
    tailwind({ configFile: './tailwind.config.ts' }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          ar: 'ar',
        },
      },
    }),
    sentry({
      dsn: process.env.SENTRY_DSN_ISLAMWIKI,
      sourceMapsUploadOptions: {
        project: 'islamwiki-read',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_GRAPHQL_URL': JSON.stringify(
        process.env.PUBLIC_GRAPHQL_URL ?? 'https://api.ummat.dev/v1/graphql'
      ),
    },
  },
});
