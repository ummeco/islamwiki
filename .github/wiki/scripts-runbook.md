# Islam.wiki Scripts Runbook

All scripts run from the repo root (`islamwiki/`) unless noted. Install dependencies first: `pnpm install` inside `web/`.

---

## Hadith Data

### build-isnad.ts
**Purpose:** Parses `isnad_ar` Arabic text in each hadith JSON to extract narrator chains; patches files with an `isnad_chain` array.
**When to run:** After adding new hadith collections or when narrator chain data is missing.
**Env vars:** none (reads from `web/data/hadith/`)
**Usage:** `npx tsx scripts/hadith/build-isnad.ts [--collection bukhari] [--dry-run]`
**Output:** Patches `web/data/hadith/{collection}/*.json` in place.
**Error handling:** `--dry-run` shows what would change without writing. Unknown narrator names are skipped silently.
**See also:** `scripts/people/build-narrator-refs.ts`

### build-quran-refs.ts
**Purpose:** Scans 70k hadiths for Quran verse citations and populates the `quran_refs` array in each hadith JSON.
**When to run:** After importing new hadith collections or updating Quran reference detection patterns.
**Env vars:** none
**Usage:** `npx tsx scripts/hadith/build-quran-refs.ts [--collection bukhari] [--dry-run]`
**Output:** Patches `web/data/hadith/{collection}/*.json` with `quran_refs: [{surah, ayah}]`.
**Error handling:** `--dry-run` to preview. Unmatched citations are skipped; check stdout for unmatched count.
**See also:** `web/scripts/seed-quran-hadith-crossrefs.ts`

### fetch-ibn-hibban.ts
**Purpose:** Fetches ~7,500 Sahih Ibn Hibban hadiths from the sunnah.com API.
**When to run:** One-time import; re-run to fill gaps or update missing books.
**Env vars:** none (uses public sunnah.com API; no key required)
**Usage:** `npx tsx scripts/hadith/fetch-ibn-hibban.ts [--dry-run] [--start 1] [--end 7500]`
**Output:** `web/data/hadith/ibn-hibban/{001..NNN}.json`. Saves every 100 hadiths for resume.
**Error handling:** Rate-limited to 1 req/s. Saves progress continuously; safe to Ctrl-C and resume with `--start`.

### fetch-mustadrak.ts
**Purpose:** Fetches ~8,800 Al-Mustadrak hadiths (al-Hakim) from the sunnah.com API.
**When to run:** One-time import; re-run with `--start` to resume after interruption.
**Env vars:** none
**Usage:** `npx tsx scripts/hadith/fetch-mustadrak.ts [--dry-run] [--start 1] [--end 8800]`
**Output:** `web/data/hadith/mustadrak/{001..NNN}.json`
**Error handling:** 1 req/s rate limit. Resume with `--start <last-saved-number>`.
**See also:** `fetch-ibn-hibban.ts`

### fetch-shamela-sharh.ts
**Purpose:** Fetches Sharh (commentary) data from al-Shamela for Bukhari, Muslim, Tirmidhi, and Abu Dawud.
**When to run:** One-time import. Requires active network + Shamela public access.
**Env vars:** none
**Usage:** `npx tsx scripts/hadith/fetch-shamela-sharh.ts [--dry-run]`
**Output:** `web/data/hadith/sharh/{collection}/{book}.json`
**Error handling:** Run `--dry-run` first to verify Shamela is reachable. Script will error if Shamela API is unavailable.

### scrape-sunnah-com.ts
**Purpose:** Backfills English translation for Musnad Ahmad books 38-49 (~6,925 hadiths) from sunnah.com.
**When to run:** One-time. Resume with `--start-book` if interrupted.
**Env vars:** none
**Usage:** `npx tsx scripts/hadith/scrape-sunnah-com.ts [--dry-run] [--start-book 38] [--end-book 49]`
**Output:** Updates `web/data/hadith/ahmad/{book}.json` with `sunnah_ref_en` field.
**Error handling:** Saves progress per book file. If a book fails, note the book number and resume.

---

## People / Narrator Data

### build-narrator-refs.ts
**Purpose:** Builds a narrator-to-hadith cross-reference index by scanning 70k hadiths for narrator name matches.
**When to run:** After adding narrators to `web/data/people/narrators.json` or after `build-isnad.ts` runs.
**Env vars:** none
**Usage:** `npx tsx scripts/people/build-narrator-refs.ts [--dry-run] [--narrator <slug>]`
**Output:** `web/data/people/narrator-hadiths.json`
**Error handling:** `--narrator <slug>` to test a single narrator. Unmatched narrators are included with an empty array.
**See also:** `scripts/hadith/build-isnad.ts`

### merge-narrator-bios.ts
**Purpose:** Merges `narrator-bio-patch-*.json` patch files into `narrators.json`.
**When to run:** After AI-generated or manually authored narrator bio patches are placed in `web/data/people/`.
**Env vars:** none
**Usage:** `npx tsx scripts/people/merge-narrator-bios.ts [--dry-run]`
**Output:** Updates `web/data/people/narrators.json` in place.
**Error handling:** `--dry-run` prints a diff. Conflicting slugs use the last-seen patch value.

---

## Wiki Content

### merge-wiki-patches.ts
**Purpose:** Merges `content-patch-*.json` and `wiki-expansion-patch.json` files into `pages.json`.
**When to run:** After any AI or manual wiki content patches are placed in `web/data/wiki/`.
**Env vars:** none
**Usage:** `npx tsx scripts/wiki/merge-wiki-patches.ts [--dry-run]`
**Output:** Updates `web/data/wiki/pages.json` in place.
**Error handling:** `--dry-run` previews. Missing slugs in `pages.json` are logged as warnings.

### merge-wiki-lang-patches.ts
**Purpose:** Merges Indonesian (`wiki-id-*.json`) and Arabic (`wiki-ar-*.json`) language patches into `pages.json`.
**When to run:** After language translation batches are complete and placed in `web/data/wiki/`.
**Env vars:** none
**Usage:** `npx tsx scripts/wiki/merge-wiki-lang-patches.ts [--dry-run] [--from=/tmp/wiki-id-batch1.json]`
**Output:** Updates `web/data/wiki/pages.json` with `title_id`, `content_id`, `title_ar`, `content_ar` fields.
**Error handling:** Unknown slugs skipped with a warning; run `--dry-run` to see the count.
**See also:** `merge-wiki-patches.ts`

---

## Article Content

### merge-article-patches.ts
**Purpose:** Merges `article-content-patch-*.json` files into `articles.json`.
**When to run:** After English content patches are placed in `web/data/articles/`.
**Env vars:** none
**Usage:** `npx tsx scripts/articles/merge-article-patches.ts [--dry-run]`
**Output:** Updates `web/data/articles/articles.json` in place.
**Error handling:** `--dry-run` shows affected slugs. Slug collisions use last-seen patch.

### merge-article-id-patches.ts
**Purpose:** Merges Indonesian article content patches (`article-content-id-patch-*.json`) into `articles.json`.
**When to run:** After Indonesian translation batches are complete.
**Env vars:** none
**Usage:** `npx tsx scripts/articles/merge-article-id-patches.ts [--dry-run]`
**Output:** Updates `web/data/articles/articles.json` with `title_id`, `excerpt_id`, `content_id` fields.
**Error handling:** Unknown slugs logged as warnings; `--dry-run` to preview.

---

## Books Data

### consolidate-source-mapping.js
**Purpose:** Consolidates all `source-mapping-batch-*.json` files into a single `source-mapping.json` with priority ordering (al-maktaba > shamela > archive.org > kalamullah > NO-SOURCE).
**When to run:** After new source-mapping batch files are produced.
**Env vars:** none
**Usage:** `node scripts/books/consolidate-source-mapping.js`
**Output:** `web/data/books/source-mapping.json`
**Error handling:** Exits with an error if no batch files found. Check `web/data/books/` for `source-mapping-batch-*.json` files.

### enrich-classical.js
**Purpose:** Enriches `web/data/books/classical.json` with source URL, category, canonical slug, and subject field fixes from `source-mapping.json` and `category-assignments.json`.
**When to run:** After `consolidate-source-mapping.js` or after updating category assignments.
**Env vars:** none
**Usage:** `node scripts/books/enrich-classical.js`
**Output:** Updates `web/data/books/classical.json` in place.
**Error handling:** Fails if `source-mapping.json` or `category-assignments.json` are missing; run `consolidate-source-mapping.js` first.
**See also:** `consolidate-source-mapping.js`

---

## Search Index

### index-meilisearch.ts (scripts/)
**Purpose:** Indexes all static content (books, articles, hadith, people, Quran, wiki, sects) into Meilisearch.
**When to run:** After any bulk data update or when setting up a new Meilisearch instance.
**Env vars:** `MEILISEARCH_URL`, `MEILISEARCH_KEY`
**Usage:** `MEILISEARCH_URL=https://api.islam.wiki/meili MEILISEARCH_KEY=<key> npx tsx scripts/index-meilisearch.ts`
**Output:** Indexes pushed to Meilisearch; stdout shows document counts per index.
**Error handling:** Fails fast if Meilisearch is unreachable. Partial failures show which index failed.
**See also:** `web/scripts/build-search-index.ts`, `web/scripts/index/`

### build-search-index.ts (web/scripts/)
**Purpose:** Builds and pushes the Islam.wiki search index to Meilisearch from `web/data/`.
**When to run:** After data updates, before deploying the web app, or to refresh a staging search index.
**Env vars:** `MEILISEARCH_URL`, `MEILISEARCH_KEY`
**Usage:** `pnpx tsx scripts/build-search-index.ts [--dry-run]`
**Output:** Logs document counts per index to stdout. `--dry-run` prints stats without pushing.
**Error handling:** Exits non-zero on connection failure.
**See also:** `scripts/index-meilisearch.ts`

### index-hadith.ts (web/scripts/index/)
**Purpose:** Indexes all 9 major hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta, Ahmad, Darimi) into the `iw_hadith` Meilisearch index.
**When to run:** After importing or updating hadith data files.
**Env vars:** `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY` (in `.env.local`)
**Usage:** `pnpm tsx scripts/index/index-hadith.ts`
**Output:** `iw_hadith` index updated in Meilisearch.
**Error handling:** Fails if `.env.local` vars are missing or Meilisearch is unreachable.

### index-books.ts (web/scripts/index/)
**Purpose:** Indexes all book chapters into the `iw_books` Meilisearch index.
**When to run:** After adding or updating book chapter data.
**Env vars:** `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY`
**Usage:** `pnpm tsx scripts/index/index-books.ts`
**Output:** `iw_books` index updated.
**Error handling:** Same as `index-hadith.ts`.

### index-articles.ts (web/scripts/index/)
**Purpose:** Indexes articles into the `iw_articles` Meilisearch index.
**When to run:** After article data updates.
**Env vars:** `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY`
**Usage:** `pnpm tsx scripts/index/index-articles.ts`
**Output:** `iw_articles` index updated.
**Error handling:** Same as `index-hadith.ts`.

### index-people.ts (web/scripts/index/)
**Purpose:** Indexes people/narrators into the `iw_people` Meilisearch index.
**When to run:** After people data updates.
**Env vars:** `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY`
**Usage:** `pnpm tsx scripts/index/index-people.ts`
**Output:** `iw_people` index updated.
**Error handling:** Same as `index-hadith.ts`.

### index-quran.ts (web/scripts/index/)
**Purpose:** Indexes all 6,236 Quran ayahs into the `iw_quran` Meilisearch index.
**When to run:** One-time setup or after Quran data corrections.
**Env vars:** `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY`
**Usage:** `pnpm tsx scripts/index/index-quran.ts`
**Output:** `iw_quran` index updated with Arabic + transliteration + translation fields.
**Error handling:** Same as `index-hadith.ts`.

---

## Verification

### verify-content.ts (scripts/)
**Purpose:** Scans articles, book chapters, and wiki pages for minimum word count and outputs a content gap report.
**When to run:** Before content releases or to find thin pages that need filling.
**Env vars:** none
**Usage:** `npx tsx scripts/verify-content.ts [--min-words 300] [--format json|text]`
**Output:** Gap report to stdout listing pages below the threshold.
**Error handling:** Exit 0 always; check output for gaps.

### verify-hadith.ts (web/scripts/)
**Purpose:** Verifies hadith data integrity — checks book counts, total hadiths, Arabic coverage, and structural validity.
**When to run:** After importing new hadith collections or major data edits.
**Env vars:** none
**Usage:** `npx tsx scripts/verify-hadith.ts`
**Output:** Per-collection summary to stdout: books, total hadiths, % with Arabic.
**Error handling:** Non-zero exit if structural errors found.

### verify-history.ts (web/scripts/)
**Purpose:** Verifies seerah/history data integrity — checks required fields and cross-references.
**When to run:** After editing seerah content files.
**Env vars:** none
**Usage:** `npx tsx scripts/verify-history.ts`
**Output:** List of missing or malformed seerah entries.
**Error handling:** Non-zero exit on integrity errors.

---

## Database / Backend

### seed-quran-hadith-crossrefs.ts (web/scripts/)
**Purpose:** Reads `quran_refs` arrays from Bukhari + Muslim hadith JSONs and writes rows to the `iw_cross_refs` Hasura table. Target: 10k+ cross-refs.
**When to run:** Once after `build-quran-refs.ts` has been run and data pushed. Re-run is idempotent (upsert).
**Env vars:** `HASURA_ADMIN_URL` (or `NEXT_PUBLIC_HASURA_URL`), `HASURA_ADMIN_SECRET`
**Usage:** `pnpm tsx scripts/seed-quran-hadith-crossrefs.ts` or `COLLECTIONS=bukhari,muslim,tirmidhi pnpm tsx scripts/seed-quran-hadith-crossrefs.ts`
**Output:** Upserted row count logged to stdout.
**Error handling:** Exits non-zero on Hasura errors. Check `HASURA_ADMIN_URL` is reachable.

### register-remote-schema.sh (web/scripts/)
**Purpose:** Registers the Islam.wiki Remote Schema endpoint in the Ummat Hasura instance via nself CLI.
**When to run:** Once on initial backend setup; re-run after Remote Schema URL changes.
**Env vars:** `REMOTE_SCHEMA_SECRET`, `NEXT_PUBLIC_BASE_URL`
**Usage:** `REMOTE_SCHEMA_SECRET=<secret> NEXT_PUBLIC_BASE_URL=https://islam.wiki bash scripts/register-remote-schema.sh`
**Output:** nself CLI confirms schema registration.
**Error handling:** Prerequisites: nself CLI installed, Ummat backend healthy (`nself status`), REMOTE_SCHEMA_SECRET set.
**See also:** `ummat/backend/scripts/reload-remote-schemas.sh`

---

## Utilities

### locale-coverage.ts (web/scripts/)
**Purpose:** Scans i18n message files and reports translation completeness per locale.
**When to run:** During translation sprints or before releases to check coverage.
**Env vars:** none
**Usage:** `npx tsx scripts/locale-coverage.ts`
**Output:** `web/data/.locale-coverage.json` + summary to stdout.
**Error handling:** Exit 0 always; incomplete locales are reported, not errors.
