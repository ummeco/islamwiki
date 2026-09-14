import { describe, it, expect } from 'vitest'
import {
  getHistoryEvents,
  getHistoryEventBySlug,
  getHistoryPeriods,
  getHistoryEventsByPeriod,
  getAllHistoryEvents,
  getHistoryEventsBySection,
  getSectionCounts,
  type HistorySection,
} from '@/lib/data/history'

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

// Added 2026-09-13. getAllHistoryEvents, getHistoryEventsBySection and
// getSectionCounts had no tests at all. vitest 5's v8 provider counts the
// per-section arrow callbacks inside getSectionCounts as functions, which is
// what took this file under its 80% function-coverage threshold when the
// runner was upgraded. Covering them is the fix; the threshold stays at 80.
describe('history sections', () => {
  const SECTIONS: HistorySection[] = [
    'prophets',
    'post-jesus',
    'islamic-history',
    'modern',
    'battles',
  ]

  it('getAllHistoryEvents returns events with a section and a slug', () => {
    const all = getAllHistoryEvents()
    expect(all.length).toBeGreaterThan(0)
    for (const e of all) {
      expect(typeof e.slug).toBe('string')
      expect(e.slug.length).toBeGreaterThan(0)
      expect(SECTIONS).toContain(e.section)
    }
  })

  // Deliberately NOT asserting slug uniqueness. 13 slugs appear twice by
  // design: a battle is listed both in battles.json and in the caliphate-era
  // file for its period, e.g. battle-of-yarmouk in battles and rashidun.
  // getHistoryEventBySlug takes the first match, which is the same event
  // either way. One genuine duplicate does exist inside battles.json —
  // battle-of-ullais is present twice as ids 2011 and 2063, with the same
  // title and two different descriptions — and deduplicating it is a content
  // decision, filed rather than made here.

  it('getHistoryEventsBySection returns only that section', () => {
    for (const section of SECTIONS) {
      for (const e of getHistoryEventsBySection(section)) {
        expect(e.section).toBe(section)
      }
    }
  })

  it('the sections partition getAllHistoryEvents exactly', () => {
    const total = SECTIONS.reduce((n, s) => n + getHistoryEventsBySection(s).length, 0)
    expect(total).toBe(getAllHistoryEvents().length)
  })

  it('getSectionCounts agrees with getHistoryEventsBySection for every section', () => {
    const counts = getSectionCounts()
    for (const section of SECTIONS) {
      expect(counts[section]).toBe(getHistoryEventsBySection(section).length)
    }
  })

  it('getSectionCounts totals to the full event list', () => {
    const counts = getSectionCounts()
    const sum = SECTIONS.reduce((n, s) => n + counts[s], 0)
    expect(sum).toBe(getAllHistoryEvents().length)
  })
})
