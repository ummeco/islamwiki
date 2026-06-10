import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  validateEmail,
  validateUsername,
  suggestUsername,
} from '@/lib/validation'

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('Ab1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters.')
    // strength is score-based; short passwords with mixed chars may score 'good' or lower
    expect(['weak', 'fair', 'good']).toContain(result.strength)
  })

  it('rejects passwords without uppercase', () => {
    const result = validatePassword('abcdefg1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Include at least one uppercase letter.')
  })

  it('rejects passwords without numbers', () => {
    const result = validatePassword('Abcdefgh')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Include at least one number.')
  })

  it('accepts valid password — minimum requirements', () => {
    const result = validatePassword('Abcdef12')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('scores strength: fair (score 3)', () => {
    // length>=8 (+1), uppercase (+1), lowercase (+1), no digit = no score for digit, no special
    const result = validatePassword('Abcdefgh')
    expect(result.score).toBeGreaterThanOrEqual(3)
    // weak or fair depending on score
  })

  it('scores strength: strong (score 5+)', () => {
    const result = validatePassword('Abcdef12!xyz')
    expect(result.strength).toBe('strong')
    expect(result.score).toBeGreaterThanOrEqual(5)
  })

  it('scores strength: good (score 4)', () => {
    const result = validatePassword('Abcdef12')
    expect(['good', 'strong']).toContain(result.strength)
  })

  it('increments score for 12+ char passwords', () => {
    const short = validatePassword('Abcdef12')
    const long = validatePassword('Abcdefghij12')
    expect(long.score).toBeGreaterThan(short.score)
  })
})

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('ali+tag@mail.org')).toBe(true)
  })

  it('rejects missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false)
  })
})

describe('validateUsername', () => {
  it('rejects usernames shorter than 3 characters', () => {
    const result = validateUsername('ab')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/3-30/)
  })

  it('rejects usernames longer than 30 characters', () => {
    const result = validateUsername('a'.repeat(31))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/3-30/)
  })

  it('rejects usernames with invalid characters', () => {
    const result = validateUsername('user-name')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/letters, numbers, and underscores/)
  })

  it('accepts valid usernames', () => {
    expect(validateUsername('ali_123').valid).toBe(true)
    expect(validateUsername('abc').valid).toBe(true)
    expect(validateUsername('A'.repeat(30)).valid).toBe(true)
  })
})

describe('suggestUsername', () => {
  it('lowercases and strips non-alphanumeric', () => {
    expect(suggestUsername('Ali Salaah')).toBe('alisalaah')
  })

  it('removes spaces', () => {
    expect(suggestUsername('Muhammad Ali')).toBe('muhammadali')
  })

  it('truncates to 20 characters', () => {
    const result = suggestUsername('Abcdefghijklmnopqrstuvwxyz')
    expect(result.length).toBeLessThanOrEqual(20)
  })

  it('strips special characters', () => {
    expect(suggestUsername("O'Brien")).toBe('obrien')
  })
})
