/**
 * S9-06: Unit tests for Meilisearch index schema definitions.
 *
 * Verifies:
 * 1. All 8 corpora are defined with correct index names (iw_ prefix).
 * 2. Each schema has a primaryKey of 'id'.
 * 3. Searchable, filterable, and sortable attributes are non-empty arrays.
 * 4. Corpus-specific required attributes are present.
 * 5. INDEX_NAMES values are stable constants matching the schemas.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import {
  INDEX_NAMES,
  INDEX_SCHEMAS,
  type IndexSchema,
} from '@/lib/search/schema'

// ── INDEX_NAMES constants ─────────────────────────────────────────────────────

describe('INDEX_NAMES — stable constant map', () => {
  it('defines 8 corpora', () => {
    expect(Object.keys(INDEX_NAMES)).toHaveLength(8)
  })

  it('all values are prefixed with iw_', () => {
    for (const value of Object.values(INDEX_NAMES)) {
      expect(value).toMatch(/^iw_/)
    }
  })

  it('quran index name is iw_quran', () => {
    expect(INDEX_NAMES.quran).toBe('iw_quran')
  })

  it('hadith index name is iw_hadith', () => {
    expect(INDEX_NAMES.hadith).toBe('iw_hadith')
  })

  it('people index name is iw_people', () => {
    expect(INDEX_NAMES.people).toBe('iw_people')
  })

  it('books index name is iw_books', () => {
    expect(INDEX_NAMES.books).toBe('iw_books')
  })

  it('articles index name is iw_articles', () => {
    expect(INDEX_NAMES.articles).toBe('iw_articles')
  })

  it('seerah index name is iw_seerah', () => {
    expect(INDEX_NAMES.seerah).toBe('iw_seerah')
  })

  it('videos index name is iw_videos', () => {
    expect(INDEX_NAMES.videos).toBe('iw_videos')
  })

  it('audio index name is iw_audio', () => {
    expect(INDEX_NAMES.audio).toBe('iw_audio')
  })
})

// ── INDEX_SCHEMAS array structure ─────────────────────────────────────────────

describe('INDEX_SCHEMAS — schema array completeness', () => {
  it('has 8 schema entries', () => {
    expect(INDEX_SCHEMAS).toHaveLength(8)
  })

  it('all schemas have primaryKey of id', () => {
    for (const schema of INDEX_SCHEMAS) {
      expect(schema.primaryKey).toBe('id')
    }
  })

  it('each schema name matches a value in INDEX_NAMES', () => {
    const validNames = new Set(Object.values(INDEX_NAMES))
    for (const schema of INDEX_SCHEMAS) {
      expect(validNames.has(schema.name)).toBe(true)
    }
  })

  it('all schema names are unique', () => {
    const names = INDEX_SCHEMAS.map((s) => s.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('each schema has non-empty searchableAttributes', () => {
    for (const schema of INDEX_SCHEMAS) {
      expect(schema.settings.searchableAttributes).toBeDefined()
      expect(Array.isArray(schema.settings.searchableAttributes)).toBe(true)
      expect((schema.settings.searchableAttributes as string[]).length).toBeGreaterThan(0)
    }
  })

  it('each schema has non-empty filterableAttributes', () => {
    for (const schema of INDEX_SCHEMAS) {
      expect(schema.settings.filterableAttributes).toBeDefined()
      expect(Array.isArray(schema.settings.filterableAttributes)).toBe(true)
      expect((schema.settings.filterableAttributes as string[]).length).toBeGreaterThan(0)
    }
  })

  it('each schema has non-empty sortableAttributes', () => {
    for (const schema of INDEX_SCHEMAS) {
      expect(schema.settings.sortableAttributes).toBeDefined()
      expect(Array.isArray(schema.settings.sortableAttributes)).toBe(true)
      expect((schema.settings.sortableAttributes as string[]).length).toBeGreaterThan(0)
    }
  })
})

// ── Quran schema specifics ───────────────────────────────────────────────────

describe('quran schema — required attributes', () => {
  let quran: IndexSchema

  beforeAll(() => {
    quran = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.quran)!
    expect(quran).toBeDefined()
  })

  it('searchable attrs include text_en and text_ar', () => {
    const attrs = quran.settings.searchableAttributes as string[]
    expect(attrs).toContain('text_en')
    expect(attrs).toContain('text_ar')
  })

  it('filterable attrs include surah_number and juz', () => {
    const attrs = quran.settings.filterableAttributes as string[]
    expect(attrs).toContain('surah_number')
    expect(attrs).toContain('juz')
  })

  it('sortable attrs include surah_number and ayah_number', () => {
    const attrs = quran.settings.sortableAttributes as string[]
    expect(attrs).toContain('surah_number')
    expect(attrs).toContain('ayah_number')
  })
})

// ── Hadith schema specifics ───────────────────────────────────────────────────

describe('hadith schema — required attributes', () => {
  let hadith: IndexSchema

  beforeAll(() => {
    hadith = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.hadith)!
    expect(hadith).toBeDefined()
  })

  it('searchable attrs include text_en and text_ar', () => {
    const attrs = hadith.settings.searchableAttributes as string[]
    expect(attrs).toContain('text_en')
    expect(attrs).toContain('text_ar')
  })

  it('filterable attrs include collection_slug, book_slug, grade', () => {
    const attrs = hadith.settings.filterableAttributes as string[]
    expect(attrs).toContain('collection_slug')
    expect(attrs).toContain('book_slug')
    expect(attrs).toContain('grade')
  })
})

// ── Books schema specifics ────────────────────────────────────────────────────

describe('books schema — required attributes', () => {
  let books: IndexSchema

  beforeAll(() => {
    books = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.books)!
    expect(books).toBeDefined()
  })

  it('searchable attrs include title_en and content_en', () => {
    const attrs = books.settings.searchableAttributes as string[]
    expect(attrs).toContain('title_en')
    expect(attrs).toContain('content_en')
  })

  it('filterable attrs include madhab and subject', () => {
    const attrs = books.settings.filterableAttributes as string[]
    expect(attrs).toContain('madhab')
    expect(attrs).toContain('subject')
  })
})

// ── People schema specifics ───────────────────────────────────────────────────

describe('people schema — required attributes', () => {
  let people: IndexSchema

  beforeAll(() => {
    people = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.people)!
    expect(people).toBeDefined()
  })

  it('searchable attrs include name_en and name_ar', () => {
    const attrs = people.settings.searchableAttributes as string[]
    expect(attrs).toContain('name_en')
    expect(attrs).toContain('name_ar')
  })

  it('filterable attrs include era and madhab', () => {
    const attrs = people.settings.filterableAttributes as string[]
    expect(attrs).toContain('era')
    expect(attrs).toContain('madhab')
  })
})

// ── Ranking rules ─────────────────────────────────────────────────────────────

describe('ranking rules — quran and hadith use custom ranking', () => {
  it('quran schema has at least 5 ranking rules', () => {
    const quran = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.quran)!
    const rules = quran.settings.rankingRules ?? []
    expect(rules.length).toBeGreaterThanOrEqual(5)
    expect(rules).toContain('words')
    expect(rules).toContain('typo')
    expect(rules).toContain('proximity')
  })

  it('hadith schema has at least 5 ranking rules', () => {
    const hadith = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.hadith)!
    const rules = hadith.settings.rankingRules ?? []
    expect(rules.length).toBeGreaterThanOrEqual(5)
    expect(rules).toContain('words')
    expect(rules).toContain('typo')
  })
})

// ── Typo tolerance ────────────────────────────────────────────────────────────

describe('typo tolerance — quran and hadith schemas', () => {
  it('quran schema has typoTolerance enabled', () => {
    const quran = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.quran)!
    expect(quran.settings.typoTolerance?.enabled).toBe(true)
  })

  it('hadith schema has typoTolerance enabled', () => {
    const hadith = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.hadith)!
    expect(hadith.settings.typoTolerance?.enabled).toBe(true)
  })
})

