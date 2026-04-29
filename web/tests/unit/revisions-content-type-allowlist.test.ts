/**
 * Tests for S9-01: contentType allowlist on the revisions API endpoint.
 *
 * Covers:
 * 1. Every value in ALLOWED_CONTENT_TYPES passes validateContentType().
 * 2. Empty string, null, undefined are rejected.
 * 3. Arbitrary / malicious strings are rejected.
 * 4. Type-confused inputs (object, number, boolean, array) are rejected.
 */
import { describe, it, expect } from 'vitest'
import {
  ALLOWED_CONTENT_TYPES,
  validateContentType,
  type AllowedContentType,
} from '@/lib/security/content-type-allowlist'

// ── Allowlist pass-through ───────────────────────────────────────────────────

describe('validateContentType() — allowed values pass', () => {
  for (const ct of ALLOWED_CONTENT_TYPES) {
    it(`accepts "${ct}"`, () => {
      expect(validateContentType(ct)).toBe(ct)
    })
  }

  it('returns the value typed as AllowedContentType', () => {
    const result: AllowedContentType = validateContentType('text/markdown')
    expect(result).toBe('text/markdown')
  })
})

// ── Empty / missing values ───────────────────────────────────────────────────

describe('validateContentType() — empty / missing values are rejected', () => {
  it('rejects empty string', () => {
    expect(() => validateContentType('')).toThrow()
  })

  it('rejects null', () => {
    expect(() => validateContentType(null)).toThrow('contentType must be a string')
  })

  it('rejects undefined', () => {
    expect(() => validateContentType(undefined)).toThrow('contentType must be a string')
  })
})

// ── Rejected strings ─────────────────────────────────────────────────────────

describe('validateContentType() — arbitrary strings are rejected', () => {
  const rejected = [
    'text/html; charset=utf-8',          // parameter injection
    'application/javascript',            // XSS vector
    'image/svg+xml',                     // polyglot SVG
    'multipart/form-data',               // protocol confusion
    'application/octet-stream',          // binary download
    '../../../etc/passwd',               // path traversal attempt
    '<script>alert(1)</script>',         // XSS payload in value
    'text/x-custom-type',               // unknown custom MIME
    ' text/markdown',                    // leading whitespace bypass
    'TEXT/MARKDOWN',                     // case variation bypass
    '',                                  // covered above, but double-check
  ]

  for (const val of rejected) {
    it(`rejects "${val}"`, () => {
      expect(() => validateContentType(val)).toThrow()
    })
  }
})

// ── Type confusion ───────────────────────────────────────────────────────────

describe('validateContentType() — non-string types are rejected', () => {
  it('rejects a number', () => {
    expect(() => validateContentType(42)).toThrow('contentType must be a string')
  })

  it('rejects a boolean', () => {
    expect(() => validateContentType(true)).toThrow('contentType must be a string')
  })

  it('rejects an object', () => {
    expect(() => validateContentType({ type: 'text/markdown' })).toThrow('contentType must be a string')
  })

  it('rejects an array', () => {
    expect(() => validateContentType(['text/markdown'])).toThrow('contentType must be a string')
  })

  it('rejects a Symbol', () => {
    expect(() => validateContentType(Symbol('text/markdown'))).toThrow('contentType must be a string')
  })
})

// ── Allowlist completeness ───────────────────────────────────────────────────

describe('ALLOWED_CONTENT_TYPES — completeness check', () => {
  const expected = ['text/markdown', 'text/plain', 'text/html', 'application/json']

  it('contains exactly the expected set', () => {
    expect([...ALLOWED_CONTENT_TYPES].sort()).toEqual(expected.sort())
  })

  it('is a readonly tuple (non-empty)', () => {
    expect(ALLOWED_CONTENT_TYPES.length).toBeGreaterThan(0)
  })
})
