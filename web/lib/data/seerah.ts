import eventsData from '@/data/seerah/events.json'

interface SeerahEventData {
  id: number
  slug: string
  title_ar: string
  title_en: string
  date_ah?: string
  date_ce?: string
  year_ah?: number
  description_en: string
  place_id?: number
  place_name?: string
  place_lat?: number
  place_lng?: number
  significance: 'major' | 'moderate' | 'minor'
  sources?: string[]
  order: number
}

const events: SeerahEventData[] = eventsData as SeerahEventData[]

export function getSeerahEvents(): SeerahEventData[] {
  return events.sort((a, b) => a.order - b.order)
}

export function getSeerahEventBySlug(slug: string): SeerahEventData | undefined {
  return events.find((e) => e.slug === slug)
}
