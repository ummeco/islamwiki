import { describe, it, expect } from 'vitest'
import {
  getSurahs,
  getSurahBySlug,
  getSurahByNumber,
  getAyahsBySurah,
} from '@/lib/data/quran'

describe('getSurahs()', () => {
  it('returns 114 surahs', () => {
    const surahs = getSurahs()
    expect(surahs).toHaveLength(114)
  })

  it('returns an array of objects with required fields', () => {
    const surahs = getSurahs()
    const first = surahs[0]
    expect(first).toHaveProperty('number')
    expect(first).toHaveProperty('name_en')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('verses_count')
  })
})

describe('getSurahBySlug()', () => {
  it('returns surah 1 for al-fatiha', () => {
    const surah = getSurahBySlug('al-fatiha')
    expect(surah).toBeDefined()
    expect(surah?.number).toBe(1)
  })

  it('returns undefined for unknown slug', () => {
    const surah = getSurahBySlug('not-a-real-surah')
    expect(surah).toBeUndefined()
  })
})

describe('getSurahByNumber()', () => {
  it('returns Al-Baqarah with 286 verses for number 2', () => {
    const surah = getSurahByNumber(2)
    expect(surah).toBeDefined()
    expect(surah?.verses_count).toBe(286)
    expect(surah?.name_transliteration).toMatch(/baqarah/i)
  })

  it('returns undefined for out-of-range number', () => {
    const surah = getSurahByNumber(999)
    expect(surah).toBeUndefined()
  })
})

describe('getAyahsBySurah()', () => {
  it('returns 7 ayahs for surah 1 (Al-Fatiha)', () => {
    const ayahs = getAyahsBySurah(1)
    expect(ayahs).toHaveLength(7)
  })

  it('returns empty array for invalid surah number', () => {
    const ayahs = getAyahsBySurah(999)
    expect(ayahs).toEqual([])
  })

  it('returns ayahs with required fields', () => {
    const ayahs = getAyahsBySurah(1)
    expect(ayahs[0]).toHaveProperty('number_in_surah')
    expect(ayahs[0]).toHaveProperty('text_ar')
  })
})
