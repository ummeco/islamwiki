/**
 * History data layer.
 * Sections: prophets | post-jesus | islamic-history | modern | battles
 */

import { getHistoryEvents as getSeerahHistoryEvents } from './seerah'
import prophetsData from '@/data/history/prophets.json'

// Optional data files — loaded only when present
let postJesusData: PostJesusEntry[] | null = null
let battlesData: BattleEntry[] | null = null
try { postJesusData = require('@/data/history/post-jesus.json') } catch { /* not yet created */ }
try { battlesData = require('@/data/history/battles.json') } catch { /* not yet created */ }

export type HistorySection = 'prophets' | 'post-jesus' | 'islamic-history' | 'modern' | 'battles'

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
  section: HistorySection
  severity: 1 | 2 | 3
  place_name?: string
  place_lat?: number
  place_lng?: number
  sources?: string[]
  outcome?: 'muslim_victory' | 'muslim_defeat' | 'inconclusive'
  muslim_commander?: string
  opponent?: string
  people_slug?: string
}

export interface ProphetEntry {
  id: number
  slug: string
  title_ar: string
  title_en: string
  description_en: string
  description_id?: string
  period: string
  severity: number
  place_name?: string
  sources?: string[]
  people_slug?: string
}

export interface PostJesusEntry {
  id: number
  slug: string
  title_en: string
  title_ar: string
  date_ce?: string
  period: string
  section: string
  description_en: string
  sources?: string[]
}

export interface BattleEntry {
  id: number
  slug: string
  title_en: string
  title_ar: string
  date_ah?: number
  date_ce?: number
  date_display?: string
  period: string
  location?: string
  location_lat?: number
  location_lng?: number
  muslim_commander?: string
  opponent?: string
  outcome?: 'muslim_victory' | 'muslim_defeat' | 'inconclusive'
  significance?: string
  description_en: string
  sources?: string[]
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

function inferSection(yearAh: number | undefined): HistorySection {
  if (!yearAh) return 'modern'
  if (yearAh >= 1350) return 'modern'
  return 'islamic-history'
}

function inferSeverity(event: { description_en: string }): 1 | 2 | 3 {
  const desc = event.description_en.toLowerCase()
  if (
    desc.includes('battle') ||
    desc.includes('conquest') ||
    desc.includes('fall of') ||
    desc.includes('siege') ||
    desc.includes('massacre')
  )
    return 3
  if (
    desc.includes('treaty') ||
    desc.includes('founded') ||
    desc.includes('established') ||
    desc.includes('caliphate')
  )
    return 2
  return 1
}

let cachedEvents: HistoryEvent[] | null = null

export function getAllHistoryEvents(): HistoryEvent[] {
  if (cachedEvents) return cachedEvents

  // 1. Pre-Islamic prophets (25 Quranic prophets)
  const prophets: HistoryEvent[] = (prophetsData as ProphetEntry[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title_en: p.title_en,
    title_ar: p.title_ar,
    description_en: p.description_en,
    period: p.period,
    section: 'prophets' as HistorySection,
    severity: (p.severity ?? 3) as 1 | 2 | 3,
    place_name: p.place_name,
    sources: p.sources,
    people_slug: p.people_slug ?? p.slug,
  }))

  // 2. Between Isa and Muhammad ﷺ
  const postJesus: HistoryEvent[] = (postJesusData ?? []).map((e, i) => ({
    id: 1000 + i,
    slug: e.slug,
    title_en: e.title_en,
    title_ar: e.title_ar,
    description_en: e.description_en,
    period: 'Between Isa and Muhammad ﷺ',
    section: 'post-jesus' as HistorySection,
    severity: 2 as const,
    sources: e.sources,
  }))

  // 3. Battles throughout Islamic history
  const battles: HistoryEvent[] = (battlesData ?? []).map((b, i) => {
    const slug = b.slug.startsWith('battle-') ? b.slug : `battle-${b.slug}`
    return {
      id: 2000 + i,
      slug,
      title_en: b.title_en,
      title_ar: b.title_ar,
      description_en: b.description_en,
      year_ah: b.date_ah,
      year_ce: b.date_ce,
      period: b.period,
      section: 'battles' as HistorySection,
      severity: 3 as const,
      place_name: b.location,
      place_lat: b.location_lat,
      place_lng: b.location_lng,
      outcome: b.outcome,
      muslim_commander: b.muslim_commander,
      opponent: b.opponent,
      sources: b.sources,
    }
  })

  // 4. Post-Prophetic seerah events
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
    section: inferSection(e.year_ah ?? undefined),
    severity: inferSeverity(e),
    place_name: e.place_name ?? undefined,
    place_lat: e.place_lat ?? undefined,
    place_lng: e.place_lng ?? undefined,
  }))

  cachedEvents = [...prophets, ...postJesus, ...battles, ...seerahEvents]
  return cachedEvents
}

// Legacy alias — returns prophets + post-prophetic (no battles, no post-jesus)
export function getHistoryEvents(): HistoryEvent[] {
  return getAllHistoryEvents().filter(
    (e) =>
      e.section === 'prophets' ||
      e.section === 'islamic-history' ||
      e.section === 'modern'
  )
}

export function getHistoryEventsBySection(section: HistorySection): HistoryEvent[] {
  return getAllHistoryEvents().filter((e) => e.section === section)
}

export function getHistoryEventBySlug(slug: string): HistoryEvent | undefined {
  return getAllHistoryEvents().find((e) => e.slug === slug)
}

export function getHistoryEventsByPeriod(period: string): HistoryEvent[] {
  return getAllHistoryEvents().filter((e) => e.period === period)
}

export function getSectionCounts(): Record<HistorySection, number> {
  const all = getAllHistoryEvents()
  return {
    prophets: all.filter((e) => e.section === 'prophets').length,
    'post-jesus': all.filter((e) => e.section === 'post-jesus').length,
    'islamic-history': all.filter((e) => e.section === 'islamic-history').length,
    modern: all.filter((e) => e.section === 'modern').length,
    battles: all.filter((e) => e.section === 'battles').length,
  }
}
