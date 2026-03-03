import { describe, it, expect } from 'vitest'
import {
  getCollections,
  getBooksByCollection,
  getHadithsByBook,
} from '@/lib/data/hadith'

describe('getCollections()', () => {
  it('returns an array with length > 0', () => {
    const collections = getCollections()
    expect(Array.isArray(collections)).toBe(true)
    expect(collections.length).toBeGreaterThan(0)
  })

  it('returns collections with required fields', () => {
    const collections = getCollections()
    const first = collections[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name_en')
    expect(first).toHaveProperty('slug')
  })
})

describe('getBooksByCollection()', () => {
  it('returns an array for a valid collection id', () => {
    const collections = getCollections()
    const firstCollectionId = collections[0]?.id
    if (firstCollectionId !== undefined) {
      const books = getBooksByCollection(firstCollectionId)
      expect(Array.isArray(books)).toBe(true)
    }
  })

  it('returns empty array for unknown collection id', () => {
    const books = getBooksByCollection(999999)
    expect(books).toEqual([])
  })
})

describe('getHadithsByBook()', () => {
  it('returns an array (stubs are OK)', () => {
    const collections = getCollections()
    const firstCollectionId = collections[0]?.id
    if (firstCollectionId !== undefined) {
      const books = getBooksByCollection(firstCollectionId)
      const firstBook = books[0]
      if (firstBook) {
        const hadiths = getHadithsByBook(firstBook.id)
        expect(Array.isArray(hadiths)).toBe(true)
      }
    }
  })

  it('returns empty array for unknown book id', () => {
    const hadiths = getHadithsByBook(999999)
    expect(hadiths).toEqual([])
  })
})
