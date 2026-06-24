# islamwiki/read — Astro 5 SSR Read Surface

Public-facing article read surface for Islam.wiki. Server-rendered on every request for fresh content indexing.

**Domain:** `islam.wiki` (primary Vercel zone)
**Vercel project:** `ummat-islamwiki`
**Stack:** Astro 5 + React 19 islands + Tailwind + @ummat/astro-preset

## Architecture

This is the public read zone of the [Islam.wiki two-surface split](../../../.claude/docs/p2-islamwiki-astro-vite-spec.md).

- All article pages are SSR (`prerender = false`) — never SSG
- Cache: `public, s-maxage=300, stale-while-revalidate=60`
- Multi-zone rewrites: `/edit/*`, `/review/*`, `/admin/*` → editor zone (`editor.islam.wiki`)
- RTL Arabic articles via `@ummat/i18n/direction`
- Hijri dates via `@ummat/shared/hijri.toHijri`

## Dev

```bash
pnpm dev       # http://localhost:3041
pnpm build     # production build
pnpm typecheck # astro check + tsc
```

## Environment

Copy `.env.example` → `.env.local`. Required: `PUBLIC_GRAPHQL_URL`, `VERCEL_TOKEN` (for cache purge).

## Key files

- `src/pages/wiki/[slug].astro` — article read page
- `src/pages/ar/wiki/[slug].astro` — Arabic article read page
- `vercel.json` — multi-zone rewrite config
- `src/pages/api/purge-cache.ts` — cache purge endpoint (server-side, VERCEL_TOKEN stays private)
