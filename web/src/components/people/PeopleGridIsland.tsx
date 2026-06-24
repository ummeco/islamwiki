/**
 * PeopleGridIsland.tsx — Astro island port of components/listings/people-grid.tsx.
 *
 * PURPOSE: Searchable + era-filtered paginated grid of people. Mechanical swap only:
 *   next/link <Link href> → native <a href>. Reuses the framework-independent
 *   PaginatedGrid + formatIslamicYear verbatim.
 * INPUTS: people (PersonItem[]), eras (EraInfo[]) — serialized on the server page.
 * OUTPUTS: Interactive grid hydrated via client:load.
 * CONSTRAINTS: No next/* imports. Serializable props only.
 * REF: ports components/listings/people-grid.tsx · D-P2-STACK-CANON
 */
import { PaginatedGrid } from '@/components/ui/paginated-grid'
import { formatIslamicYear } from '@/lib/dates/hijri'

interface PersonItem {
  id: number
  slug: string
  name_en: string
  name_ar?: string
  birth_year_ah?: number
  birth_year_ce?: number
  death_year_ah?: number
  death_year_ce?: number
  era: string
  category: string
  bio_short_en?: string
}

interface EraInfo {
  id: string
  label: string
  count: number
}

export default function PeopleGridIsland({
  people,
  eras,
}: {
  people: PersonItem[]
  eras: EraInfo[]
}) {
  const eraTabs = [
    { label: 'All', value: 'all' },
    ...eras.map((e) => ({ label: `${e.label} (${e.count})`, value: e.id })),
  ]

  return (
    <PaginatedGrid<PersonItem>
      items={people}
      pageSize={30}
      searchPlaceholder="Search by name..."
      filterFn={(person, query) =>
        person.name_en.toLowerCase().includes(query) ||
        (person.name_ar?.includes(query) ?? false) ||
        (person.bio_short_en?.toLowerCase().includes(query) ?? false)
      }
      tabs={eraTabs}
      tabFilterFn={(person, tab) => tab === 'all' || person.era === tab}
      renderItem={(person) => (
        <a href={`/people/${person.slug}`} className="card group h-full">
          <h3 className="font-semibold text-iw-text group-hover:text-white">
            {person.name_en}
          </h3>
          {person.name_ar && (
            <p className="arabic-text text-sm text-white/70">{person.name_ar}</p>
          )}
          <p className="mt-1 text-xs text-iw-text-secondary">
            {(person.birth_year_ah || person.birth_year_ce) &&
              `b. ${formatIslamicYear(person.birth_year_ah, person.birth_year_ce)}`}
            {(person.birth_year_ah || person.birth_year_ce) &&
              (person.death_year_ah || person.death_year_ce) &&
              ' — '}
            {(person.death_year_ah || person.death_year_ce) &&
              `d. ${formatIslamicYear(person.death_year_ah, person.death_year_ce)}`}
          </p>
          {person.bio_short_en && (
            <p className="mt-2 line-clamp-2 text-xs text-iw-text-secondary/70">
              {person.bio_short_en}
            </p>
          )}
          <span className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent group-hover:text-iw-accent-light">
            View →
          </span>
        </a>
      )}
      emptyMessage="No scholars found matching your search."
    />
  )
}
