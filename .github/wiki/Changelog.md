# Changelog

## [0.1.1] - 2026-04-25

### Phase 1 Foundation Hardening

**Security**
- XSS hardening across 5 Server Component pages: sanitize.ts now uses `FORCE_BODY` + `WHOLE_DOCUMENT: false` + `stripDataUris`
- JSON-LD safe escaping applied to all 8 schema types (prevents script injection via structured data)
- Meilisearch filter allowlist rejects `_geoRadius`, `_geoBoundingBox`, and other undeclared filter keys
- JWT JWKS verification via `jose` in edge middleware, `x-islamwiki-user-id` header propagated to API routes
- Trusted role mapping at level 1, capped at 5 promotions/day
- Primary-source content-type allowlist restricts Quran and Hadith content submissions to curator+ roles
- CSP nonce hardening extended to `style-src` and `script-src`
- DOMPurify upgraded to v3.10

**Infrastructure**
- Rate limiter refactored to adapter pattern (memory adapter for Phase 1, Redis adapter for Phase 3+)
- 70k-hadith sitemap generation
- Anthropic-only AI pipeline (OpenAI dependency removed)
- `ioredis` added as dev dependency for optional Redis rate-limit adapter

**Pages**
- `/donate` — Phase 1 stub with Phase 2 Stripe checkout pending
- `/privacy`, `/terms`, `/cookies` — legal pages
- `/legal/california` — AB488 California legal disclosure
- Age gate component
- AB488 banner component

**Observability**
- Sentry config (DSN via `SENTRY_DSN` env var)
- Umami analytics integration

**Fixes**
- TypeScript: `checkRateLimit` 3-arg legacy overload added explicitly
- TypeScript: `next.config.ts` Sentry `hideSourceMaps` replaced with `sourcemaps: { disable: true }`
- Lint: Removed stale `eslint-disable` directives in rate-limit adapter files
- Donate page: replaced cross-repo import with self-contained Phase 1 stub

## [0.1.0] - 2026-04-01

### Phase 1 Foundation

Initial public launch of Islam.wiki. Full Quran, all major Hadith collections, People biographies, Seerah timeline, Sects reference, Books browser, full-text search, SEO, dark mode, and static generation.
