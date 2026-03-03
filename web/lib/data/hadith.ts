import collectionsData from '@/data/hadith/collections.json'
import booksData from '@/data/hadith/books.json'

interface CollectionData {
  id: number
  name_ar: string
  name_en: string
  slug: string
  author_id: number
  author_name_en: string
  total_hadith: number
  total_books: number
  description_en?: string
}

interface BookData {
  id: number
  collection_id: number
  number: number
  name_ar: string
  name_en: string
  slug: string
  hadith_count: number
}

interface HadithData {
  id: number
  book_id: number
  number_in_book: number
  number_global?: number
  text_ar: string
  text_en: string
  grade: string
  graded_by?: string
  chapter_en?: string
  chapter_ar?: string
}

const collections: CollectionData[] = collectionsData as CollectionData[]
const books: BookData[] = booksData as BookData[]

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

export function getHadithsByBook(bookId: number): HadithData[] {
  // Generate stub hadiths until full dataset is loaded
  const book = books.find((b) => b.id === bookId)
  if (!book) return []

  const count = Math.min(book.hadith_count, 10) // Show first 10 as stubs
  return Array.from({ length: count }, (_, i) => ({
    id: bookId * 10000 + i + 1,
    book_id: bookId,
    number_in_book: i + 1,
    text_ar: '',
    text_en: '',
    grade: 'unknown',
  }))
}

export function getHadithByNumber(
  bookId: number,
  number: number
): HadithData | undefined {
  const book = books.find((b) => b.id === bookId)
  if (!book || number < 1 || number > book.hadith_count) return undefined

  return {
    id: bookId * 10000 + number,
    book_id: bookId,
    number_in_book: number,
    text_ar: '',
    text_en: '',
    grade: 'unknown',
  }
}
