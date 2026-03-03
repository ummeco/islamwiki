# Architecture

## Project Structure

```
islamwiki/
├── web/                        islam.wiki (Next.js 15)
│   ├── app/                    App Router pages
│   │   ├── quran/              Quran browser (/quran, /quran/[surah], /quran/[surah]/[ayah])
│   │   ├── hadith/             Hadith browser (/hadith, /hadith/[collection], etc.)
│   │   ├── books/              Classical books (/books/[slug])
│   │   ├── people/             Biographical entries
│   │   ├── sects/              Islamic groups and movements
│   │   ├── seerah/             Prophet's biography timeline
│   │   ├── admin/              Admin tools (AI review dashboard)
│   │   └── api/                API routes (og images, search)
│   ├── components/             React components
│   │   ├── quran/              Quran viewer, tafsir panel, bookmarks
│   │   ├── hadith/             Hadith display, isnad chain visualization
│   │   ├── listings/           Grid layouts for content browsing
│   │   └── auth/               Authentication components
│   ├── data/                   Static JSON data (~600MB)
│   │   ├── quran/              surah, ayah, tafsir, translation data
│   │   └── hadith/             collection, book, hadith data
│   ├── lib/                    Data loading utilities, search
│   └── tests/                  Unit (Vitest) + E2E (Playwright)
└── scripts/                    Data pipeline and scrapers
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Data storage | Static JSON files (compiled from authoritative sources) |
| Search | Client-side search index |
| Testing | Vitest, Playwright |
| Hosting | Vercel |

## Data Flow

1. Raw Islamic texts sourced from authoritative APIs and databases
2. Scripts normalize data into structured JSON
3. JSON files are committed to the repository
4. Next.js loads data at build time and runtime via file-based data loaders
5. Client-side search index built from the JSON data
