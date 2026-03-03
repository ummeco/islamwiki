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

interface ChapterData {
  id: number
  book_id: number
  book_slug: string
  number: number
  title_ar?: string
  title_en: string
  content_en?: string
  content_ar?: string
}

const books: BookData[] = booksData as BookData[]

export function getBooks(): BookData[] {
  return books
}

export function getBookBySlug(slug: string): BookData | undefined {
  return books.find((b) => b.slug === slug)
}

export function getBooksByAuthor(authorSlug: string): BookData[] {
  return books.filter((b) => b.author_slug === authorSlug)
}

export function getChaptersByBook(bookId: number): ChapterData[] {
  // Chapters will be populated when full text is available
  return []
}

export function getChapter(
  bookId: number,
  chapterNumber: number
): ChapterData | undefined {
  // Stub chapter
  const book = books.find((b) => b.id === bookId)
  if (!book) return undefined
  return {
    id: bookId * 1000 + chapterNumber,
    book_id: bookId,
    book_slug: book.slug,
    number: chapterNumber,
    title_en: `Chapter ${chapterNumber}`,
    content_en: undefined,
  }
}
