import { describe, it, expect } from 'vitest'
import { getHistoryEvents, getHistoryEventBySlug, getHistoryPeriods, getHistoryEventsByPeriod } from '@/lib/data/history'

describe('getHistoryEvents()', () => {
  it('returns > 100 events', () => {
    const events = getHistoryEvents()
    expect(events.length).toBeGreaterThan(100)
  })

  it('includes Pre-Islamic Prophets', () => {
    const events = getHistoryEvents()
    const prophets = events.filter((e) => e.period === 'Pre-Islamic Prophets')
    expect(prophets.length).toBeGreaterThan(0)
  })

  it('returns events with required fields', () => {
    const events = getHistoryEvents()
    const first = events[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('title_en')
    expect(first).toHaveProperty('title_ar')
    expect(first).toHaveProperty('description_en')
    expect(first).toHaveProperty('period')
    expect(first).toHaveProperty('severity')
  })

  it('severity is 1, 2, or 3', () => {
    const events = getHistoryEvents()
    for (const e of events) {
      expect([1, 2, 3]).toContain(e.severity)
    }
  })
})

describe('getHistoryEventBySlug()', () => {
  it('returns event for valid slug', () => {
    const events = getHistoryEvents()
    const slug = events[0].slug
    const event = getHistoryEventBySlug(slug)
    expect(event).toBeDefined()
    expect(event?.slug).toBe(slug)
  })

  it('returns undefined for unknown slug', () => {
    expect(getHistoryEventBySlug('not-an-event')).toBeUndefined()
  })
})

describe('getHistoryPeriods()', () => {
  it('returns period list including Pre-Islamic Prophets', () => {
    const periods = getHistoryPeriods()
    expect(periods).toContain('Pre-Islamic Prophets')
    expect(periods).toContain('Rashidun Caliphate')
    expect(periods.length).toBeGreaterThan(5)
  })
})

describe('getHistoryEventsByPeriod()', () => {
  it('returns events for Rashidun Caliphate', () => {
    const events = getHistoryEventsByPeriod('Rashidun Caliphate')
    expect(events.length).toBeGreaterThan(0)
    for (const e of events) {
      expect(e.period).toBe('Rashidun Caliphate')
    }
  })

  it('returns empty for unknown period', () => {
    expect(getHistoryEventsByPeriod('Nonexistent Period')).toEqual([])
  })
})
