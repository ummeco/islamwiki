import fs from 'fs'
import path from 'path'
import booksData from '@/data/books/classical.json'

export interface BookData {
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
  // Enriched fields
  source_url_primary?: string | null
  source_type?: string | null
  source_status?: 'confirmed' | 'verify' | 'no-source'
  category_primary?: string | null
  category_secondary?: string | null
  canonical?: boolean
  canonical_slug?: string | null
  // v2 metadata fields
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
  // Computed fields
  id: number
  book_id: number
  book_slug: string
  // Core fields
  number: number
  title_en: string
  title_ar?: string
  title_id?: string
  content_en?: string
  content_ar?: string
  content_id?: string
  // Summaries
  chapter_summary_en?: string
  chapter_summary_id?: string
  // Taxonomy
  subject_tags?: string[]
  topic_tags?: string[]
  madhab_tags?: string[]
  era_tags?: string[]
  content_type_tags?: string[]
  keywords?: string[]
  keywords_ar?: string[]
  // Cross-references
  people_refs?: string[]
  ayah_refs?: string[]
  hadith_refs?: string[]
  // Source provenance
  source_lang?: string
  source_type?: string
  source_url?: string
  source_file?: string
  page_start?: number
  page_end?: number
  // Translation provenance flags
  en_processed_from_source?: boolean
  en_translated_from_ar?: boolean
  ar_is_source?: boolean
  ar_translated_from_en?: boolean
  id_translated_from_ar?: boolean
  id_translated_from_en?: boolean
  translated_ar_to_en?: boolean
  translated_en_to_id?: boolean
  translated_ar_to_id?: boolean
  // Editorial / no-source
  is_editorial?: boolean
  editorial_note?: string
  no_source_found?: boolean
  no_source_reason?: string
  // QA
  qa_passed?: boolean
  qa_errors?: string[]
  // Audit
  last_updated?: string
  translation_credit?: string
  translation_note?: string
}

const books: BookData[] = booksData as unknown as BookData[]
const CHAPTERS_DIR = path.join(process.cwd(), 'data', 'books')

// Cache chapter lists per book slug
const chapterCache = new Map<string, ChapterData[]>()

export function getBooks(): BookData[] {
  return books
}

export function getBookBySlug(slug: string): BookData | undefined {
  return books.find((b) => b.slug === slug)
}

/** Returns the canonical book for a slug, resolving aliases. */
export function getCanonicalBook(slug: string): { book: BookData; redirectTo?: string } | undefined {
  const book = books.find((b) => b.slug === slug)
  if (!book) return undefined
  if (book.canonical === false && book.canonical_slug) {
    return { book, redirectTo: `/books/${book.canonical_slug}` }
  }
  return { book }
}

export function getBooksByAuthor(authorSlug: string): BookData[] {
  return books.filter((b) => b.author_slug === authorSlug)
}

export function getBooksByCategory(category: string): BookData[] {
  return books.filter(
    (b) => b.canonical !== false && b.category_primary === category
  )
}

/**
 * Scans data/books/{slug}/ for chapter JSON files.
 * Each chapter file: {slug}/001.json, 002.json, etc.
 * Spreads all fields from JSON so v2 fields (content_id, summaries, tags, etc.) pass through.
 */
export function getChaptersByBook(bookSlug: string): ChapterData[] {
  if (chapterCache.has(bookSlug)) return chapterCache.get(bookSlug)!

  const book = books.find((b) => b.slug === bookSlug)
  if (!book) return []

  const bookDir = path.join(CHAPTERS_DIR, bookSlug)
  let chapters: ChapterData[] = []

  try {
    const files = fs.readdirSync(bookDir)
      .filter((f) => f.endsWith('.json') && f !== 'meta.json' && f !== 'index.json')
      .sort()

    chapters = files.map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(bookDir, file), 'utf-8'))
      return {
        ...raw,
        id: book.id * 1000 + raw.number,
        book_id: book.id,
        book_slug: bookSlug,
      } as ChapterData
    })
  } catch {
    // No chapter directory yet — return empty
    chapters = []
  }

  chapterCache.set(bookSlug, chapters)
  return chapters
}

export function getChapter(
  bookSlug: string,
  chapterNumber: number
): ChapterData | undefined {
  return getChaptersByBook(bookSlug).find((c) => c.number === chapterNumber)
}

export interface BookIndexEntry {
  term: string
  chapters: number[]
}

export function getBookIndex(bookSlug: string): BookIndexEntry[] | null {
  const indexPath = path.join(CHAPTERS_DIR, bookSlug, 'index.json')
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as BookIndexEntry[]
  } catch {
    return null
  }
}
