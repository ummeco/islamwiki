import type { Metadata } from 'next'
import { getSeerahEvents } from '@/lib/data/seerah'
import { SeerahMapWrapper } from '@/components/seerah/seerah-map-wrapper'
import { SeerahGrid } from '@/components/listings/seerah-grid'

export const metadata: Metadata = {
  title: 'Seerah \u2014 Life of Prophet Muhammad \uFDFA',
  description:
    'Interactive timeline and maps of the Prophet Muhammad\'s life. From birth in Mecca to the establishment of the first Islamic state in Medina. Chronological events with historical maps.',
}

export default function SeerahIndexPage() {
  const events = getSeerahEvents()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Seerah \u2014 Life of the Prophet \uFDFA
        </h1>
        <p className="mt-2 text-iw-text-secondary">
          A chronological journey through the life of Prophet Muhammad \uFDFA, from birth
          to the establishment of the first Islamic community. Interactive maps, key events,
          and scholarly references.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="mb-10">
        <SeerahMapWrapper events={events} />
      </div>

      {/* Events grid with search and filters */}
      <h2 className="mb-4 text-xl font-bold text-white">All Events</h2>
      <SeerahGrid events={events} />
    </div>
  )
}
