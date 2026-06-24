# islamwiki/editor — Vite 7 + React 19 SPA Editor Surface

Authenticated wiki editor for Islam.wiki contributors and moderators.

**Domain:** `editor.islam.wiki` (editor Vercel zone, rewrites from `islam.wiki/edit/*`)
**Vercel project:** `ummat-islamwiki-editor` (new)
**Stack:** Vite 7 + React 19 + TipTap + Tailwind + @ummat/graphql-client + @ummat/auth-core

## Architecture

This is the authed editor zone of the [Islam.wiki two-surface split](../../../.claude/docs/p2-islamwiki-astro-vite-spec.md).

- All routes protected by `AuthGuard` (httpOnly cookie, C1 per ADR-005)
- TipTap editor with 4 Islamic extensions: ArabicQuoteBlock, QuranVerse, HadithBlock, CitationFootnote
- Article status machine: `draft → pending_review → approved → published`
- Theology gate: `iw_trigger_theology_check` called on every submit-for-review
- Moderators CANNOT approve a revision with `theology_check.status = 'failed'`
- Cache purge fires via `/api/purge-cache` (Astro SSR endpoint) after approval

## Routes

| Path | Role | Purpose |
|---|---|---|
| `/edit` | contributor | List my drafts |
| `/edit/new` | contributor | Create new article |
| `/edit/:slug` | contributor | Edit article |
| `/review` | moderator | Moderation queue |
| `/review/:slug` | moderator | Review single article |
| `/admin/*` | admin | Admin dashboard |

## Dev

```bash
pnpm dev       # http://localhost:3042
pnpm build     # production build (tsc + vite build)
pnpm typecheck # tsc --noEmit
```

## TipTap Islamic Extensions

| Extension | Purpose |
|---|---|
| `ArabicQuoteBlock` | RTL blockquote with source attribution |
| `QuranVerse` | Structured node: verse + surah + ayah + translation |
| `HadithBlock` | Structured node: matn + chain + grading + collection |
| `CitationFootnote` | Inline superscript citation with source metadata |
