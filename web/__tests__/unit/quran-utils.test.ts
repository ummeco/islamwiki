import { describe, it, expect } from 'vitest'
import { normalizeArabic, surahTranslit, surahTitle, toArabicIndic } from '@/lib/quran-utils'

describe('normalizeArabic', () => {
  it('normalizes U+08F0 (open fathatan) to U+064B', () => {
    const input = 'ࣰ'
    const result = normalizeArabic(input)
    expect(result).toBe('ً')
  })

  it('normalizes U+08F1 (open dammatan) to U+064C', () => {
    const input = 'ࣱ'
    const result = normalizeArabic(input)
    expect(result).toBe('ٌ')
  })

  it('normalizes U+08F2 (open kasratan) to U+064D', () => {
    const input = 'ࣲ'
    const result = normalizeArabic(input)
    expect(result).toBe('ٍ')
  })

  it('passes through text with no marks unchanged', () => {
    const input = 'بسم الله الرحمن الرحيم'
    expect(normalizeArabic(input)).toBe(input)
  })

  it('handles multiple occurrences in one string', () => {
    const input = 'ࣰࣱࣲ'
    expect(normalizeArabic(input)).toBe('ًٌٍ')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeArabic('')).toBe('')
  })
})

describe('surahTranslit', () => {
  it('lowercases two-letter article prefix', () => {
    expect(surahTranslit('Al-Baqarah')).toBe('al-Baqarah')
  })

  it('lowercases single-letter article prefix', () => {
    expect(surahTranslit('An-Nisa')).toBe('an-Nisa')
  })

  it('leaves names without article unchanged', () => {
    expect(surahTranslit("Ali 'Imran")).toBe("Ali 'Imran")
  })

  it('handles Al-Fatiha', () => {
    expect(surahTranslit('Al-Fatiha')).toBe('al-Fatiha')
  })
})

describe('surahTitle', () => {
  it('formats full title correctly', () => {
    expect(surahTitle('Al-Baqarah', 'The Cow')).toBe('Surat al-Baqarah (The Cow)')
  })

  it('uses surahTranslit for the translit portion', () => {
    expect(surahTitle('An-Nisa', 'The Women')).toBe('Surat an-Nisa (The Women)')
  })
})

describe('toArabicIndic', () => {
  it('converts single digit', () => {
    expect(toArabicIndic(0)).toBe('٠')
    expect(toArabicIndic(1)).toBe('١')
    expect(toArabicIndic(9)).toBe('٩')
  })

  it('converts multi-digit numbers', () => {
    expect(toArabicIndic(33)).toBe('٣٣')
    expect(toArabicIndic(114)).toBe('١١٤')
  })

  it('converts 0', () => {
    expect(toArabicIndic(0)).toBe('٠')
  })

  it('converts all digits 0-9', () => {
    const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    for (let i = 0; i <= 9; i++) {
      expect(toArabicIndic(i)).toBe(digits[i])
    }
  })
})
