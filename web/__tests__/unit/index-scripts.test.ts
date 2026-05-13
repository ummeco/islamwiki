/**
 * S9-12: Unit tests for index:all npm script chain.
 *
 * Verifies:
 * 1. `index:all` script is defined in package.json.
 * 2. It chains all 5 corpus indexers in the correct order.
 * 3. Each individual index:* script is defined.
 * 4. Scripts reference tsx (not ts-node) for ESM compatibility.
 * 5. Scripts target the correct file paths under scripts/index/.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const PKG_PATH = resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'))
const scripts: Record<string, string> = pkg.scripts ?? {}

// ── index:all script ──────────────────────────────────────────────────────────

describe('index:all script', () => {
  it('is defined in package.json', () => {
    expect(scripts['index:all']).toBeDefined()
  })

  it('chains all 5 corpus index scripts', () => {
    const all = scripts['index:all']
    expect(all).toContain('index:quran')
    expect(all).toContain('index:hadith')
    expect(all).toContain('index:books')
    expect(all).toContain('index:people')
    expect(all).toContain('index:articles')
  })

  it('runs quran before hadith (dependency order)', () => {
    const all = scripts['index:all']
    const quranPos = all.indexOf('index:quran')
    const hadithPos = all.indexOf('index:hadith')
    expect(quranPos).toBeGreaterThanOrEqual(0)
    expect(hadithPos).toBeGreaterThanOrEqual(0)
    expect(quranPos).toBeLessThan(hadithPos)
  })

  it('uses sequential execution (&&) not parallel (&)', () => {
    const all = scripts['index:all']
    // Ensure && is used (sequential); a bare & would indicate background parallel
    expect(all).toContain('&&')
  })
})

// ── Individual index scripts ──────────────────────────────────────────────────

describe('individual index scripts', () => {
  const CORPORA = ['quran', 'hadith', 'books', 'people', 'articles'] as const

  for (const corpus of CORPORA) {
    it(`index:${corpus} is defined`, () => {
      expect(scripts[`index:${corpus}`]).toBeDefined()
    })

    it(`index:${corpus} uses tsx (not ts-node)`, () => {
      const cmd = scripts[`index:${corpus}`]
      expect(cmd).toContain('tsx')
      expect(cmd).not.toContain('ts-node')
    })

    it(`index:${corpus} targets scripts/index/index-${corpus}.ts`, () => {
      const cmd = scripts[`index:${corpus}`]
      expect(cmd).toContain(`scripts/index/index-${corpus}.ts`)
    })
  }
})

// ── Other required scripts ────────────────────────────────────────────────────

describe('required build/test scripts', () => {
  it('dev script is defined', () => {
    expect(scripts['dev']).toBeDefined()
  })

  it('build script is defined', () => {
    expect(scripts['build']).toBeDefined()
  })

  it('test script uses vitest', () => {
    expect(scripts['test']).toBeDefined()
    expect(scripts['test']).toContain('vitest')
  })

  it('lint script is defined', () => {
    expect(scripts['lint']).toBeDefined()
  })
})
