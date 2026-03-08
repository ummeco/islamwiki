import { describe, it, expect } from 'vitest'
import { getBooks, getBookBySlug, getBooksByAuthor, getChaptersByBook } from '@/lib/data/books'

describe('getBooks()', () => {
  it('returns > 300 books', () => {
    const books = getBooks()
    expect(books.length).toBeGreaterThan(300)
  })

  it('returns books with required fields', () => {
    const books = getBooks()
    const first = books[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('title_en')
    expect(first).toHaveProperty('subject')
  })
})

describe('getBookBySlug()', () => {
  it('returns book for valid slug', () => {
    const books = getBooks()
    const slug = books[0].slug
    const book = getBookBySlug(slug)
    expect(book).toBeDefined()
    expect(book?.slug).toBe(slug)
  })

  it('returns undefined for unknown slug', () => {
    expect(getBookBySlug('not-a-book')).toBeUndefined()
  })
})

describe('getBooksByAuthor()', () => {
  it('returns books for author with known works', () => {
    const books = getBooks()
    const authorSlug = books.find((b) => b.author_slug)?.author_slug
    if (authorSlug) {
      const byAuthor = getBooksByAuthor(authorSlug)
      expect(byAuthor.length).toBeGreaterThan(0)
    }
  })

  it('returns empty for unknown author', () => {
    expect(getBooksByAuthor('unknown-author-slug')).toEqual([])
  })
})

describe('getChaptersByBook()', () => {
  it('returns array (may be empty if no chapter data)', () => {
    const books = getBooks()
    const chapters = getChaptersByBook(books[0].slug)
    expect(Array.isArray(chapters)).toBe(true)
  })
})
