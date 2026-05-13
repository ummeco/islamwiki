import { describe, it, expect } from 'vitest'
import { getSeerahEvents, getSeerahEventBySlug } from '@/lib/data/seerah'

describe('getSeerahEvents()', () => {
  it('returns an array with > 100 events', () => {
    const events = getSeerahEvents()
    expect(events.length).toBeGreaterThan(100)
  })

  it('returns events with required fields', () => {
    const events = getSeerahEvents()
    const first = events[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('title_en')
    expect(first).toHaveProperty('title_ar')
    expect(first).toHaveProperty('description_en')
  })

  it('has Arabic titles for all events', () => {
    const events = getSeerahEvents()
    const missingAr = events.filter((e) => !e.title_ar || e.title_ar.trim().length === 0)
    expect(missingAr.length).toBe(0)
  })
})

describe('getSeerahEventBySlug()', () => {
  it('returns event for valid slug', () => {
    const events = getSeerahEvents()
    const slug = events[0].slug
    const event = getSeerahEventBySlug(slug)
    expect(event).toBeDefined()
    expect(event?.slug).toBe(slug)
  })

  it('returns undefined for unknown slug', () => {
    const event = getSeerahEventBySlug('not-a-real-event')
    expect(event).toBeUndefined()
  })
})
