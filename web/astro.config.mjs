// FILE: astro.config.mjs
// PURPOSE: Astro 6 SSR configuration for islam.wiki (Islamic knowledge base).
//
// Stack decision: D-P2-STACK-CANON — Astro for content/SEO, React islands for
// interactive auth/edit widgets via client:load. Ports the Next.js 15 app.
//
// CONSTRAINTS:
//   - output: 'server' (SSR) via the @astrojs/vercel adapter (v10; the /serverless
//     subpath was collapsed into the root export in v8).
//   - React 19 islands via @astrojs/react.
//   - Tailwind v4 via @tailwindcss/vite (NOT @astrojs/tailwind — v4 is a Vite plugin).
//   - Slug→numeric surah redirects ported from next.config.ts (data/quran/surahs.json).
//   - Auth aliases ported from next.config.ts (/auth/login, /signin, /auth/register → /account).
//   - No Next.js, no next/* imports, no next.config.ts.
// REF: P2-E3-W02-S02-T01 · D-P2-STACK-CANON · ports next.config.ts redirects()

import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
// @astrojs/vercel v8 collapsed the /serverless and /static entrypoints into a
// single root export; the subpath no longer exists in the package's exports map.
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import sentry from '@sentry/astro'
import tailwindcss from '@tailwindcss/vite'
import { defaultServerConditions } from 'vite'

import { createRequire } from 'node:module'
import { cp, mkdir, readdir, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const require = createRequire(import.meta.url)

/**
 * copyContentData — Astro integration that publishes the on-disk content corpus
 * (`data/`) as STATIC assets under `/content-data/` in the build output, instead of
 * letting it get bundled into the Vercel serverless function.
 *
 * WHY: The two SSR pages used to import the fs-backed readers in lib/data/*, whose
 *   readFileSync(process.cwd()/data/...) calls made Vercel's nft tracer pull the entire
 *   ~1GB data/ into the function (over the 250MB limit). Those pages now fetch single
 *   records over HTTP from /content-data/ via lib/data/runtime-data.ts. This hook copies
 *   data/ into the static output so those URLs resolve, and emits a `chapters.json`
 *   manifest per book directory (HTTP has no readdir, so the runtime reader needs an
 *   explicit list of chapter numbers).
 *
 * RUNS: astro:build:done — after the Vercel adapter has written .vercel/output/static.
 *   `dir` is the configured outDir; the Vercel adapter also mirrors to
 *   .vercel/output/static. We copy into BOTH the reported dir and the Vercel static dir
 *   if present, so the assets ship regardless of which path Vercel serves from.
 */
function copyContentData() {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url))
  const dataDir = path.join(projectRoot, 'data')

  async function emitBookManifests(targetContentDir) {
    const booksDir = path.join(targetContentDir, 'books')
    if (!existsSync(booksDir)) return
    const entries = await readdir(booksDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const bookDir = path.join(booksDir, entry.name)
      const files = await readdir(bookDir)
      const numbers = files
        .filter((f) => /^\d+\.json$/.test(f))
        .map((f) => parseInt(f.replace(/\.json$/, ''), 10))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b)
      if (numbers.length === 0) continue
      await writeFile(path.join(bookDir, 'chapters.json'), JSON.stringify({ numbers }))
    }
  }

  async function publishTo(staticRoot) {
    if (!existsSync(dataDir)) return
    const target = path.join(staticRoot, 'content-data')
    await mkdir(target, { recursive: true })
    await cp(dataDir, target, { recursive: true })
    await emitBookManifests(target)
  }

  return {
    name: 'copy-content-data',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const log = logger ?? console
        const candidates = new Set()
        // Astro-reported output dir (file:// URL).
        try {
          candidates.add(fileURLToPath(dir))
        } catch {
          /* dir may already be a path string */
          if (typeof dir === 'string') candidates.add(dir)
        }
        // Vercel adapter static output.
        const vercelStatic = path.join(projectRoot, '.vercel', 'output', 'static')
        if (existsSync(vercelStatic)) candidates.add(vercelStatic)

        for (const root of candidates) {
          try {
            const s = await stat(root).catch(() => null)
            if (!s || !s.isDirectory()) continue
            await publishTo(root)
            log.info?.(`[copy-content-data] published data/ → ${path.join(root, 'content-data')}`)
          } catch (err) {
            log.warn?.(`[copy-content-data] skip ${root}: ${err}`)
          }
        }
      },
    },
  }
}

/**
 * serverOnlyResolution — Vite plugin that applies the `server-only` guard's own
 * `react-server` export condition to EVERY server-side Vite environment.
 *
 * WHY THIS EXISTS (Astro 6 regression):
 *   `import 'server-only'` is the RSC marker used across lib/** (hasura-admin, auth,
 *   oauth, admin-guard, data/*, contributor/*). The package exports a no-op `empty.js`
 *   under the `react-server` condition and a module that THROWS on load under any other.
 *   That throw is the guard: an island that reaches an admin-secret module drags the
 *   throwing index.js into its client chunk, so the island dies loudly on first load
 *   instead of the secret quietly shipping. (Verified by experiment, 2026-09-04: adding
 *   `import '../../../lib/hasura-admin'` to SearchInput.tsx put the throw into
 *   dist/client/_astro/SearchInput.*.js. Note it is a load-time throw in the browser,
 *   NOT a build-time error — the build stays green. Same before and after this change.)
 *
 *   Astro 5 had a single server Vite environment, so the `vite.ssr.noExternal` +
 *   `vite.ssr.resolve.conditions` block below covered the whole server build.
 *   Astro 6 splits the server build into TWO Vite environments — `ssr` and a separate
 *   `prerender` one (output: dist/server/.prerender/). Vite backfills the top-level
 *   `ssr.*` shorthand into the `ssr` environment ONLY, so the prerender pass reverted to
 *   defaults: `server-only` stayed external, and Node's own CJS resolver (which has no
 *   `react-server` condition) loaded the throwing index.js while generating pages.
 *   Astro's own source calls this out in core/constants.ts: "If your plugin runs in
 *   ASTRO_VITE_ENVIRONMENT_NAMES.ssr, you might want to add ...prerender too."
 *
 *   Declaring `vite.environments.prerender.resolve` in this config does NOT work:
 *   Astro's createViteBuildConfig() spreads the user `environments` and then reassigns
 *   `environments.prerender` wholesale to its own `{ build }` object, dropping any
 *   sibling `resolve`. The `configEnvironment` plugin hook runs later, during Vite's
 *   config resolution, and its return value is merged in — so it survives.
 *
 * WHAT THIS DOES NOT DO: it never touches the `client` environment, so a client island
 *   that reaches one of the guarded libs still resolves `server-only` to the throwing
 *   index.js exactly as it did on Astro 5. The admin-secret boundary is unchanged; this
 *   only grants the SERVER environments the resolution the package already ships for
 *   them. Do NOT "fix" a future recurrence by aliasing server-only to an empty module
 *   globally (the way vitest.config.ts does for tests) — that would delete the guard on
 *   the one side it actually protects.
 */
const SERVER_ENVIRONMENTS = new Set(['ssr', 'prerender', 'astro'])

function serverOnlyResolution() {
  return {
    name: 'islamwiki:server-only-resolution',
    configEnvironment(name) {
      // Astro's server-side environments (core/constants.ts ASTRO_VITE_ENVIRONMENT_NAMES):
      // `ssr` (the deployed server bundle), `prerender` (the static-generation pass) and
      // `astro` (the runnable dev variant of ssr). `client` is deliberately excluded — see
      // the WHAT THIS DOES NOT DO note above. Matching on the name rather than
      // `config.consumer` is required: consumer is not resolved yet when this hook runs.
      if (!SERVER_ENVIRONMENTS.has(name)) return
      return {
        resolve: {
          conditions: ['react-server', ...defaultServerConditions],
          noExternal: ['server-only'],
        },
      }
    },
  }
}

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
    // Keep the 1GB content corpus OUT of the serverless function. The SSR pages read
    // single records over HTTP from /content-data/ (lib/data/runtime-data.ts), and the
    // copyContentData() integration publishes data/ as static assets. Excluding data/**
    // here stops Vercel's nft tracer from bundling any residual data files into the
    // function, keeping it well under the 250MB limit.
    excludeFiles: ['./data/**/*'],
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
    copyContentData(),
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
    plugins: [tailwindcss(), serverOnlyResolution()],
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
      // loads the default (throwing) index.js. On Astro 6 this block reaches the `ssr`
      // environment ONLY — see serverOnlyResolution() above, which extends it to the
      // separate `prerender` environment where the static-generation pass actually runs.
      noExternal: ['server-only'],
      resolve: {
        conditions: ['react-server', ...defaultServerConditions],
      },
    },
  },
})
