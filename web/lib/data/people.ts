import peopleData from '@/data/people/scholars.json'
import relData from '@/data/people/relationships.json'
import narratorsData from '@/data/people/narrators.json'
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

interface RawRelation {
  from_id: number
  to_id: number
  type: string
  note?: string
}

const people: PersonData[] = peopleData as PersonData[]
const rawRels: RawRelation[] = relData as RawRelation[]

// Build bidirectional relationships from raw data
const relationships: RelationshipData[] = []
let relIdCounter = 1
for (const rel of rawRels) {
  const fromPerson = people.find((p) => p.id === rel.from_id)
  const toPerson = people.find((p) => p.id === rel.to_id)
  if (fromPerson && toPerson) {
    // Forward: from → to (e.g., teacher → student)
    relationships.push({
      id: relIdCounter++,
      person_id: rel.from_id,
      related_person_id: rel.to_id,
      related_person_name_en: toPerson.name_en,
      related_person_slug: toPerson.slug,
      relationship_type: rel.type === 'teacher' ? 'teacher_of' : rel.type,
      notes: rel.note,
    })
    // Reverse: to → from (e.g., student → teacher)
    relationships.push({
      id: relIdCounter++,
      person_id: rel.to_id,
      related_person_id: rel.from_id,
      related_person_name_en: fromPerson.name_en,
      related_person_slug: fromPerson.slug,
      relationship_type: rel.type === 'teacher' ? 'student_of' : rel.type,
      notes: rel.note,
    })
  }
}

// Build person-place data from birth/death places in scholars.json
const personPlaces: PersonPlaceData[] = []
let placeIdCounter = 1
for (const p of people) {
  if (p.birth_place_name) {
    personPlaces.push({
      id: placeIdCounter++,
      person_id: p.id,
      place_id: p.birth_place_id ?? 0,
      place_name_en: p.birth_place_name,
      year_start_ah: p.birth_year_ah,
      role: 'Born',
    })
  }
  if (p.death_place_name && p.death_place_name !== p.birth_place_name) {
    personPlaces.push({
      id: placeIdCounter++,
      person_id: p.id,
      place_id: p.death_place_id ?? 0,
      place_name_en: p.death_place_name,
      year_start_ah: p.death_year_ah,
      role: 'Died',
    })
  }
}

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

// ── Narrators ─────────────────────────────────────────────────────────────────

export interface NarratorData {
  name_en: string
  slug: string
  person_slug: string | null
  hadith_count: number
  collections: Array<{ collection: string; count: number }>
  bio_short_en?: string
  bio_en?: string
}

const narrators: NarratorData[] = narratorsData as NarratorData[]

export function getNarrators(limit?: number): NarratorData[] {
  return limit ? narrators.slice(0, limit) : narrators
}

export function getNarratorBySlug(slug: string): NarratorData | undefined {
  return narrators.find((n) => n.slug === slug || n.person_slug === slug)
}

export function getTopNarrators(n = 20): NarratorData[] {
  return narrators.slice(0, n)
}

// ── Eras ──────────────────────────────────────────────────────────────────────

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
