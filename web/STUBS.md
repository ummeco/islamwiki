# Islam.wiki Status Tracker

Current state of every section, component, and dataset. Updated 2026-03-08.

## Legend

| Symbol | Meaning |
| --- | --- |
| `[F]` | Functional with real data |
| `[I]` | Interactive component implemented |
| `[P]` | Partial (works but needs more content) |
| `[B]` | Blocked (needs data pipeline or backend) |

---

## Pages

### Quran (`/quran`)

| Route | Status | Notes |
| --- | --- | --- |
| `/quran` | [F] | 114 surahs, search, grid layout |
| `/quran/[surah]` | [F][I] | Real Arabic + 14 translations, section/verse mode, audio player, transliteration |
| `/quran/[surah]/[ayah]` | [F] | Ayah detail with tafsir (AI-powered via Claude API) |

**Done:** Arabic text, translations, transliteration, audio (everyayah.com), section play with range, Arabic-Indic numerals, OG images, JSON-LD.
**Remaining:** IWT (Islam.wiki Translation) generation, CF R2 audio proxy, surah themes data.

### Hadith (`/hadith`)

| Route | Status | Notes |
| --- | --- | --- |
| `/hadith` | [F] | 12 collections with metadata |
| `/hadith/[collection]` | [F] | Books listed with hadith counts |
| `/hadith/[collection]/[book]` | [F] | Paginated (50/page), Arabic+English, grade badges, chapter headers |
| `/hadith/[collection]/[book]/[number]` | [F] | Full detail: isnad/matn, grades, topics, quran refs, sharh |

**Done:** 69,510 real hadiths, 99% Arabic/English, grade display, sharh commentary, search.
**Remaining:** Isnad chain viewer [B: data empty], cross-references [B: duplicates empty].

### Seerah (`/seerah`)

| Route | Status | Notes |
| --- | --- | --- |
| `/seerah` | [F][I] | 405 events, interactive Leaflet map with Bezier arcs, timeline |
| `/seerah/[event]` | [F] | Detail with markdown content, TOC, prev/next |

**Done:** Map routes, arrow indicators, historical waypoints, event filtering.
**Remaining:** 300 events missing markdown content, coordinates mostly null.

### History (`/history`)

| Route | Status | Notes |
| --- | --- | --- |
| `/history` | [F][I] | Timeline with period filter (10 eras), severity filter, grouped display |

**Done:** Data layer with period inference and severity classification.
**Remaining:** Dedicated events.json, detail pages, pre-Islamic prophets section.

### People (`/people`)

| Route | Status | Notes |
| --- | --- | --- |
| `/people` | [F][I] | 450 scholars, interactive timeline, search, era/category filters |
| `/people/[slug]` | [F] | Bio, dates, books authored, relationships, places |

**Done:** SSG for all 450, books cross-ref, OG images, JSON-LD.
**Remaining:** 400 need longer bios, relationship wiring, narrators dataset.

### Books (`/books`)

| Route | Status | Notes |
| --- | --- | --- |
| `/books` | [F] | 400 classical books with search, category filters |
| `/books/[slug]` | [F] | Book detail with author link, "More by Author" section |
| `/books/[slug]/[chapter]` | [P] | Chapter page exists but no real chapter content yet |

**Done:** SSG, author cross-ref, descriptions for all 400.
**Remaining:** Chapter content scraping, ToC sidebar, reading progress.

### Articles (`/articles`)

| Route | Status | Notes |
| --- | --- | --- |
| `/articles` | [F] | 500 articles, 10 category tabs, search, pagination |
| `/articles/[slug]` | [F] | Article with sanitized HTML, tags, category badge |

**Done:** 200 articles with real content, all have tags+excerpts, OG images.
**Remaining:** 300 articles need content, cross-references to Quran/hadith.

### Media

| Route | Status | Notes |
| --- | --- | --- |
| `/videos` | [F] | 318 video entries with speakers, tags |
| `/videos/[slug]` | [P] | Detail page ready but embed codes empty |
| `/audio` | [F] | 132 audio entries with speakers, tags |
| `/audio/[slug]` | [P] | Detail page ready but embed codes empty |

**Done:** SSG, search, related by speaker.
**Remaining:** YouTube/audio URLs need population.

### Sects (`/sects`)

| Route | Status | Notes |
| --- | --- | --- |
| `/sects` | [F][I] | Collapsible tree with status badges, parent/child hierarchy |
| `/sects/[slug]` | [F] | Sect detail with key beliefs |

### Wiki (`/wiki`)

| Route | Status | Notes |
| --- | --- | --- |
| `/wiki` | [F] | 250 pages, category tabs, search, pagination |
| `/wiki/[...slug]` | [F] | Full content (248/250), breadcrumbs, edit/history/diff modes |

### Search (`/search`)

| Route | Status | Notes |
| --- | --- | --- |
| `/search` | [F] | Client-side search across all sections with transliteration expansion |

**Remaining:** Meilisearch migration for full-text + Arabic search.

### Auth + Profile + Admin

| Route | Status | Notes |
| --- | --- | --- |
| `/account` | [F] | Login/register with iron-session |
| `/profile/[username]` | [F] | Trust badge, progress bar, edit history, stat cards (Hasura-backed) |
| `/admin` | [F] | Dashboard with pending/recent edit counts, auth guard, Hasura-backed |
| `/admin/edits` | [F] | Pending edit queue with diff viewer, approve/deny actions |

---

## Data Coverage

| Dataset | Entries | Coverage | Source |
| --- | --- | --- | --- |
| Quran surahs | 114 | 100% metadata | Verified |
| Quran ayahs | 6,236 | 100% Arabic + 14 translations | quran.com pipeline |
| Hadith | 69,510 | 99% Arabic, 99% English | sunnah.com + MEGA CRUNCH |
| People | 450 | 100% metadata, 11% full bios | Manual + AI |
| Books | 400 | 100% descriptions, 0% chapter content | Manual |
| Seerah events | 405 | 26% with markdown content | Manual + AI |
| Articles | 500 | 40% with full content | Manual + AI |
| Media | 450 | 100% metadata, 0% embed codes | Manual |
| Sects | ~30 | 100% with key beliefs | Manual |
| Wiki pages | 250 | 99% with full content | Manual + AI |

---

## Infrastructure Done

- DOMPurify sanitization on all HTML output
- JSON-LD structured data (Quran, Hadith, Person, Breadcrumb)
- OG image generation (edge runtime)
- Rate limiting on API routes
- Sitemap with all sections
- CSP headers
- generateStaticParams on all content pages
- Permanent (301) redirects for slug variants
- Contributor system: revision submission, trust scoring, auto-approve thresholds, diff viewer
- Admin edit queue: pending/approved/denied revisions, diff view, approve/deny actions
- Wiki edit flow: MarkdownEditor → Server Action → Hasura revision → admin review queue
