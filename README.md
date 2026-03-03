# Islam.wiki

Comprehensive Islamic knowledge base. Quran, Hadith, classical books, biographies, and encyclopedic articles. Free forever.

**Live:** [islam.wiki](https://islam.wiki)

## Features

- Full Quran with Arabic text, multiple translations, and tafsir (Ibn Kathir, Al-Jalalayn)
- All major Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta, Musnad Ahmad, and more) with grading
- Isnad chain visualization for hadith
- Full-text search across Quran, Hadith, and articles
- Reading preferences (font size, translation display, Arabic script style)
- Bookmarks and reading progress
- SEO-optimized with structured data
- Responsive design with dark mode

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Data | Static JSON (Quran ayahs, Hadith collections) |
| Search | Client-side search index |
| Testing | Vitest (unit), Playwright (E2E) |

## Project Structure

```
islamwiki/
├── web/                  islam.wiki — Next.js web app
│   ├── app/              pages and API routes
│   ├── components/       React components
│   ├── data/             static JSON data
│   │   ├── quran/        surahs, ayahs, tafsir, translations
│   │   └── hadith/       collections, books, hadiths
│   ├── lib/              data loading and search
│   └── tests/            unit and E2E tests
└── scripts/              data pipeline and scrapers
```

## Getting Started

```bash
cd web
pnpm install
pnpm dev        # http://localhost:3001
```

## Data

All Islamic texts are statically compiled into JSON files under `web/data/`. The data pipeline in `scripts/` handles fetching, normalizing, and updating content from authoritative sources.

## Contributing

See the [wiki](https://github.com/ummeco/islamwiki/wiki) for architecture docs, theological guidelines, content pipeline documentation, and contribution guidelines.

## License

[MIT](LICENSE)
