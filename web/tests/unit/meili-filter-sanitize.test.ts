import { describe, it, expect } from 'vitest'
import {
  buildSafeFilter,
  parseFilterClauses,
  type FilterClause,
} from '@/lib/security/meili-filter-sanitize'

// ---------------------------------------------------------------------------
// buildSafeFilter — happy path
// ---------------------------------------------------------------------------

describe('buildSafeFilter() — allowed fields and operators', () => {
  it('builds a simple equality filter', () => {
    const clauses: FilterClause[] = [{ field: 'lang', op: '=', value: 'en' }]
    expect(buildSafeFilter(clauses)).toBe('lang = "en"')
  })

  it('builds a not-equal filter', () => {
    const clauses: FilterClause[] = [{ field: 'category', op: '!=', value: 'sect' }]
    expect(buildSafeFilter(clauses)).toBe('category != "sect"')
  })

  it('builds an IN filter with multiple values', () => {
    const clauses: FilterClause[] = [
      { field: 'type', op: 'IN', value: ['quran', 'hadith'] },
    ]
    expect(buildSafeFilter(clauses)).toBe('type IN ["quran", "hadith"]')
  })

  it('builds a NOT IN filter', () => {
    const clauses: FilterClause[] = [
      { field: 'collection', op: 'NOT IN', value: ['daif', 'mawdu'] },
    ]
    expect(buildSafeFilter(clauses)).toBe('collection NOT IN ["daif", "mawdu"]')
  })

  it('joins multiple clauses with AND', () => {
    const clauses: FilterClause[] = [
      { field: 'lang', op: '=', value: 'en' },
      { field: 'type', op: 'IN', value: ['quran', 'hadith'] },
    ]
    expect(buildSafeFilter(clauses)).toBe('lang = "en" AND type IN ["quran", "hadith"]')
  })

  it('returns empty string for empty clauses array', () => {
    expect(buildSafeFilter([])).toBe('')
  })

  it('accepts all allowed fields without throwing', () => {
    const allowed = ['lang', 'language', 'type', 'collection', 'category', 'source', 'verified'] as const
    for (const field of allowed) {
      expect(() => buildSafeFilter([{ field, op: '=', value: 'x' }])).not.toThrow()
    }
  })
})

// ---------------------------------------------------------------------------
// buildSafeFilter — disallowed fields
// ---------------------------------------------------------------------------

describe('buildSafeFilter() — disallowed fields rejected', () => {
  it('throws for unknown field "_internal"', () => {
    const clauses = [{ field: '_internal' as never, op: '=' as const, value: 'x' }]
    expect(() => buildSafeFilter(clauses)).toThrow(/not allowed/)
  })

  it('throws for _geoRadius field (Meilisearch geo function)', () => {
    const clauses = [{ field: '_geoRadius' as never, op: '=' as const, value: '48.8' }]
    expect(() => buildSafeFilter(clauses)).toThrow(/not allowed/)
  })

  it('throws for _geoBoundingBox field', () => {
    const clauses = [{ field: '_geoBoundingBox' as never, op: '=' as const, value: '45.0' }]
    expect(() => buildSafeFilter(clauses)).toThrow(/not allowed/)
  })

  it('throws for arbitrary user-supplied field name', () => {
    const clauses = [{ field: 'injectedField' as never, op: '=' as const, value: 'evil' }]
    expect(() => buildSafeFilter(clauses)).toThrow(/not allowed/)
  })

  it('error message lists allowed fields', () => {
    try {
      buildSafeFilter([{ field: 'bad' as never, op: '=' as const, value: 'x' }])
      throw new Error('should have thrown')
    } catch (err) {
      expect((err as Error).message).toContain('Allowed fields:')
    }
  })
})

// ---------------------------------------------------------------------------
// buildSafeFilter — value injection hardening
// ---------------------------------------------------------------------------

describe('buildSafeFilter() — value injection', () => {
  it('strips double-quote characters from values (prevents quote escape)', () => {
    const result = buildSafeFilter([{ field: 'lang', op: '=', value: 'en"injected' }])
    expect(result).not.toContain('"injected')
    // Sanitized value is wrapped in quotes — original double quote stripped
    expect(result).toBe('lang = "eninjected"')
  })

  it('strips backslash from values', () => {
    const result = buildSafeFilter([{ field: 'lang', op: '=', value: 'en\\evil' }])
    expect(result).not.toContain('\\')
  })

  it('rejects value containing keyword AND', () => {
    expect(() =>
      buildSafeFilter([{ field: 'lang', op: '=', value: 'AND 1=1' }])
    ).toThrow(/reserved keyword/)
  })

  it('rejects value containing keyword OR', () => {
    expect(() =>
      buildSafeFilter([{ field: 'lang', op: '=', value: 'OR true' }])
    ).toThrow(/reserved keyword/)
  })

  it('rejects value containing keyword NOT', () => {
    expect(() =>
      buildSafeFilter([{ field: 'category', op: '=', value: 'NOT hadith' }])
    ).toThrow(/reserved keyword/)
  })

  it('rejects value containing keyword NULL', () => {
    expect(() =>
      buildSafeFilter([{ field: 'source', op: '=', value: 'NULL' }])
    ).toThrow(/reserved keyword/)
  })

  it('rejects IN array value containing keyword OR', () => {
    expect(() =>
      buildSafeFilter([{ field: 'type', op: 'IN', value: ['quran', 'OR 1=1'] }])
    ).toThrow(/reserved keyword/)
  })

  it('allows normal values that happen to contain letters from keywords (e.g. "android")', () => {
    // "android" contains "and" but not as a word boundary keyword — should pass
    const result = buildSafeFilter([{ field: 'source', op: '=', value: 'android_app' }])
    expect(result).toBe('source = "android_app"')
  })
})

// ---------------------------------------------------------------------------
// buildSafeFilter — operator/value type mismatches
// ---------------------------------------------------------------------------

describe('buildSafeFilter() — operator type validation', () => {
  it('throws when IN is given a scalar value', () => {
    const clauses: FilterClause[] = [{ field: 'type', op: 'IN', value: 'quran' }]
    expect(() => buildSafeFilter(clauses)).toThrow(/requires an array/)
  })

  it('throws when IN is given an empty array', () => {
    const clauses: FilterClause[] = [{ field: 'type', op: 'IN', value: [] }]
    expect(() => buildSafeFilter(clauses)).toThrow(/at least one value/)
  })

  it('throws when = is given an array value', () => {
    const clauses = [{ field: 'lang' as const, op: '=' as const, value: ['en', 'ar'] as unknown as string }]
    expect(() => buildSafeFilter(clauses)).toThrow(/requires a scalar/)
  })
})

// ---------------------------------------------------------------------------
// parseFilterClauses — input validation
// ---------------------------------------------------------------------------

describe('parseFilterClauses() — input validation', () => {
  it('parses a valid equality clause', () => {
    const clauses = parseFilterClauses([{ field: 'lang', op: '=', value: 'en' }])
    expect(clauses).toHaveLength(1)
    expect(clauses[0].field).toBe('lang')
    expect(clauses[0].op).toBe('=')
    expect(clauses[0].value).toBe('en')
  })

  it('parses a valid IN clause with array value', () => {
    const clauses = parseFilterClauses([{ field: 'type', op: 'IN', value: ['quran', 'hadith'] }])
    expect(clauses[0].op).toBe('IN')
    expect(clauses[0].value).toEqual(['quran', 'hadith'])
  })

  it('parses multiple clauses', () => {
    const clauses = parseFilterClauses([
      { field: 'lang', op: '=', value: 'en' },
      { field: 'category', op: '!=', value: 'sect' },
    ])
    expect(clauses).toHaveLength(2)
  })

  it('rejects non-array input', () => {
    expect(() => parseFilterClauses('lang = "en"')).toThrow(/must be an array/)
  })

  it('rejects null input', () => {
    expect(() => parseFilterClauses(null)).toThrow(/must be an array/)
  })

  it('rejects non-object element', () => {
    expect(() => parseFilterClauses(['lang = "en"'])).toThrow(/must be an object/)
  })

  it('rejects missing field', () => {
    expect(() => parseFilterClauses([{ op: '=', value: 'en' }])).toThrow(/field must be/)
  })

  it('rejects invalid op', () => {
    expect(() => parseFilterClauses([{ field: 'lang', op: '>', value: 'en' }])).toThrow(/op must be/)
  })

  it('rejects numeric value', () => {
    expect(() => parseFilterClauses([{ field: 'lang', op: '=', value: 42 }])).toThrow(/value must be/)
  })

  it('rejects array with non-string elements', () => {
    expect(() => parseFilterClauses([{ field: 'type', op: 'IN', value: [1, 2] }])).toThrow(/value must be/)
  })
})

// ---------------------------------------------------------------------------
// Round-trip: parseFilterClauses → buildSafeFilter
// ---------------------------------------------------------------------------

describe('Round-trip: parseFilterClauses → buildSafeFilter', () => {
  it('lang=en round-trips correctly', () => {
    const clauses = parseFilterClauses([{ field: 'lang', op: '=', value: 'en' }])
    expect(buildSafeFilter(clauses)).toBe('lang = "en"')
  })

  it('type IN [quran, hadith] round-trips correctly', () => {
    const clauses = parseFilterClauses([{ field: 'type', op: 'IN', value: ['quran', 'hadith'] }])
    expect(buildSafeFilter(clauses)).toBe('type IN ["quran", "hadith"]')
  })

  it('compound clause round-trips correctly', () => {
    const clauses = parseFilterClauses([
      { field: 'lang', op: '=', value: 'en' },
      { field: 'type', op: 'IN', value: ['quran', 'hadith'] },
    ])
    expect(buildSafeFilter(clauses)).toBe('lang = "en" AND type IN ["quran", "hadith"]')
  })

  it('injection attempt with keyword in value is rejected, not silently sanitized', () => {
    // Attacker sends: field="lang", value='en" AND verified != "true'
    // The value contains the AND keyword — this is REJECTED outright (not silently stripped)
    // because silent sanitization could mask logic bugs; hard rejection is safer.
    const clauses = parseFilterClauses([{ field: 'lang', op: '=', value: 'en" AND verified != "true' }])
    expect(() => buildSafeFilter(clauses)).toThrow(/reserved keyword/)
  })

  it('injection attempt with only quote chars (no keyword) is stripped safely', () => {
    // Attacker sends: value='en"suffix' — quote stripped, no keyword, value is safe
    const clauses = parseFilterClauses([{ field: 'lang', op: '=', value: 'en"suffix' }])
    const filter = buildSafeFilter(clauses)
    expect(filter).toBe('lang = "ensuffix"')
    // Double-quote cannot break out of the value wrapper
    expect(filter.split('"').length).toBeLessThanOrEqual(5) // field = "value" = 4 quotes max
  })
})
