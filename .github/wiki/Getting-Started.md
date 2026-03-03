# Getting Started

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

## Setup

```bash
git clone https://github.com/ummeco/islamwiki.git
cd islamwiki/web
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:3001`.

### Environment Variables

Copy `.env.local.example` to `.env.local`. Most features work without any env vars.

### Running Tests

```bash
pnpm test              # unit tests (Vitest)
pnpm test:coverage     # with coverage report
pnpm test:e2e          # E2E tests (Playwright)
```

## Data

All content data lives in `web/data/`:
- `quran/` -- surah metadata, ayah texts, translations, tafsir
- `hadith/` -- collection metadata, books, individual hadith with grading

The data files are JSON and are checked into the repository.
