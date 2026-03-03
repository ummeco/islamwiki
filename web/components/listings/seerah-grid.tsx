'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface SeerahEvent {
  id: number
  slug: string
  title_en: string
  description_en: string
  date_ce?: string
  date_ah?: string
  year_ce?: number
  year_ah?: number
  significance: 'major' | 'moderate' | 'minor'
  place_name?: string
  place_lat?: number
  place_lng?: number
  category?: string
}

const significanceTabs = [
  { label: 'All Events', value: 'all' },
  { label: 'Major', value: 'major' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Minor', value: 'minor' },
]

export function SeerahGrid({ events }: { events: SeerahEvent[] }) {
  return (
    <PaginatedGrid<SeerahEvent>
      items={events}
      pageSize={24}
      searchPlaceholder="Search events..."
      filterFn={(event, query) =>
        event.title_en.toLowerCase().includes(query) ||
        event.description_en.toLowerCase().includes(query) ||
        (event.place_name?.toLowerCase().includes(query) ?? false)
      }
      tabs={significanceTabs}
      tabFilterFn={(event, tab) => tab === 'all' || event.significance === tab}
      gridCols="sm:grid-cols-2 lg:grid-cols-3"
      renderItem={(event) => (
        <Link
          href={`/seerah/${event.slug}`}
          className="card group block h-full"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-iw-accent">
              {event.date_ce || event.date_ah || (event.year_ce ? `${event.year_ce} CE` : '')}
            </span>
            {event.significance === 'major' && (
              <span className="badge bg-iw-accent/10 text-iw-accent">Major</span>
            )}
          </div>
          <h3 className="font-semibold text-iw-text group-hover:text-white">
            {event.title_en}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-iw-text-secondary">
            {event.description_en}
          </p>
          {event.place_name && (
            <p className="mt-2 text-xs text-iw-text-muted">
              {event.place_name}
            </p>
          )}
        </Link>
      )}
      emptyMessage="No events found matching your search."
    />
  )
}
