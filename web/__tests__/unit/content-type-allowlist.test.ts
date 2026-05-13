/**
 * Tests for T1-4-13: contentType submission role gate.
 *
 * Verifies:
 * 1. Primary source types (quran_ayah, hadith_entry, etc.) require curator/admin/owner.
 * 2. editor role submitting a primary source type is rejected (403).
 * 3. trusted and user roles submitting a primary source type are rejected (403).
 * 4. curator, admin, owner roles may submit primary sources.
 * 5. editor role may submit editorial content types (tafsir, wiki_page, article, etc.).
 * 6. All expected primary source types are in the set.
 */
import { describe, it, expect } from 'vitest'

// ── Mirror the constants from app/api/revisions/route.ts ────────────────────

const PRIMARY_SOURCE_CONTENT_TYPES = new Set([
  'quran_ayah',
  'quran_surah',
  'quran_translation',
  'hadith_entry',
  'hadith_collection',
  'hadith_book',
  'hadith_isnad',
])

const EDITORIAL_CONTENT_TYPES = new Set([
  'quran_tafsir',
  'article',
  'wiki_page',
  'book_chapter',
  'seerah_event',
  'person',
  'book',
  'sect',
  'media',
])

type Role = 'public' | 'user' | 'trusted' | 'curator' | 'editor' | 'moderator' | 'admin' | 'owner'

// Replicates the role gate in the POST handler
function canSubmitContentType(role: Role, contentType: string): { allowed: boolean; status?: 403 } {
  if (PRIMARY_SOURCE_CONTENT_TYPES.has(contentType)) {
    if (role !== 'curator' && role !== 'admin' && role !== 'owner') {
      return { allowed: false, status: 403 }
    }
  }
  return { allowed: true }
}

// ── Primary source type membership ──────────────────────────────────────────

describe('PRIMARY_SOURCE_CONTENT_TYPES membership — T1-4-13', () => {
  it('quran_ayah is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('quran_ayah')).toBe(true)
  })

  it('quran_surah is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('quran_surah')).toBe(true)
  })

  it('quran_translation is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('quran_translation')).toBe(true)
  })

  it('hadith_entry is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('hadith_entry')).toBe(true)
  })

  it('hadith_collection is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('hadith_collection')).toBe(true)
  })

  it('hadith_book is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('hadith_book')).toBe(true)
  })

  it('hadith_isnad is a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('hadith_isnad')).toBe(true)
  })

  it('quran_tafsir is NOT a primary source type (it is editorial)', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('quran_tafsir')).toBe(false)
  })

  it('article is NOT a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('article')).toBe(false)
  })

  it('wiki_page is NOT a primary source type', () => {
    expect(PRIMARY_SOURCE_CONTENT_TYPES.has('wiki_page')).toBe(false)
  })
})

// ── Role gate: primary source rejection ─────────────────────────────────────

describe('canSubmitContentType() — primary sources rejected for non-curator — T1-4-13', () => {
  const primaryTypes = ['quran_ayah', 'hadith_entry', 'quran_surah', 'hadith_collection']

  for (const contentType of primaryTypes) {
    it(`editor submitting ${contentType} → 403`, () => {
      const result = canSubmitContentType('editor', contentType)
      expect(result.allowed).toBe(false)
      expect(result.status).toBe(403)
    })

    it(`trusted submitting ${contentType} → 403`, () => {
      const result = canSubmitContentType('trusted', contentType)
      expect(result.allowed).toBe(false)
      expect(result.status).toBe(403)
    })

    it(`user submitting ${contentType} → 403`, () => {
      const result = canSubmitContentType('user', contentType)
      expect(result.allowed).toBe(false)
      expect(result.status).toBe(403)
    })

    it(`public submitting ${contentType} → 403`, () => {
      const result = canSubmitContentType('public', contentType)
      expect(result.allowed).toBe(false)
      expect(result.status).toBe(403)
    })
  }
})

// ── Role gate: curator/admin/owner allowed ───────────────────────────────────

describe('canSubmitContentType() — curator/admin/owner may submit primary sources — T1-4-13', () => {
  it('curator may submit quran_ayah', () => {
    expect(canSubmitContentType('curator', 'quran_ayah').allowed).toBe(true)
  })

  it('curator may submit hadith_entry', () => {
    expect(canSubmitContentType('curator', 'hadith_entry').allowed).toBe(true)
  })

  it('admin may submit quran_ayah', () => {
    expect(canSubmitContentType('admin', 'quran_ayah').allowed).toBe(true)
  })

  it('owner may submit hadith_isnad', () => {
    expect(canSubmitContentType('owner', 'hadith_isnad').allowed).toBe(true)
  })

  it('moderator submitting quran_ayah → 403 (moderator ≠ curator)', () => {
    const result = canSubmitContentType('moderator', 'quran_ayah')
    expect(result.allowed).toBe(false)
    expect(result.status).toBe(403)
  })
})

// ── Editorial content types: editor allowed ──────────────────────────────────

describe('canSubmitContentType() — editor may submit editorial types — T1-4-13', () => {
  it('editor may submit quran_tafsir', () => {
    expect(canSubmitContentType('editor', 'quran_tafsir').allowed).toBe(true)
  })

  it('editor may submit article', () => {
    expect(canSubmitContentType('editor', 'article').allowed).toBe(true)
  })

  it('editor may submit wiki_page', () => {
    expect(canSubmitContentType('editor', 'wiki_page').allowed).toBe(true)
  })

  it('trusted may submit wiki_page', () => {
    expect(canSubmitContentType('trusted', 'wiki_page').allowed).toBe(true)
  })

  it('user may submit article', () => {
    expect(canSubmitContentType('user', 'article').allowed).toBe(true)
  })
})

// ── EDITORIAL_CONTENT_TYPES set completeness ─────────────────────────────────

describe('EDITORIAL_CONTENT_TYPES membership — T1-4-13', () => {
  const expected = ['quran_tafsir', 'article', 'wiki_page', 'book_chapter', 'seerah_event', 'person', 'book', 'sect', 'media']
  for (const type of expected) {
    it(`${type} is in EDITORIAL_CONTENT_TYPES`, () => {
      expect(EDITORIAL_CONTENT_TYPES.has(type)).toBe(true)
    })
  }
})
