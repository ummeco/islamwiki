import { describe, it, expect } from 'vitest'
import {
  ALLOWED_FILTER_KEYS,
  extractFilterKeys,
  validateFilterKeys,
} from '@/src/pages/api/search'

// ---------------------------------------------------------------------------
// extractFilterKeys
// ---------------------------------------------------------------------------
describe('extractFilterKeys()', () => {
  it('parses a simple colon-style filter', () => {
    expect(extractFilterKeys('category:hadith')).toContain('category')
  })

  it('parses an equals-operator filter', () => {
    expect(extractFilterKeys('language = ar')).toContain('language')
  })

  it('parses a compound AND filter', () => {
    const keys = extractFilterKeys('category:hadith AND language:ar')
    expect(keys).toContain('category')
    expect(keys).toContain('language')
  })

  it('parses a compound OR filter', () => {
    const keys = extractFilterKeys('source:bukhari OR source:muslim')
    expect(keys).toContain('source')
    expect(keys.length).toBe(1) // de-duped
  })

  it('extracts key from _geoRadius injection attempt', () => {
    const keys = extractFilterKeys('_geoRadius(48.8, 2.3, 1000)')
    expect(keys).toContain('_geoRadius')
  })

  it('extracts key from _geoBoundingBox injection attempt', () => {
    const keys = extractFilterKeys('_geoBoundingBox([45.0, 1.0], [46.0, 2.0])')
    expect(keys).toContain('_geoBoundingBox')
  })
})

// ---------------------------------------------------------------------------
// validateFilterKeys — disallowed keys
// ---------------------------------------------------------------------------
describe('validateFilterKeys() — disallowed keys return error string', () => {
  it('rejects _geoRadius filter (T1-4-12 spec: must return 400)', () => {
    const result = validateFilterKeys('_geoRadius(48.8, 2.3, 1000)')
    expect(result).not.toBeNull()
    expect(result).toContain('_geoRadius')
  })

  it('rejects _geoBoundingBox filter', () => {
    const result = validateFilterKeys('_geoBoundingBox([45.0, 1.0], [46.0, 2.0])')
    expect(result).not.toBeNull()
    expect(result).toContain('_geoBoundingBox')
  })

  it('rejects arbitrary unknown key', () => {
    const result = validateFilterKeys('injectedField:evil')
    expect(result).not.toBeNull()
    expect(result).toContain('injectedField')
  })

  it('rejects compound filter with one disallowed key', () => {
    const result = validateFilterKeys('category:hadith AND _internal:x')
    expect(result).not.toBeNull()
    expect(result).toContain('_internal')
  })

  it('error message lists allowed keys for discoverability', () => {
    const result = validateFilterKeys('bad:value')
    expect(result).toContain('Allowed keys:')
    for (const key of ALLOWED_FILTER_KEYS) {
      expect(result).toContain(key)
    }
  })
})

// ---------------------------------------------------------------------------
// validateFilterKeys — allowed keys
// ---------------------------------------------------------------------------
describe('validateFilterKeys() — allowed keys return null (T1-4-12 spec: must return 200)', () => {
  it('accepts category:hadith', () => {
    expect(validateFilterKeys('category:hadith')).toBeNull()
  })

  it('accepts language:ar', () => {
    expect(validateFilterKeys('language:ar')).toBeNull()
  })

  it('accepts source:bukhari', () => {
    expect(validateFilterKeys('source:bukhari')).toBeNull()
  })

  it('accepts verified:true', () => {
    expect(validateFilterKeys('verified:true')).toBeNull()
  })

  it('accepts compound filter with only allowed keys', () => {
    expect(validateFilterKeys('category:hadith AND language:ar')).toBeNull()
  })

  it('accepts filter with parentheses grouping', () => {
    expect(validateFilterKeys('(category:hadith OR category:quran) AND language:en')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// ALLOWED_FILTER_KEYS constant matches spec
// ---------------------------------------------------------------------------
describe('ALLOWED_FILTER_KEYS constant', () => {
  it('contains exactly the keys specified in T1-4-12', () => {
    const specKeys = ['category', 'language', 'source', 'verified']
    for (const k of specKeys) {
      expect(ALLOWED_FILTER_KEYS).toContain(k)
    }
    expect(ALLOWED_FILTER_KEYS.length).toBe(specKeys.length)
  })
})
