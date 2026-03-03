# Islam.wiki Stubs Tracker

Every page, component, and feature that is stubbed in Phase 1. These need real data and functionality in later phases.

## Legend

| Symbol | Meaning |
| --- | --- |
| `[S]` | Stub page (exists, renders, but lacks real content) |
| `[F]` | Functional (works with seed data) |
| `[I]` | Interactive component implemented |
| `[P]` | Placeholder (shows "coming soon" message) |

---

## Pages

### Quran (`/quran`)

| Route | Status | Notes |
| --- | --- | --- |
| `/quran` | [F] | Surah index with all 114 surahs from seed data |
| `/quran/[surah]` | [S] | Shows stub ayah placeholders, no real Arabic text or translations |
| `/quran/[surah]/[ayah]` | [S] | Ayah detail with placeholder text, tafsir section is placeholder |

**Needs Phase 2+:** Real Quran text (Tanzil.net/Quran.com), translations (Sahih International, Pickthall, Yusuf Ali), tafsir content (Ibn Kathir, al-Jalalayn, as-Sa'di), word-by-word analysis, recitation audio.

### Hadith (`/hadith`)

| Route | Status | Notes |
| --- | --- | --- |
| `/hadith` | [F] | 8 collections with metadata |
| `/hadith/[collection]` | [F] | Books listed from seed data |
| `/hadith/[collection]/[book]` | [S] | Shows max 10 stub hadith per book |
| `/hadith/[collection]/[book]/[number]` | [S] | Stub hadith with no real Arabic/English text |

**Needs Phase 2+:** Full hadith text from sunnah.com dataset, hadith grading, isnad chain data, narrator evaluation, cross-references between collections.

### Isnad Chain Viewer

| Component | Status | Notes |
| --- | --- | --- |
| `IsnadChain` | [I] | Component built and integrated, shows empty state placeholder |

**Needs Phase 2+:** Actual isnad chain data for each hadith, narrator evaluation grades, chain diagram with person links.

### Seerah (`/seerah`)

| Route | Status | Notes |
| --- | --- | --- |
| `/seerah` | [F][I] | 20 events with interactive Leaflet map |
| `/seerah/[event]` | [F] | Event detail with sources, map placeholder for individual event |

**Needs Phase 2+:** More events (100+), Hijrah route path overlay, battle maps, migration routes, additional source citations, event relationships.

### People (`/people`)

| Route | Status | Notes |
| --- | --- | --- |
| `/people` | [F][I] | 30 people with interactive Gantt-style timeline |
| `/people/[slug]` | [S] | Basic bio info, no full biography content |

**Needs Phase 2+:** 2,000+ people entries, full biographies, teacher-student relationships, family trees, book authorship links, hadith narration links, places visited map.

### Books (`/books`)

| Route | Status | Notes |
| --- | --- | --- |
| `/books` | [F] | 20 classical books with metadata |
| `/books/[slug]` | [F] | Book detail with author link, no table of contents |
| `/books/[slug]/[chapter]` | [P] | Chapter returns minimal stub, no real content |

**Needs Phase 3:** OCR pipeline for classical texts, chapter content, multi-language translations, AI-assisted translation pipeline, reading progress tracking.

### Articles (`/articles`)

| Route | Status | Notes |
| --- | --- | --- |
| `/articles` | [F] | 15 article stubs with categories and tags |
| `/articles/[slug]` | [S] | Article metadata only, no body content |

**Needs Phase 2+:** 12,000+ articles with full content, citations, cross-references, related articles, edit history.

### Videos (`/videos`)

| Route | Status | Notes |
| --- | --- | --- |
| `/videos` | [F] | 1 video entry (Yasir Qadhi Seerah) |
| `/videos/[slug]` | [S] | External URL embed placeholder, no transcript |

**Needs Phase 2+:** Full video library, YouTube/Vimeo embeds, AI-generated transcripts, searchable transcripts, speaker profiles.

### Audio (`/audio`)

| Route | Status | Notes |
| --- | --- | --- |
| `/audio` | [F] | 2 audio entries |
| `/audio/[slug]` | [S] | External URL link, no player or transcript |

**Needs Phase 2+:** Audio player, Quran recitations, lecture series, AI-generated transcripts, playlist support.

### Sects (`/sects`)

| Route | Status | Notes |
| --- | --- | --- |
| `/sects` | [F] | 15 sects in tree view with status badges |
| `/sects/[slug]` | [F] | Sect detail with key beliefs and parent/children |

**Needs Phase 2+:** More detailed refutation/evidence sections, scholarly citations, historical context expansion.

### Wiki (`/wiki`)

| Route | Status | Notes |
| --- | --- | --- |
| `/wiki/[...slug]` | [F] | 4 meta pages (about, contribute, guidelines, contact) |

**Needs Phase 2+:** User-editable wiki system, revision history, AI review pipeline, edit approval workflow.

### Search (`/search`)

| Route | Status | Notes |
| --- | --- | --- |
| `/search` | [F] | Client-side search across all seed data via API route |

**Needs Phase 2+:** PostgreSQL full-text search (tsvector), Quran verse search, hadith text search, relevance scoring, search suggestions, filters.

### Auth (`/auth`)

| Route | Status | Notes |
| --- | --- | --- |
| `/auth/login` | [P] | Login form UI, no backend |
| `/auth/register` | [P] | Register form UI with trust level explanation, no backend |

**Needs Phase 2:** Supabase Auth integration, email verification, trust level system, OAuth (Google, Apple).

### Profile (`/profile`)

| Route | Status | Notes |
| --- | --- | --- |
| `/profile/[username]` | [P] | Profile page layout, no real data |

**Needs Phase 2:** User profile with edit history, contributions, trust level display.

### Admin (`/admin`)

| Route | Status | Notes |
| --- | --- | --- |
| `/admin` | [P] | Dashboard layout with placeholder stats |

**Needs Phase 2:** Content management, user management, edit review queue, moderation tools, analytics.

---

## Components

| Component | Status | Notes |
| --- | --- | --- |
| `SeerahMap` | [I] | Leaflet map with dark tiles, circle markers, popups |
| `SeerahMapWrapper` | [I] | SSR-safe dynamic import wrapper |
| `PeopleTimeline` | [I] | Horizontal scrollable Gantt chart by era |
| `IsnadChain` | [I] | Vertical chain viewer with empty state |
| `SearchBar` | [F] | Client-side search form |
| `Header` | [F] | Responsive nav with mobile menu |
| `Footer` | [F] | 4-column footer with ecosystem links |
| `WebsiteJsonLd` | [F] | Schema.org structured data |
| `BreadcrumbJsonLd` | [F] | Breadcrumb structured data (not yet used on all pages) |
| `ArticleJsonLd` | [F] | Article structured data (not yet used) |

---

## Data

| Dataset | Entries | Status | Source |
| --- | --- | --- | --- |
| Quran surahs | 114 | [F] Metadata complete | Manual (verified) |
| Quran ayahs | 6,236 | [S] Stub placeholders | Needs: Tanzil.net, Quran.com |
| Hadith collections | 8 | [F] Metadata complete | Manual |
| Hadith books | ~28 | [F] Sample per collection | Needs: sunnah.com |
| Hadith entries | 0 real | [S] Generated stubs | Needs: sunnah.com API |
| People/scholars | 30 | [F] Seed data | Needs: 2,000+ from CSV + sources |
| Books | 20 | [F] Classical texts metadata | Needs: 500+ |
| Seerah events | 20 | [F] Major events with coordinates | Needs: 100+ |
| Articles | 15 | [S] Metadata only, no content | Needs: 12,000+ |
| Media | 3 | [S] External URL stubs | Needs: full library |
| Sects | 15 | [F] With key beliefs and hierarchy | Content adequate |
| Wiki pages | 4 | [F] Meta pages | Needs: user-editable system |

---

## Features Not Yet Implemented

1. **Authentication** -- Supabase Auth, trust levels, session management
2. **Wiki Editing** -- Content editing, revision tracking, AI review pipeline
3. **Multilingual** -- AR/ID URL routing, RTL layout, translated content
4. **Backend API** -- Hasura + PostgreSQL via nSelf CLI
5. **Content Download Pipeline** -- Automated downloading from Tanzil.net, sunnah.com, etc.
6. **AI Translation** -- Claude-powered translation with human review
7. **Advanced Search** -- PostgreSQL full-text, faceted search, autocomplete
8. **User Contributions** -- Edit submissions, review queue, reputation system
9. **Content Relationships** -- Person-to-book, person-to-hadith, article cross-references
10. **Mobile App** -- Flutter iOS/Android
11. **Offline Support** -- Service worker, cached content
12. **Notifications** -- Edit approval alerts, new content alerts
13. **API Rate Limiting** -- For public API access
14. **CDN Optimization** -- Image optimization, static asset caching
15. **Analytics** -- Usage tracking, popular content, search analytics
