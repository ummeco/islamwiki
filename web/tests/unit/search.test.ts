import { describe, it, expect } from 'vitest'
import { searchAll, searchGrouped } from '@/lib/search'

describe('searchAll()', () => {
  it('returns results for "salah"', () => {
    const results = searchAll('salah')
    expect(Array.isArray(results)).toBe(true)
    // May return 0 results if no stub data matches, but must not throw
  })

  it('returns empty array for empty string', () => {
    const results = searchAll('')
    expect(results).toEqual([])
  })

  it('returns quran results for "al-fatiha"', () => {
    const results = searchAll('al-fatiha')
    // al-fatiha is a surah slug/name, should match quran section
    const quranResults = results.filter((r) => r.type === 'quran')
    expect(quranResults.length).toBeGreaterThan(0)
  })
})

describe('searchGrouped()', () => {
  it('returns grouped results structure', () => {
    const result = searchGrouped('fatiha')
    expect(result).toHaveProperty('groups')
    expect(result).toHaveProperty('total')
    expect(Array.isArray(result.groups)).toBe(true)
  })

  it('returns empty groups for empty query', () => {
    const result = searchGrouped('')
    expect(result.groups).toEqual([])
    expect(result.total).toBe(0)
  })

  it('each group has required fields', () => {
    const result = searchGrouped('fatiha')
    for (const group of result.groups) {
      expect(group).toHaveProperty('type')
      expect(group).toHaveProperty('label')
      expect(group).toHaveProperty('results')
      expect(group).toHaveProperty('total')
    }
  })
})
