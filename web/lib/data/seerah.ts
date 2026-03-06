import eventsData from '@/data/seerah/events.json'

interface SeerahEventData {
  id: number
  slug: string
  title_ar: string
  title_en: string
  date_ah?: string
  date_ce?: string
  year_ah?: number
  summary_en?: string
  description_en: string
  place_id?: number
  place_name?: string
  place_lat?: number
  place_lng?: number
  significance: 'major' | 'moderate' | 'minor'
  sources?: string[]
  order: number
  content_file?: boolean
}

const events: SeerahEventData[] = eventsData as SeerahEventData[]

// Seerah = the Prophet's life, starting from pre-Prophet history context.
// Main narrative: orders 1–100 (chronological) + prophet-burial (order 374).
// Excludes caliphate-of-abu-bakr and battle-of-yamama (post-Prophet history).
// Supplementary detail events (orders 300+) are excluded from the explorer.
// Sorted chronologically: year_ah first (negative = BH), then order within same year.
export function getSeerahEvents(): SeerahEventData[] {
  return events
    .filter((e) => {
      if (e.year_ah == null || e.year_ah > 11) return false
      if (e.slug === 'caliphate-of-abu-bakr' || e.slug === 'battle-of-yamama') return false
      if (e.slug === 'prophet-burial') return true
      return e.order < 200
    })
    .sort((a, b) => {
      // prophet-burial always sorts last
      if (a.slug === 'prophet-burial') return 1
      if (b.slug === 'prophet-burial') return -1
      if (a.year_ah !== b.year_ah) return (a.year_ah ?? 0) - (b.year_ah ?? 0)
      return a.order - b.order
    })
}

// History = everything after the Prophet's death (year_ah > 11) plus undated events
export function getHistoryEvents(): SeerahEventData[] {
  return events
    .filter((e) => e.year_ah === undefined || e.year_ah === null || e.year_ah > 11)
    .sort((a, b) => (a.year_ah ?? 9999) - (b.year_ah ?? 9999))
}

export function getSeerahEventBySlug(slug: string): SeerahEventData | undefined {
  return events.find((e) => e.slug === slug)
}
