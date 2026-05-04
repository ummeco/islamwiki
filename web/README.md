# Islam.wiki — Web App

Islamic knowledge base at [islam.wiki](https://islam.wiki). Quran, Hadith, books, full-text search, reading plans, and du'a rotation.

## P4 Features Shipped

- Reading plan API (`/api/reading-plan`) — Ramadan Quran khatm hub integration (P4-C05)
- Du'a rotation API (`/api/dua-rotation`) — daily du'a with 9 locales (P4-C06)
- ChatIslam citation deep-link URL schema (P4-C07) — `islam.wiki/{corpus}/{collection}/...`
- Meilisearch search param contract v1 (P4-C12) — `X-Search-Version: v1` header
- Arabic + Bahasa Indonesia i18n foundations (partial — full i18n deferred to P5)
- nSentry observability wiring (GlitchTip DSN + OTel instrumentation)

## Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · Meilisearch · Hasura GraphQL

## Dev

```bash
pnpm install
pnpm dev --port 3040
```

Local URL: `https://www.islamwiki.local.nself.org:8543`

Backend: `https://api.islamwiki.local.nself.org:8543/v1/graphql`

## Environment Variables

```env
# Server-only
REMOTE_SCHEMA_SECRET=            # Hasura Remote Schema auth
HASURA_GRAPHQL_ADMIN_SECRET=     # Server-side admin queries
MEILISEARCH_ADMIN_KEY=           # Index administration
OTEL_EXPORTER_OTLP_ENDPOINT=     # Observability (optional)
OTEL_SERVICE_NAME=islamwiki

# Client + server
NEXT_PUBLIC_HASURA_URL=https://api.islamwiki.local.nself.org:8543/v1/graphql
NEXT_PUBLIC_AUTH_URL=https://auth.local.nself.org:8543
NEXT_PUBLIC_MEILISEARCH_HOST=
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=   # Read-only search key
```

See `.env.example` for full list.

## External Dependencies

- `acamarata/pray-calc` — prayer time calculation library
- Meilisearch — full-text search (via nSelf search plugin)
- Hasura Auth — SSO at `auth.ummat.dev`

## Production

Vercel project: `ummat-islamwiki` · Domain: `islam.wiki`

Backend: `https://api.ummat.dev/v1/graphql` (prod) | `https://api.islamwiki.local.nself.org:8543/v1/graphql` (local)
