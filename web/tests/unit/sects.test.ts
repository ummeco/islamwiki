import { describe, it, expect } from 'vitest'
import { getSects, getSectBySlug } from '@/lib/data/sects'

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
  })
})

describe('getSectBySlug()', () => {
  it('returns Ahl us-Sunnah', () => {
    const sect = getSectBySlug('ahl-us-sunnah')
    expect(sect).toBeDefined()
    expect(sect?.name_en).toMatch(/Ahl/i)
  })

  it('returns undefined for unknown slug', () => {
    expect(getSectBySlug('not-a-sect')).toBeUndefined()
  })
})
