import { describe, it, expect } from 'vitest'
import { getSects, getSectBySlug, getSectsByCategory } from '@/lib/data/sects'

describe('getSects()', () => {
  it('returns > 10 sects', () => {
    const sects = getSects()
    expect(sects.length).toBeGreaterThan(10)
  })

  it('returns sects with required fields', () => {
    const sects = getSects()
    const first = sects[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('name_ar')
    expect(first).toHaveProperty('name_en')
    expect(first).toHaveProperty('status')
    expect(first).toHaveProperty('category')
  })

  it('status values are normalized to allowed set', () => {
    const allowed = new Set(['mainstream', 'accepted', 'deviant', 'rejected'])
    const sects = getSects()
    sects.forEach((s) => expect(allowed.has(s.status)).toBe(true))
  })
})

describe('getSectBySlug()', () => {
  it('returns Ahl us-Sunnah', () => {
    const sect = getSectBySlug('ahl-us-sunnah')
    expect(sect).toBeDefined()
    expect(sect?.name_en).toMatch(/Ahl/i)
  })

  it('returns Rafidah as rejected status', () => {
    const sect = getSectBySlug('rafidah')
    expect(sect).toBeDefined()
    expect(sect?.status).toBe('rejected')
    expect(sect?.category).toBe('shia')
  })

  it('returns undefined for unknown slug', () => {
    expect(getSectBySlug('not-a-sect')).toBeUndefined()
  })
})

describe('getSectsByCategory()', () => {
  it('returns ahlussunnah sects', () => {
    const sects = getSectsByCategory('ahlussunnah')
    expect(sects.length).toBeGreaterThan(0)
    sects.forEach((s) => expect(s.category).toBe('ahlussunnah'))
  })

  it('returns outside-fold sects including Ahmadiyya', () => {
    const sects = getSectsByCategory('outside-fold')
    expect(sects.length).toBeGreaterThan(0)
    const slugs = sects.map((s) => s.slug)
    expect(slugs).toContain('ahmadiyya')
  })
})
