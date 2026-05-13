import { describe, it, expect } from 'vitest'
import { isValidLocale, isRtl, LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config'
import { t, getMessages } from '@/lib/i18n/translations'

describe('i18n config', () => {
  it('has 3 locales', () => {
    expect(LOCALES).toHaveLength(3)
    expect(LOCALES).toContain('en')
    expect(LOCALES).toContain('ar')
    expect(LOCALES).toContain('id')
  })

  it('default locale is en', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })

  it('validates locales correctly', () => {
    expect(isValidLocale('en')).toBe(true)
    expect(isValidLocale('ar')).toBe(true)
    expect(isValidLocale('fr')).toBe(false)
    expect(isValidLocale('')).toBe(false)
  })

  it('Arabic is RTL', () => {
    expect(isRtl('ar')).toBe(true)
    expect(isRtl('en')).toBe(false)
    expect(isRtl('id')).toBe(false)
  })
})

describe('t() translation helper', () => {
  it('returns English string for simple key', () => {
    expect(t('en', 'nav.quran')).toBe('Quran')
    expect(t('en', 'site.name')).toBe('Islam.wiki')
  })

  it('returns Arabic string', () => {
    expect(t('ar', 'nav.quran')).toBe('القرآن')
  })

  it('returns Indonesian string', () => {
    expect(t('id', 'nav.quran')).toBe('Al-Quran')
  })

  it('falls back to English for missing key in other locale', () => {
    // All keys exist, but test fallback mechanism with a made-up key
    const result = t('ar', 'nonexistent.key')
    expect(result).toBe('nonexistent.key')
  })

  it('interpolates variables', () => {
    const result = t('en', 'search.results', { count: 42 })
    expect(result).toBe('42 results')
  })
})

describe('getMessages()', () => {
  it('returns full message object for each locale', () => {
    for (const locale of LOCALES) {
      const msgs = getMessages(locale)
      expect(msgs).toHaveProperty('site')
      expect(msgs).toHaveProperty('nav')
      expect(msgs).toHaveProperty('home')
      expect(msgs).toHaveProperty('footer')
      expect(msgs).toHaveProperty('auth')
      expect(msgs).toHaveProperty('search')
      expect(msgs).toHaveProperty('common')
    }
  })
})
