import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ogImageUrl } from '@/lib/og'

describe('ogImageUrl', () => {
  it('builds a URL with required title param', () => {
    const url = ogImageUrl({ title: 'Surah al-Baqarah' })
    expect(url).toContain('/api/og')
    expect(url).toContain('title=Surah+al-Baqarah')
  })

  it('omits optional params when not provided', () => {
    const url = ogImageUrl({ title: 'Test' })
    expect(url).not.toContain('subtitle=')
    expect(url).not.toContain('section=')
    expect(url).not.toContain('arabic=')
  })

  it('includes subtitle when provided', () => {
    const url = ogImageUrl({ title: 'Test', subtitle: 'Verse 1' })
    expect(url).toContain('subtitle=')
  })

  it('includes section when provided', () => {
    const url = ogImageUrl({ title: 'Test', section: 'Quran' })
    expect(url).toContain('section=Quran')
  })

  it('includes arabic when provided', () => {
    const url = ogImageUrl({ title: 'Test', arabic: 'بسم الله' })
    expect(url).toContain('arabic=')
  })

  it('uses production base URL by default', () => {
    const url = ogImageUrl({ title: 'Test' })
    // Should use either env var or fallback https://islam.wiki
    expect(url).toMatch(/^https?:\/\//)
  })

  it('encodes special characters in title', () => {
    const url = ogImageUrl({ title: 'The Cow & Verse' })
    // URL should be parseable
    expect(() => new URL(url)).not.toThrow()
  })

  it('includes all params when all provided', () => {
    const url = ogImageUrl({
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      section: 'Hadith',
      arabic: 'نص',
    })
    expect(url).toContain('title=')
    expect(url).toContain('subtitle=')
    expect(url).toContain('section=Hadith')
    expect(url).toContain('arabic=')
  })
})
