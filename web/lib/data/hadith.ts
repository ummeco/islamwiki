import { readFileSync } from 'fs'
import { join } from 'path'
import collectionsData from '@/data/hadith/collections.json'
import booksData from '@/data/hadith/books.json'

interface CollectionData {
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

interface BookData {
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
  sharh_refs?: string[]
  ref?: string
  // Mapped fields for backward compatibility
  id: number
  book_id: number
  number_in_book: number
  number_global?: number
  text_ar: string
  text_en: string
  graded_by?: string
}

const collections: CollectionData[] = collectionsData as unknown as CollectionData[]
const books: BookData[] = booksData as BookData[]

// Cache loaded book data to avoid repeated reads during SSG
const bookDataCache = new Map<string, HadithData[]>()

export function getCollections(): CollectionData[] {
  return collections
}

export function getCollectionBySlug(slug: string): CollectionData | undefined {
  return collections.find((c) => c.slug === slug)
}

export function getBooksByCollection(collectionId: number): BookData[] {
  return books.filter((b) => b.collection_id === collectionId)
}

export function getBookBySlug(
  collectionId: number,
  bookSlug: string
): BookData | undefined {
  return books.find(
    (b) => b.collection_id === collectionId && b.slug === bookSlug
  )
}

function loadBookData(collectionSlug: string, bookFile: string): HadithData[] {
  const cacheKey = `${collectionSlug}/${bookFile}`
  const cached = bookDataCache.get(cacheKey)
  if (cached) return cached

  try {
    const filePath = join(process.cwd(), 'data', 'hadith', collectionSlug, bookFile)
    const raw = readFileSync(filePath, 'utf-8')
    const entries = JSON.parse(raw) as Array<Record<string, unknown>>

    const mapped: HadithData[] = entries.map((h) => ({
      // Raw fields from JSON
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
      isnad_chain: h.isnad_chain as Array<{ name_ar: string; name_en: string; slug: string; position: number; type: string }> | undefined,
      sunnah_ref_en: h.sunnah_ref_en as string | undefined,
      iwh_en: h.iwh_en as string | undefined,
      iwh_id: h.iwh_id as string | undefined,
      grade: h.grade as string | undefined,
      grade_display: h.grade_display as string | undefined,
      grades: h.grades as Array<{ grade: string; graded_by: string }> | undefined,
      topics: h.topics as string[] | undefined,
      tags: h.tags as string[] | undefined,
      quran_refs: h.quran_refs as string[] | undefined,
      iw_category: h.iw_category as string | undefined,
      iw_subcategory: h.iw_subcategory as string | undefined,
      iw_id: h.iw_id as string | undefined,
      duplicates: h.duplicates as string[] | undefined,
      variants: h.variants as string[] | undefined,
      sharh_refs: h.sharh_refs as string[] | undefined,
      ref: h.ref as string | undefined,
      // Backward-compatible mapped fields
      id: (h.cn as number) ?? (h.n as number) ?? 0,
      book_id: (h.book as number) ?? 0,
      number_in_book: (h.n as number) ?? 0,
      text_ar: (h.ar as string) ?? '',
      text_en: (h.iwh_en as string) ?? (h.sunnah_ref_en as string) ?? '',
      graded_by: h.grades
        ? ((h.grades as Array<{ graded_by: string }>)[0]?.graded_by)
        : undefined,
    }))

    bookDataCache.set(cacheKey, mapped)
    return mapped
  } catch {
    return []
  }
}

export function getHadithsByBook(bookId: number): HadithData[] {
  const book = books.find((b) => b.id === bookId)
  if (!book) return []

  const collection = collections.find((c) => c.id === book.collection_id)
  if (!collection) return []

  const fileName = book.file ?? `${String(book.number).padStart(3, '0')}.json`
  return loadBookData(collection.slug, fileName)
}

export function getHadithByNumber(
  bookId: number,
  number: number
): HadithData | undefined {
  const hadiths = getHadithsByBook(bookId)
  return hadiths.find((h) => h.n === number || h.number_in_book === number)
}

// ── Sharh (commentary) data ──

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

let sharhSourcesCache: SharhSource[] | null = null
const sharhEntriesCache = new Map<string, SharhEntry[]>()

export function getSharhSources(): SharhSource[] {
  if (sharhSourcesCache) return sharhSourcesCache
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'hadith', 'sharh', 'sources.json'), 'utf-8')
    sharhSourcesCache = JSON.parse(raw) as SharhSource[]
    return sharhSourcesCache
  } catch {
    return []
  }
}

export function getSharhForHadith(collectionSlug: string, bookN: number, hadithN: number): SharhEntry[] {
  const cacheKey = `${collectionSlug}-${String(bookN).padStart(3, '0')}`
  let entries = sharhEntriesCache.get(cacheKey)
  if (!entries) {
    try {
      const filePath = join(process.cwd(), 'data', 'hadith', 'sharh', 'entries', `${cacheKey}.json`)
      const raw = readFileSync(filePath, 'utf-8')
      entries = JSON.parse(raw) as SharhEntry[]
      sharhEntriesCache.set(cacheKey, entries)
    } catch {
      entries = []
      sharhEntriesCache.set(cacheKey, entries)
    }
  }
  return entries.filter((e) => e.hadith_n === hadithN)
}
