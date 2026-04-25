import { describe, it, expect } from 'vitest'
import { safeJsonLd } from '@/components/seo/json-ld'

// ── safeJsonLd — XSS / script-injection hardening ───────────────────────────

describe('safeJsonLd() — </script> tag injection', () => {
  it('escapes </script> in a string value', () => {
    const out = safeJsonLd({ description: 'foo</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<script>')
  })

  it('escapes </SCRIPT> (uppercase variant)', () => {
    const out = safeJsonLd({ description: 'foo</SCRIPT><SCRIPT>alert(1)</SCRIPT>' })
    expect(out).not.toContain('</SCRIPT>')
    expect(out).not.toContain('<SCRIPT>')
  })

  it('escapes bare < so no HTML tag can be injected', () => {
    const out = safeJsonLd({ description: '<img src=x onerror=alert(1)>' })
    expect(out).not.toContain('<img')
    expect(out).not.toContain('<')
  })

  it('escapes </script> nested inside a deeper object', () => {
    const out = safeJsonLd({
      '@type': 'Article',
      headline: 'Innocent title',
      description: '</script><script>alert("xss")</script>',
      publisher: { name: 'Islam.wiki' },
    })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<script>')
  })

  it('escapes </script> in array values', () => {
    const out = safeJsonLd({ tags: ['safe', '</script><script>evil()</script>', 'also-safe'] })
    expect(out).not.toContain('</script>')
  })
})

// ── safeJsonLd — round-trip: escaped output is still valid JSON ──────────────

describe('safeJsonLd() — parse round-trip', () => {
  it('output parses back to the original object (no data loss)', () => {
    const input = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'An article with </script> in the title',
      description: 'Desc with <b>bold</b> and </script> sequences',
      url: 'https://islam.wiki/articles/test',
    }
    const out = safeJsonLd(input)
    const parsed = JSON.parse(out)
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed.headline).toBe('An article with </script> in the title')
    expect(parsed.description).toBe('Desc with <b>bold</b> and </script> sequences')
  })

  it('output parses back when value contains only safe characters', () => {
    const input = { name: 'Islam.wiki', url: 'https://islam.wiki' }
    const out = safeJsonLd(input)
    expect(JSON.parse(out)).toEqual(input)
  })

  it('preserves Arabic text unchanged after round-trip', () => {
    const input = { alternateName: 'موسوعة إسلامية' }
    const out = safeJsonLd(input)
    expect(JSON.parse(out)).toEqual(input)
  })

  it('preserves URLs with > characters unchanged', () => {
    const input = { url: 'https://islam.wiki/search?q=foo&bar=baz' }
    const out = safeJsonLd(input)
    expect(JSON.parse(out)).toEqual(input)
  })
})

// ── safeJsonLd — no regression on normal content ────────────────────────────

describe('safeJsonLd() — normal structured data is unaffected', () => {
  it('Website schema serializes correctly', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Islam.wiki',
      url: 'https://islam.wiki',
      inLanguage: ['en', 'ar', 'id'],
    }
    const out = safeJsonLd(data)
    const parsed = JSON.parse(out)
    expect(parsed['@type']).toBe('WebSite')
    expect(parsed.inLanguage).toEqual(['en', 'ar', 'id'])
  })

  it('BreadcrumbList schema serializes correctly', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://islam.wiki' },
        { '@type': 'ListItem', position: 2, name: 'Hadith', item: 'https://islam.wiki/hadith' },
      ],
    }
    const out = safeJsonLd(data)
    const parsed = JSON.parse(out)
    expect(parsed.itemListElement).toHaveLength(2)
    expect(parsed.itemListElement[1].name).toBe('Hadith')
  })
})
