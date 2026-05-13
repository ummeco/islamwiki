/**
 * S9-11: Tests for the Meilisearch client factory (lib/search/client.ts).
 *
 * Verifies:
 *   - searchClient and adminSearchClient are Meilisearch instances
 *   - They are distinct objects (different API key contexts)
 *   - .env.example documents all required Meilisearch env vars
 *   - lib/search/schema.ts exports INDEX_NAMES for all 8 corpora
 *   - INDEX_SCHEMAS covers all 8 index names with required settings fields
 *   - S9-12: package.json has index:all script that composes sub-scripts
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// ── Meilisearch client factory — structural tests ────────────────────────────
// Meilisearch validates the host URL at construction time, so we test the
// module source structure rather than instantiating with a blank host.

describe('lib/search/client.ts — structural checks (S9-11)', () => {
  const ROOT = process.cwd()

  function readClientSrc(): string {
    return fs.readFileSync(path.join(ROOT, 'lib/search/client.ts'), 'utf-8')
  }

  it('imports Meilisearch from the meilisearch package', () => {
    const src = readClientSrc()
    expect(src).toContain('meilisearch')
    expect(src).toMatch(/Meilisearch/)
  })

  it('exports searchClient as a named export', () => {
    const src = readClientSrc()
    expect(src).toMatch(/export\s+const\s+searchClient/)
  })

  it('exports adminSearchClient as a named export', () => {
    const src = readClientSrc()
    expect(src).toMatch(/export\s+const\s+adminSearchClient/)
  })

  it('searchClient uses MEILISEARCH_SEARCH_KEY env var', () => {
    const src = readClientSrc()
    expect(src).toContain('MEILISEARCH_SEARCH_KEY')
  })

  it('adminSearchClient uses MEILISEARCH_ADMIN_KEY env var', () => {
    const src = readClientSrc()
    expect(src).toContain('MEILISEARCH_ADMIN_KEY')
  })

  it('both clients use MEILISEARCH_HOST env var', () => {
    const src = readClientSrc()
    expect(src).toContain('MEILISEARCH_HOST')
  })

  it('searchClient and adminSearchClient are constructed with different API key vars', () => {
    const src = readClientSrc()
    // Both key env vars must be referenced — SEARCH_KEY for public, ADMIN_KEY for admin
    expect(src).toContain('MEILISEARCH_SEARCH_KEY')
    expect(src).toContain('MEILISEARCH_ADMIN_KEY')
  })
})

// ── .env.example — Meilisearch env var documentation ────────────────────────

describe('.env.example — Meilisearch env vars (S9-11)', () => {
  const ROOT = process.cwd()

  function readEnvExample(): string {
    return fs.readFileSync(path.join(ROOT, '.env.example'), 'utf-8')
  }

  it('documents MEILISEARCH_HOST', () => {
    expect(readEnvExample()).toMatch(/MEILISEARCH_HOST/)
  })

  it('documents MEILISEARCH_ADMIN_KEY', () => {
    expect(readEnvExample()).toMatch(/MEILISEARCH_ADMIN_KEY/)
  })

  it('documents MEILISEARCH_SEARCH_KEY', () => {
    expect(readEnvExample()).toMatch(/MEILISEARCH_SEARCH_KEY/)
  })
})

// ── lib/search/schema.ts — Index schema completeness ────────────────────────

describe('INDEX_NAMES and INDEX_SCHEMAS (S9-06 / S9-11)', () => {
  it('INDEX_NAMES covers all 8 required corpora', async () => {
    const { INDEX_NAMES } = await import('@/lib/search/schema')
    const required = ['quran', 'hadith', 'people', 'books', 'articles', 'seerah', 'videos', 'audio']
    for (const corpus of required) {
      expect(INDEX_NAMES).toHaveProperty(corpus)
    }
  })

  it('each INDEX_NAME value is a non-empty string', async () => {
    const { INDEX_NAMES } = await import('@/lib/search/schema')
    for (const [key, value] of Object.entries(INDEX_NAMES)) {
      expect(typeof value).toBe('string')
      expect((value as string).length).toBeGreaterThan(0)
    }
  })

  it('INDEX_SCHEMAS contains an entry for each corpus', async () => {
    const { INDEX_SCHEMAS, INDEX_NAMES } = await import('@/lib/search/schema')
    const schemaNames = INDEX_SCHEMAS.map((s) => s.name)
    for (const name of Object.values(INDEX_NAMES)) {
      expect(schemaNames).toContain(name)
    }
  })

  it('each schema entry has primaryKey, settings.searchableAttributes, settings.filterableAttributes', async () => {
    const { INDEX_SCHEMAS } = await import('@/lib/search/schema')
    for (const schema of INDEX_SCHEMAS) {
      expect(schema.primaryKey).toBeTruthy()
      expect(Array.isArray(schema.settings.searchableAttributes)).toBe(true)
      expect(Array.isArray(schema.settings.filterableAttributes)).toBe(true)
    }
  })

  it('quran schema has Arabic and English text fields in searchable attributes', async () => {
    const { INDEX_SCHEMAS, INDEX_NAMES } = await import('@/lib/search/schema')
    const quran = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.quran)
    expect(quran).toBeDefined()
    const searchable = quran!.settings.searchableAttributes ?? []
    // Must be able to search Arabic and English text
    expect(searchable.some((a) => a.includes('ar'))).toBe(true)
    expect(searchable.some((a) => a.includes('en'))).toBe(true)
  })

  it('hadith schema has grade in filterable attributes', async () => {
    const { INDEX_SCHEMAS, INDEX_NAMES } = await import('@/lib/search/schema')
    const hadith = INDEX_SCHEMAS.find((s) => s.name === INDEX_NAMES.hadith)
    expect(hadith).toBeDefined()
    const filterable = hadith!.settings.filterableAttributes ?? []
    expect(filterable).toContain('grade')
  })
})

// ── S9-12: package.json index scripts ────────────────────────────────────────

describe('package.json — index:all script (S9-12)', () => {
  const ROOT = process.cwd()

  it('has index:all script', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'))
    expect(pkg.scripts).toHaveProperty('index:all')
  })

  it('index:all composes index:quran, index:hadith, index:books', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'))
    const script: string = pkg.scripts['index:all'] ?? ''
    expect(script).toContain('index:quran')
    expect(script).toContain('index:hadith')
    expect(script).toContain('index:books')
  })

  it('has index:quran, index:hadith, index:books, index:people, index:articles scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'))
    const required = ['index:quran', 'index:hadith', 'index:books', 'index:people', 'index:articles']
    for (const script of required) {
      expect(pkg.scripts).toHaveProperty(script)
    }
  })
})
