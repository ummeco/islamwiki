/**
 * lib/data/runtime-data.ts — Runtime (fetch-based) data reader for SSR pages.
 *
 * PURPOSE: The two on-demand SSR pages (hadith/[collection]/[book]/[number] and
 *   books/[slug]/[chapter]) need to read a SINGLE record per request. Importing the
 *   filesystem-backed readers in lib/data/hadith.ts and lib/data/books.ts caused
 *   Vercel's static file tracer (nft) to follow their `readFileSync(process.cwd()/data/...)`
 *   calls and bundle the ENTIRE 1GB `data/` corpus into the serverless function
 *   (hadith 521M + books 119M + quran 373M), pushing the function to ~1.1GB and over the
 *   Vercel 250MB limit. This module reads data over HTTP from the static asset path
 *   `/content-data/...` instead, so NOTHING from `data/` is bundled into the function.
 *
 * STRATEGY:
 *   - `data/` is copied verbatim into the static build output at `/content-data/` by the
 *     copyContentData() Astro integration in astro.config.mjs (astro:build:done hook).
 *   - Each getter fetches only the small JSON file(s) it needs for the requested record,
 *     using the configured `site` (https://islam.wiki) so absolute URLs resolve in prod.
 *   - Returned shapes are IDENTICAL to the corresponding lib/data/hadith.ts and
 *     lib/data/books.ts functions, so the SSR pages render unchanged.
 *   - In-process Maps cache fetched files within a single warm function instance.
 *
 * INPUTS: collection/book slugs, hadith numbers, chapter numbers, iw_ids.
 * OUTPUTS: same interfaces as lib/data/hadith.ts (HadithData, SharhEntry, IwIdRef,
 *   CollectionData, BookData) and lib/data/books.ts (BookData as ClassicalBook, ChapterData).
 * CONSTRAINTS:
 *   - SERVER-ONLY. Runs in .astro frontmatter (SSR), never shipped to a client island.
 *   - No `@/data/*.json` static imports and no `fs` — that is the whole point.
 *   - Base URL resolves from Astro `site` env, falling back to PUBLIC_BASE_URL then localhost.
 * REF: P2 fix — externalize content corpus from the Vercel function · D-P2-STACK-CANON
 */
import 'server-only'

// ── Base URL resolution ──────────────────────────────────────────────────────
// Astro injects the configured `site` into import.meta.env.SITE at build time.
// PUBLIC_BASE_URL is the deployed origin (set in astro.config define / Vercel env).
//
// RUNTIME ROBUSTNESS (P2 fix): import.meta.env.SITE is NOT reliably inlined into the
// Vercel serverless function bundle, so it can resolve to the localhost fallback at
// runtime, making every content fetch hit a dead origin → fetchJson returns null →
// SSR pages 404. To guarantee the correct origin on every request we:
//   1. Let the Astro middleware push the LIVE request origin here via
//      setRuntimeContentBase(context.url.origin) — checked FIRST, always correct.
//   2. Fall back to the Vercel-provided production / preview URLs (always set by Vercel).
//   3. Then the build-time SITE / PUBLIC_BASE_URL, then localhost (dev only).
let runtimeContentBase: string | null = null

/**
 * Set the content base origin at runtime from the live request (Astro middleware).
 * Takes precedence over all env-derived values. Idempotent; cheap to call per request.
 * @param origin Absolute origin, e.g. "https://islam.wiki"
 */
export function setRuntimeContentBase(origin: string): void {
  if (origin) runtimeContentBase = origin.replace(/\/$/, '')
}

function contentBaseUrl(): string {
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const vercelUrl = process.env.VERCEL_URL
  const site =
    runtimeContentBase ??
    (import.meta.env.SITE as string | undefined) ??
    (import.meta.env.PUBLIC_BASE_URL as string | undefined) ??
    process.env.PUBLIC_BASE_URL ??
    (vercelProdUrl ? `https://${vercelProdUrl}` : undefined) ??
    (vercelUrl ? `https://${vercelUrl}` : undefined) ??
    'http://localhost:4321'
  return site.replace(/\/$/, '')
}

function contentUrl(relPath: string): string {
  const clean = relPath.replace(/^\/+/, '')
  return new URL(`/content-data/${clean}`, contentBaseUrl()).href
}

// ── Generic cached JSON fetch ────────────────────────────────────────────────
const jsonCache = new Map<string, unknown>()
const missCache = new Set<string>()

/**
 * Public: fetch an arbitrary content JSON file by its path under data/ (e.g.
 * 'quran/ayahs/001.json'). Returns the RAW parsed JSON (no mapping). Used by SSR API
 * routes (e.g. api/tafsir) that need the unmapped on-disk shape without bundling data/.
 */
export async function fetchContentJson<T>(relPath: string): Promise<T | null> {
  return fetchJson<T>(relPath)
}

async function fetchJson<T>(relPath: string): Promise<T | null> {
  if (missCache.has(relPath)) return null
  if (jsonCache.has(relPath)) return jsonCache.get(relPath) as T
  const url = contentUrl(relPath)
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('[content-fetch-fail]', url, `status ${res.status}`)
      missCache.add(relPath)
      return null
    }
    const data = (await res.json()) as T
    jsonCache.set(relPath, data)
    return data
  } catch (err) {
    console.error('[content-fetch-fail]', url, String(err))
    missCache.add(relPath)
    return null
  }
}

// ── Shared metadata types (mirrors lib/data/hadith.ts) ───────────────────────
export interface CollectionData {
  id: number
  name_ar: string
  name_en: string
  slug: string
  author_en: string
  author_ar: string
  author_name_en: string
  total_hadiths: number
  total_hadith: number
  total_books: number
  gap?: boolean
  gap_note?: string
  description_en?: string
}

export interface HadithBookMeta {
  id: number
  collection: string
  collection_id: number
  number: number
  cdn_book_num?: number
  name_ar: string
  name_en: string
  slug: string
  file?: string
  hadith_count: number
}

export interface HadithData {
  n: number
  cn: number
  book: number
  collection: string
  chapter_ar: string
  chapter_en: string
  section_ar?: string
  section_en?: string
  ar: string
  ar_clean?: string
  isnad_ar?: string
  matn_ar?: string
  matn_ar_clean?: string
  isnad_chain?: Array<{ name_ar: string; name_en: string; slug: string; position: number; type: string }>
  sunnah_ref_en?: string
  iwh_en?: string
  iwh_id?: string
  grade?: string
  grade_display?: string
  grades?: Array<{ grade: string; graded_by: string }>
  topics?: string[]
  tags?: string[]
  quran_refs?: string[]
  iw_category?: string
  iw_subcategory?: string
  iw_id?: string
  duplicates?: string[]
  variants?: string[]
  muttafaq_alayhi?: boolean
  sharh_refs?: string[]
  ref?: string
  id: number
  book_id: number
  number_in_book: number
  number_global?: number
  text_ar: string
  text_en: string
  graded_by?: string
}

interface SharhSource {
  id: string
  name_en: string
  name_ar: string
  author: string
  author_ar: string
  died_ah?: number
  collection: string
  description: string
}

export interface SharhEntry {
  id: string
  iw_id: string
  source_id: string
  collection: string
  book_n: number
  hadith_n: number
  text_en: string
}

export interface IwIdRef {
  collectionSlug: string
  collectionName: string
  bookSlug: string
  n: number
}

// ── Mapping (identical to lib/data/hadith.ts loadBookData) ────────────────────
function mapHadith(entries: Array<Record<string, unknown>>, collectionSlug: string): HadithData[] {
  return entries.map((h) => ({
    n: (h.n as number) ?? 0,
    cn: (h.cn as number) ?? 0,
    book: (h.book as number) ?? 0,
    collection: (h.collection as string) ?? collectionSlug,
    chapter_ar: (h.chapter_ar as string) ?? '',
    chapter_en: (h.chapter_en as string) ?? '',
    section_ar: h.section_ar as string | undefined,
    section_en: h.section_en as string | undefined,
    ar: (h.ar as string) ?? '',
    ar_clean: h.ar_clean as string | undefined,
    isnad_ar: h.isnad_ar as string | undefined,
    matn_ar: h.matn_ar as string | undefined,
    matn_ar_clean: h.matn_ar_clean as string | undefined,
    isnad_chain: h.isnad_chain as HadithData['isnad_chain'],
    sunnah_ref_en: h.sunnah_ref_en as string | undefined,
    iwh_en: h.iwh_en as string | undefined,
    iwh_id: h.iwh_id as string | undefined,
    grade: h.grade as string | undefined,
    grade_display: h.grade_display as string | undefined,
    grades: h.grades as HadithData['grades'],
    topics: h.topics as string[] | undefined,
    tags: h.tags as string[] | undefined,
    quran_refs: h.quran_refs as string[] | undefined,
    iw_category: h.iw_category as string | undefined,
    iw_subcategory: h.iw_subcategory as string | undefined,
    iw_id: h.iw_id as string | undefined,
    duplicates: h.duplicates as string[] | undefined,
    variants: h.variants as string[] | undefined,
    muttafaq_alayhi: h.muttafaq_alayhi as boolean | undefined,
    sharh_refs: h.sharh_refs as string[] | undefined,
    ref: h.ref as string | undefined,
    id: (h.cn as number) ?? (h.n as number) ?? 0,
    book_id: (h.book as number) ?? 0,
    number_in_book: (h.n as number) ?? 0,
    text_ar: (h.ar as string) ?? '',
    text_en: (h.iwh_en as string) ?? (h.sunnah_ref_en as string) ?? '',
    graded_by: h.grades ? (h.grades as Array<{ graded_by: string }>)[0]?.graded_by : undefined,
  }))
}

// ── Hadith metadata getters ───────────────────────────────────────────────────
async function getCollections(): Promise<CollectionData[]> {
  return (await fetchJson<CollectionData[]>('hadith/collections.json')) ?? []
}

async function getHadithBooks(): Promise<HadithBookMeta[]> {
  return (await fetchJson<HadithBookMeta[]>('hadith/books.json')) ?? []
}

export async function getCollectionBySlug(slug: string): Promise<CollectionData | undefined> {
  return (await getCollections()).find((c) => c.slug === slug)
}

export async function getBooksByCollection(collectionId: number): Promise<HadithBookMeta[]> {
  return (await getHadithBooks()).filter((b) => b.collection_id === collectionId)
}

export async function getHadithBookBySlug(collectionId: number, bookSlug: string): Promise<HadithBookMeta | undefined> {
  return (await getHadithBooks()).find((b) => b.collection_id === collectionId && b.slug === bookSlug)
}

async function loadBookData(collectionSlug: string, bookFile: string): Promise<HadithData[]> {
  const entries = await fetchJson<Array<Record<string, unknown>>>(`hadith/${collectionSlug}/${bookFile}`)
  if (!entries) return []
  return mapHadith(entries, collectionSlug)
}

export async function getHadithsByBook(bookId: number): Promise<HadithData[]> {
  const books = await getHadithBooks()
  const book = books.find((b) => b.id === bookId)
  if (!book) return []
  const collections = await getCollections()
  const collection = collections.find((c) => c.id === book.collection_id)
  if (!collection) return []
  const fileName = book.file ?? `${String(book.number).padStart(3, '0')}.json`
  return loadBookData(collection.slug, fileName)
}

export async function getHadithByNumber(bookId: number, number: number): Promise<HadithData | undefined> {
  const hadiths = await getHadithsByBook(bookId)
  return hadiths.find((h) => h.n === number || h.number_in_book === number)
}

// ── Sharh (commentary) ─────────────────────────────────────────────────────────
export async function getSharhSources(): Promise<SharhSource[]> {
  return (await fetchJson<SharhSource[]>('hadith/sharh/sources.json')) ?? []
}

export async function getSharhForHadith(collectionSlug: string, bookN: number, hadithN: number): Promise<SharhEntry[]> {
  const cacheKey = `${collectionSlug}-${String(bookN).padStart(3, '0')}`
  const entries = (await fetchJson<SharhEntry[]>(`hadith/sharh/entries/${cacheKey}.json`)) ?? []
  return entries.filter((e) => e.hadith_n === hadithN)
}

// ── IW-ID reverse lookup (duplicates / variants cross-references) ───────────────
let iwIdReverseMap: Map<string, { collection: string; cn: number }> | null = null

async function getIwIdReverseMap(): Promise<Map<string, { collection: string; cn: number }>> {
  if (iwIdReverseMap) return iwIdReverseMap
  iwIdReverseMap = new Map()
  const forwardMap = await fetchJson<Record<string, string>>('hadith/all/iw-id-map.json')
  if (forwardMap) {
    for (const [key, iwId] of Object.entries(forwardMap)) {
      const colonIdx = key.lastIndexOf(':')
      const collectionSlug = key.slice(0, colonIdx)
      const cnRaw = key.slice(colonIdx + 1)
      const cn = parseInt(cnRaw, 10)
      if (isNaN(cn)) continue
      iwIdReverseMap.set(iwId, { collection: collectionSlug, cn })
    }
  }
  return iwIdReverseMap
}

export async function getHadithRefByIwId(iwId: string): Promise<IwIdRef | null> {
  const reverseMap = await getIwIdReverseMap()
  const entry = reverseMap.get(iwId)
  if (!entry) return null

  const collections = await getCollections()
  const collection = collections.find((c) => c.slug === entry.collection)
  if (!collection) return null

  const books = await getHadithBooks()
  const collectionBooks = books
    .filter((b) => b.collection === entry.collection)
    .sort((a, b) => a.number - b.number)

  for (const book of collectionBooks) {
    const fileName = book.file ?? `${String(book.number).padStart(3, '0')}.json`
    const hadiths = await loadBookData(entry.collection, fileName)
    const hadith = hadiths.find((h) => h.cn === entry.cn)
    if (hadith) {
      return {
        collectionSlug: entry.collection,
        collectionName: collection.name_en,
        bookSlug: book.slug,
        n: hadith.n,
      }
    }
  }
  return null
}

// ── Classical books (mirrors lib/data/books.ts) ─────────────────────────────────
export interface ClassicalBook {
  id: number
  slug: string
  title_ar: string
  title_en: string
  author_id: number | null
  author_name_en: string
  author_slug?: string
  year_written_ah?: number
  year_written_ce?: number
  subject: string
  language_original: string
  volumes?: number
  pages?: number
  description_en?: string
  available_languages: string[]
  source_url_primary?: string | null
  source_type?: string | null
  source_status?: 'confirmed' | 'verify' | 'no-source'
  category_primary?: string | null
  category_secondary?: string | null
  canonical?: boolean
  canonical_slug?: string | null
  died_ah?: number | null
  madhab?: string | null
  publisher_en?: string | null
  has_text_ar?: boolean
  has_text_en?: boolean
  has_text_id?: boolean
  introduction_written?: boolean
  index_generated?: boolean
  qa_passed?: boolean
  qa_score?: number | null
  is_short_treatise?: boolean
  has_no_chapters?: boolean
  chapter_zero_only?: boolean
  related_slugs?: string[]
  subject_tags?: string[]
  topic_tags?: string[]
  era_tags?: string[]
  region_tags?: string[]
}

export interface ChapterData {
  id: number
  book_id: number
  book_slug: string
  number: number
  title_en: string
  title_ar?: string
  title_id?: string
  content_en?: string
  content_ar?: string
  content_id?: string
  chapter_summary_en?: string
  chapter_summary_id?: string
  subject_tags?: string[]
  topic_tags?: string[]
  madhab_tags?: string[]
  era_tags?: string[]
  content_type_tags?: string[]
  keywords?: string[]
  keywords_ar?: string[]
  people_refs?: string[]
  ayah_refs?: string[]
  hadith_refs?: string[]
  source_lang?: string
  source_type?: string
  source_url?: string
  source_file?: string
  page_start?: number
  page_end?: number
  is_editorial?: boolean
  editorial_note?: string
  no_source_found?: boolean
  no_source_reason?: string
  qa_passed?: boolean
  qa_errors?: string[]
  last_updated?: string
  translation_credit?: string
  translation_note?: string
}

// ── Quran (runtime fetch — for SSR API routes; mirrors lib/data/quran.ts shapes) ──
export interface SurahMeta {
  number: number
  name_ar: string
  name_en: string
  name_transliteration?: string
  slug: string
  revelation_type: string
  verses_count: number
}

interface RawAyah {
  n: number
  cn: number
  ar: string
  ar_simple?: string
  transliteration?: string
  t?: Record<string, string>
  t_id?: Record<string, string>
  ruku?: number
  section_id?: number | null
  juz: number
  page: number
  hizb?: number
}

export async function getSurahsRuntime(): Promise<SurahMeta[]> {
  return (await fetchJson<SurahMeta[]>('quran/surahs.json')) ?? []
}

export async function getAyahRuntime(
  surahNumber: number,
  ayahNumber: number
): Promise<{ text_ar: string; text_en: string | null; juz: number; page: number } | null> {
  const pad = String(surahNumber).padStart(3, '0')
  const ayahs = await fetchJson<RawAyah[]>(`quran/ayahs/${pad}.json`)
  if (!ayahs) return null
  const a = ayahs.find((x) => x.n === ayahNumber)
  if (!a) return null
  return {
    text_ar: a.ar,
    text_en: a.t?.en ?? a.t?.['en-sahih'] ?? a.t?.['sahih-int'] ?? a.t?.iwq ?? null,
    juz: a.juz,
    page: a.page,
  }
}

// ── Seerah / history markdown (runtime fetch — for SSR content API route) ───────
export async function getSeerahContentRuntime(slug: string, locale?: string): Promise<string | null> {
  const tryPaths = locale && locale !== 'en'
    ? [`seerah/content/${slug}.${locale}.md`, `seerah/content/${slug}.md`]
    : [`seerah/content/${slug}.md`]
  for (const p of tryPaths) {
    const text = await fetchText(p)
    if (text !== null) return text
  }
  return null
}

async function fetchText(relPath: string): Promise<string | null> {
  try {
    const res = await fetch(contentUrl(relPath))
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function getClassicalBooks(): Promise<ClassicalBook[]> {
  return (await fetchJson<ClassicalBook[]>('books/classical.json')) ?? []
}

export async function getBookBySlug(slug: string): Promise<ClassicalBook | undefined> {
  return (await getClassicalBooks()).find((b) => b.slug === slug)
}

/**
 * Chapter files live at data/books/{slug}/NNN.json. There is no readdir over HTTP,
 * so chapters are enumerated from the per-book manifest at data/books/{slug}/chapters.json
 * when present; otherwise via the index.json fallback. Each entry is fetched lazily.
 *
 * To preserve parity with the fs reader (which globs NNN.json), we read a manifest file
 * `chapters.json` listing chapter numbers. If absent, we fall back to probing meta.json.
 */
interface ChapterManifest {
  numbers: number[]
}

async function getChapterNumbers(bookSlug: string): Promise<number[]> {
  // Preferred: explicit manifest emitted alongside chapters.
  const manifest = await fetchJson<ChapterManifest | number[]>(`books/${bookSlug}/chapters.json`)
  if (Array.isArray(manifest)) return manifest
  if (manifest && Array.isArray(manifest.numbers)) return manifest.numbers
  // Fallback: meta.json may carry a chapter_count.
  const meta = await fetchJson<{ chapter_count?: number; chapters?: number }>(`books/${bookSlug}/meta.json`)
  const count = meta?.chapter_count ?? meta?.chapters
  if (typeof count === 'number') return Array.from({ length: count + 1 }, (_, i) => i)
  return []
}

function mapChapter(raw: Record<string, unknown>, book: ClassicalBook, bookSlug: string): ChapterData {
  return {
    ...(raw as object),
    id: book.id * 1000 + ((raw.number as number) ?? 0),
    book_id: book.id,
    book_slug: bookSlug,
  } as ChapterData
}

export async function getChapter(bookSlug: string, chapterNumber: number): Promise<ChapterData | undefined> {
  const book = (await getClassicalBooks()).find((b) => b.slug === bookSlug)
  if (!book) return undefined
  const file = `${String(chapterNumber).padStart(3, '0')}.json`
  const raw = await fetchJson<Record<string, unknown>>(`books/${bookSlug}/${file}`)
  if (!raw) return undefined
  return mapChapter(raw, book, bookSlug)
}

export async function getChaptersByBook(bookSlug: string): Promise<ChapterData[]> {
  const book = (await getClassicalBooks()).find((b) => b.slug === bookSlug)
  if (!book) return []
  const numbers = await getChapterNumbers(bookSlug)
  if (numbers.length === 0) return []
  const chapters = await Promise.all(
    numbers.map(async (num) => {
      const file = `${String(num).padStart(3, '0')}.json`
      const raw = await fetchJson<Record<string, unknown>>(`books/${bookSlug}/${file}`)
      return raw ? mapChapter(raw, book, bookSlug) : null
    })
  )
  return chapters.filter((c): c is ChapterData => c !== null).sort((a, b) => a.number - b.number)
}
