import type { Metadata } from 'next'
import { getPeople, getEras } from '@/lib/data/people'
import { PeopleTimeline } from '@/components/people/timeline'
import { PeopleGrid } from '@/components/listings/people-grid'

export const metadata: Metadata = {
  title: 'People — Islamic Scholars & Historical Figures',
  description:
    'Biographies of Islamic scholars, companions of the Prophet, hadith narrators, jurists, and historical figures. Interactive timeline with teacher-student and family relationships.',
}

export default function PeopleIndexPage() {
  const eras = getEras()
  const people = getPeople()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">People</h1>
        <p className="mt-2 text-iw-text-secondary">
          Scholars, companions, narrators, and historical figures across Islamic history.
        </p>
      </div>

      {/* Interactive Timeline */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-white">Interactive Timeline</h2>
        <PeopleTimeline people={people} />
      </div>

      {/* People grid with search + era filters */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-white">Browse All</h2>
        <PeopleGrid people={people} eras={eras} />
      </div>
    </div>
  )
}
