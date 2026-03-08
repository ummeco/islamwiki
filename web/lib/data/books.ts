import fs from 'fs'
import path from 'path'
import booksData from '@/data/books/classical.json'

interface BookData {
  id: number
  slug: string
  title_ar: string
  title_en: string
  author_id: number
  author_name_en: string
  author_slug: string
  year_written_ah?: number
  year_written_ce?: number
  subject: string
  language_original: string
  volumes?: number
  pages?: number
  description_en?: string
  available_languages: string[]
}

export interface ChapterData {
  id: number
  book_id: number
  book_slug: string
  number: number
  title_ar?: string
  title_en: string
  content_en?: string
  content_ar?: string
}

interface ChapterMeta {
  number: number
  title_en: string
  title_ar?: string
}

const books: BookData[] = booksData as BookData[]
const CHAPTERS_DIR = path.join(process.cwd(), 'data', 'books')

// Cache chapter lists per book slug
const chapterCache = new Map<string, ChapterData[]>()

export function getBooks(): BookData[] {
  return books
}

export function getBookBySlug(slug: string): BookData | undefined {
  return books.find((b) => b.slug === slug)
}

export function getBooksByAuthor(authorSlug: string): BookData[] {
  return books.filter((b) => b.author_slug === authorSlug)
}

/**
 * Scans data/books/{slug}/ for chapter JSON files.
 * Each chapter file: {slug}/001.json, 002.json, etc.
 * Format: { number, title_en, title_ar?, content_en?, content_ar? }
 */
export function getChaptersByBook(bookSlug: string): ChapterData[] {
  if (chapterCache.has(bookSlug)) return chapterCache.get(bookSlug)!

  const book = books.find((b) => b.slug === bookSlug)
  if (!book) return []

  const bookDir = path.join(CHAPTERS_DIR, bookSlug)
  let chapters: ChapterData[] = []

  try {
    const files = fs.readdirSync(bookDir)
      .filter((f) => f.endsWith('.json') && f !== 'meta.json')
      .sort()

    chapters = files.map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(bookDir, file), 'utf-8')) as ChapterMeta & { content_en?: string; content_ar?: string }
      return {
        id: book.id * 1000 + raw.number,
        book_id: book.id,
        book_slug: bookSlug,
        number: raw.number,
        title_en: raw.title_en,
        title_ar: raw.title_ar,
        content_en: raw.content_en,
        content_ar: raw.content_ar,
      }
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
