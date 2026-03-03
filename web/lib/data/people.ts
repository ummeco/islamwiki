import peopleData from '@/data/people/scholars.json'
import type { PersonEra } from '@/types/content'

interface PersonData {
  id: number
  slug: string
  name_ar: string
  name_en: string
  name_full_en?: string
  title?: string
  kunyah?: string
  laqab?: string
  birth_year_ah?: number
  birth_year_ce?: number
  death_year_ah?: number
  death_year_ce?: number
  birth_place_id?: number
  birth_place_name?: string
  death_place_id?: number
  death_place_name?: string
  bio_short_en?: string
  bio_full_en?: string
  era: PersonEra
  category: string
  tags?: string[]
}

interface RelationshipData {
  id: number
  person_id: number
  related_person_id: number
  related_person_name_en: string
  related_person_slug: string
  relationship_type: string
  notes?: string
}

interface PersonPlaceData {
  id: number
  person_id: number
  place_id: number
  place_name_en: string
  year_start_ah?: number
  year_end_ah?: number
  role?: string
}

interface EraInfo {
  id: PersonEra
  label: string
  count: number
}

const people: PersonData[] = peopleData as PersonData[]

// Static relationships (will be populated from DB in Phase 2)
const relationships: RelationshipData[] = []

// Static person-place data (will be populated from DB in Phase 2)
const personPlaces: PersonPlaceData[] = []

export function getPeople(): PersonData[] {
  return people
}

export function getPersonBySlug(slug: string): PersonData | undefined {
  return people.find((p) => p.slug === slug)
}

export function getRelationships(personId: number): RelationshipData[] {
  return relationships.filter((r) => r.person_id === personId)
}

export function getPersonPlaces(personId: number): PersonPlaceData[] {
  return personPlaces.filter((pp) => pp.person_id === personId)
}

export function getEras(): EraInfo[] {
  const eraLabels: Record<PersonEra, string> = {
    prophet: 'Prophets',
    sahabi: 'Sahabah (Companions)',
    tabii: "Tabi'in (Successors)",
    tabi_tabii: "Tabi' at-Tabi'in",
    classical: 'Classical Era',
    medieval: 'Medieval Era',
    ottoman: 'Ottoman Era',
    modern: 'Modern Era',
  }

  const eraCounts = new Map<PersonEra, number>()
  for (const p of people) {
    eraCounts.set(p.era, (eraCounts.get(p.era) || 0) + 1)
  }

  return (Object.entries(eraLabels) as [PersonEra, string][])
    .filter(([id]) => eraCounts.has(id))
    .map(([id, label]) => ({
      id,
      label,
      count: eraCounts.get(id) || 0,
    }))
}
