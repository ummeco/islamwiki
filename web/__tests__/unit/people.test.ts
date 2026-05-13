import { describe, it, expect } from 'vitest'
import { getPeople, getPersonBySlug, getRelationships, getPersonPlaces, getEras } from '@/lib/data/people'

describe('getPeople()', () => {
  it('returns > 400 people', () => {
    const people = getPeople()
    expect(people.length).toBeGreaterThan(400)
  })

  it('returns people with required fields', () => {
    const people = getPeople()
    const first = people[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('name_ar')
    expect(first).toHaveProperty('name_en')
    expect(first).toHaveProperty('era')
    expect(first).toHaveProperty('category')
  })
})

describe('getPersonBySlug()', () => {
  it('returns person for valid slug', () => {
    const people = getPeople()
    const slug = people[0].slug
    const person = getPersonBySlug(slug)
    expect(person).toBeDefined()
    expect(person?.slug).toBe(slug)
  })

  it('returns undefined for unknown slug', () => {
    expect(getPersonBySlug('not-a-person')).toBeUndefined()
  })
})

describe('getRelationships()', () => {
  it('returns relationships for a known person', () => {
    const people = getPeople()
    const person = people.find((p) => p.id === 1) // first person
    if (person) {
      const rels = getRelationships(person.id)
      expect(Array.isArray(rels)).toBe(true)
    }
  })

  it('returns empty array for unknown person', () => {
    expect(getRelationships(999999)).toEqual([])
  })
})

describe('getPersonPlaces()', () => {
  it('returns places for scholars with birth/death info', () => {
    const people = getPeople()
    const withPlace = people.find((p) => p.birth_place_name)
    if (withPlace) {
      const places = getPersonPlaces(withPlace.id)
      expect(places.length).toBeGreaterThan(0)
      expect(places[0]).toHaveProperty('place_name_en')
    }
  })
})

describe('getEras()', () => {
  it('returns non-empty era list', () => {
    const eras = getEras()
    expect(eras.length).toBeGreaterThan(0)
  })

  it('each era has id, label, count', () => {
    const eras = getEras()
    for (const era of eras) {
      expect(era).toHaveProperty('id')
      expect(era).toHaveProperty('label')
      expect(era).toHaveProperty('count')
      expect(era.count).toBeGreaterThan(0)
    }
  })
})
