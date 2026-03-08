/**
 * History data layer.
 * Combines: pre-Islamic prophets + post-Prophetic seerah events.
 */

import { getHistoryEvents as getSeerahHistoryEvents } from './seerah'
import prophetsData from '@/data/history/prophets.json'

export interface HistoryEvent {
  id: number
  slug: string
  title_en: string
  title_ar: string
  description_en: string
  year_ah?: number
  year_ce?: number
  date_ah?: string
  date_ce?: string
  period: string
  severity: 1 | 2 | 3  // 1=minor, 2=moderate, 3=major
  place_name?: string
  place_lat?: number
  place_lng?: number
  sources?: string[]
  cross_refs?: string[]  // slugs to related seerah/history events
}

const PERIODS = [
  'Pre-Islamic Prophets',
  'Rashidun Caliphate',
  'Umayyad Dynasty',
  'Abbasid Dynasty',
  'Crusades Era',
  'Mongol Invasions',
  'Mamluk Sultanate',
  'Ottoman Empire',
  'Colonial Era',
  'Modern Era',
  'Contemporary',
] as const

export type HistoryPeriod = (typeof PERIODS)[number]

export function getHistoryPeriods(): string[] {
  return [...PERIODS]
}

function inferPeriod(yearAh: number | undefined): string {
  if (!yearAh) return 'Unknown'
  if (yearAh <= 40) return 'Rashidun Caliphate'
  if (yearAh <= 132) return 'Umayyad Dynasty'
  if (yearAh <= 656) return 'Abbasid Dynasty'
  if (yearAh <= 690) return 'Crusades Era'
  if (yearAh <= 784) return 'Mamluk Sultanate'
  if (yearAh <= 1342) return 'Ottoman Empire'
  if (yearAh <= 1400) return 'Colonial Era'
  return 'Modern Era'
}

function inferSeverity(event: { description_en: string }): 1 | 2 | 3 {
  const desc = event.description_en.toLowerCase()
  if (desc.includes('battle') || desc.includes('conquest') || desc.includes('fall of') || desc.includes('siege'))
    return 3
  if (desc.includes('treaty') || desc.includes('founded') || desc.includes('established'))
    return 2
  return 1
}

let cachedEvents: HistoryEvent[] | null = null

interface ProphetEntry {
  id: number
  slug: string
  title_ar: string
  title_en: string
  description_en: string
  period: string
  severity: number
  place_name?: string
  sources?: string[]
}

export function getHistoryEvents(): HistoryEvent[] {
  if (cachedEvents) return cachedEvents

  // Pre-Islamic prophets
  const prophets: HistoryEvent[] = (prophetsData as ProphetEntry[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title_en: p.title_en,
    title_ar: p.title_ar,
    description_en: p.description_en,
    period: p.period,
    severity: p.severity as 1 | 2 | 3,
    place_name: p.place_name,
    sources: p.sources,
  }))

  // Post-Prophetic events from seerah data (already filtered to year_ah > 11)
  const postProphetic = getSeerahHistoryEvents()

  const seerahEvents: HistoryEvent[] = postProphetic.map((e) => ({
    id: e.id,
    slug: e.slug,
    title_en: e.title_en,
    title_ar: e.title_ar,
    description_en: e.description_en,
    year_ah: e.year_ah ?? undefined,
    date_ah: e.date_ah ?? undefined,
    date_ce: e.date_ce ?? undefined,
    period: inferPeriod(e.year_ah ?? undefined),
    severity: inferSeverity(e),
    place_name: e.place_name ?? undefined,
    place_lat: e.place_lat ?? undefined,
    place_lng: e.place_lng ?? undefined,
  }))

  // Prophets first, then chronological seerah events
  cachedEvents = [...prophets, ...seerahEvents]

  return cachedEvents
}

export function getHistoryEventBySlug(slug: string): HistoryEvent | undefined {
  return getHistoryEvents().find((e) => e.slug === slug)
}

export function getHistoryEventsByPeriod(period: string): HistoryEvent[] {
  return getHistoryEvents().filter((e) => e.period === period)
}
