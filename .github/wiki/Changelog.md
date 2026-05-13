# Changelog

## [Unreleased — P7] — 2026-05 (Engineering Excellence Foundation cascade)

> No version bump. P7 ships nothing publicly (Version Lock).

### Changed

- Workspace test config and rate-limit canonical patterns aligned with Ummat monorepo
- `iw_` prefix unchanged; shared backend remains canonical at `api.islam.wiki` → `ummat-prod`
- Naskh font canonical (Noto Naskh Arabic) for Arabic RTL surfaces matches Pro Sites template requirements

### Added

- README P7 status update linking to Engineering Excellence Foundation changes (T-P7-DOC-08)

### Decisions inherited

- D-P7-10 (Umm al-Qura Hijri default) — Islamic content rendering aligns where Hijri dates surface
- D-P7-18 (Stripe TEST only) — N/A directly; Islam.wiki has no billing surface

## [Unreleased — P4]

### Added

- Reading plan API (`/api/reading-plan`) — Ramadan Quran khatm hub integration (P4-C05)
- Du'a rotation API (`/api/dua-rotation`) — daily du'a with 9 locales (P4-C06)
- ChatIslam citation deep-link URL schema (P4-C07) — `islam.wiki/{corpus}/{collection}/...`
- Meilisearch search param contract v1 (P4-C12) — `X-Search-Version: v1` header
- Arabic + Bahasa Indonesia i18n foundations (partial — full i18n deferred to P5)
- nSentry observability wiring (GlitchTip DSN + OTel instrumentation)

---

## [Unreleased]

### Security

- Structured Meilisearch filter API (CVE-internal S9-02, HIGH): `GET /api/search` previously
  accepted a raw `filter=...` query parameter and forwarded it to Meilisearch after only
  checking field names, leaving values unsanitized. This allowed filter injection via crafted
  values (operator keyword smuggling, quote-escape attacks, internal field discovery).
  The raw `filter` param is now rejected outright (`400 Bad Request`). Callers must use the
  new structured `filters` param: a JSON-encoded array of `{field, op, value}` clause objects.
  Field names are validated against an explicit allowlist; values are checked for reserved
  keywords (`AND`, `OR`, `NOT`, `NULL`, etc.) and stripped of quote/backslash characters.
  Implemented in `lib/security/meili-filter-sanitize.ts`. 38 unit tests added.

- contentType allowlist on revisions endpoint (CVE-internal S9-01): `POST /api/revisions`
  previously accepted any string as `contentType`, enabling MIME-type injection and stored-XSS
  via polyglot payloads. A strict allowlist (`text/markdown`, `text/plain`, `text/html`,
  `application/json`) is now enforced via `lib/security/content-type-allowlist.ts`. Requests
  with any other value return `400 Bad Request`. The rejected value is not logged to prevent
  log-injection attacks.

---

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
