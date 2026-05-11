# Islam.wiki

An authoritative, scholar-verified Islamic knowledge base. Quran, Hadith, Seerah, scholars, books — for everyone.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/ummeco/islamwiki/ci.yml?branch=main)](https://github.com/ummeco/islamwiki/actions)
[![Version](https://img.shields.io/github/package-json/v/ummeco/islamwiki?filename=web%2Fpackage.json)](https://github.com/ummeco/islamwiki/releases)

**Live:** [islam.wiki](https://islam.wiki)

## Engineering Charter — Required Reading

Before contributing, read [`.github/wiki/ENGINEERING-CHARTER.md`](.github/wiki/ENGINEERING-CHARTER.md). It is the single source of truth for code standards across every Ummeco repo. The most-read sections:

- [§ 21 Common AI-Agent Mistakes](.github/wiki/ENGINEERING-CHARTER.md#21-common-ai-agent-mistakes-read-before-any-change)
- [§ 4 Naming Conventions](.github/wiki/ENGINEERING-CHARTER.md#4-naming-conventions-master-reference)
- [§ 6 Documentation Bar](.github/wiki/ENGINEERING-CHARTER.md#6-documentation-bar)

## What is this

Islam.wiki is a free, community-built Islamic knowledge base covering Quran, Hadith, Seerah, scholars, classical books, and encyclopedic articles. All content follows strict Ahl us-Sunnah wal-Jama'ah theological guidelines and is reviewed through a trust-level editorial system. It is free forever, with no ads and no paywalls.

## Features

- Full Quran with Arabic text, multiple translations, and tafsir (Ibn Kathir, Al-Jalalayn)
- All major Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta, Musnad Ahmad, and more) with grading
- Isnad chain visualization for hadith
- Full-text search across Quran, Hadith, and articles (Meilisearch v0.6+)
- Scholar-verified content — Ahl us-Sunnah wal-Jama'ah theological guidelines
- Trust-level wiki editing system (New → Trusted → Editor → Moderator → Admin)
- SEO-optimized with structured data
- Reading preferences (font size, translation display, Arabic script style)
- Bookmarks and reading progress
- Responsive design with dark mode (WCAG 2.2 AA)
- Multilingual: English, Arabic, Indonesian (French, Turkish, Urdu, Malay coming)

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4 |
| Components | Shadcn/ui base, custom components |
| Backend platform | nSelf (100% — self-hosted PaaS on Hetzner) |
| API | Hasura GraphQL Engine (all data access via GraphQL, no direct SQL) |
| Auth | Hasura Auth — shared SSO at auth.ummat.dev |
| Search | Meilisearch via nSelf search plugin |
| Maps | Leaflet (Seerah interactive maps) |
| Fonts | Amiri (Arabic), Geist (Latin) |
| Testing | Vitest (unit), Playwright (E2E, 3-viewport matrix) |
| Deploy | Vercel (project: ummat-islamwiki) |

## Project Structure

```
islamwiki/
├── web/                  islam.wiki — Next.js web app
│   ├── app/              pages and API routes
│   ├── components/       React components
│   ├── data/             static seed data
│   │   ├── quran/        surahs, ayahs, tafsir, translations
│   │   └── hadith/       collections, books, hadiths
│   ├── lib/              data loading and search
│   └── tests/            unit and E2E tests
└── scripts/              data pipeline and scrapers
```

## Quick Start

Start the shared Ummat backend first (requires nSelf `search` plugin for Meilisearch):

```bash
cd ~/Sites/ummeco/ummat/backend && nself start
```

**Web app:**

```bash
cd web
cp .env.example .env.local   # fill in local Hasura + auth URLs
pnpm install
pnpm dev        # https://www.islamwiki.local.nself.org:8543 (port 8543)
```

## Backend

All data access goes through Hasura GraphQL. DB tables use the `iw_` prefix in the shared Ummat PostgreSQL database. Never use direct SQL or install `pg` / `drizzle-orm` at runtime.

**Local API:** `https://api.islamwiki.local.nself.org:8543/v1/graphql`
**Production API:** `https://api.islam.wiki/v1/graphql`

## Data

Islamic texts are statically compiled into JSON files under `web/data/`. The pipeline in `scripts/` handles fetching, normalizing, and updating content from authoritative sources. All content follows strict Ahl us-Sunnah wal-Jama'ah theological guidelines — see the [wiki](https://github.com/ummeco/islamwiki/wiki) for details.

## Contribute

See [`.github/wiki/Contributing.md`](https://github.com/ummeco/islamwiki/wiki/Contributing) for architecture docs, theological guidelines, content pipeline documentation, and contribution guidelines.

## License

[Apache-2.0](LICENSE)
