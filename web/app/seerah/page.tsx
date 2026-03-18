import type { Metadata } from 'next'
import { getSeerahEvents } from '@/lib/data/seerah'
import { SeerahExplorer } from '@/components/seerah/seerah-explorer'
import { getHreflangAlternates } from '@/components/seo/hreflang'

export const metadata: Metadata = {
  title: 'Seerah \u2014 Life of Prophet Muhammad \uFDFA',
  description:
    "An interactive journey through the life of Prophet Muhammad \uFDFA. Explore 200+ chronological events with geographic routes, battle maps, and the Hijrah — from birth in Mecca to the establishment of the Islamic state in Medina.",
  alternates: { languages: getHreflangAlternates('/seerah') },
}

export default function SeerahIndexPage() {
  const events = getSeerahEvents()

  return (
    // Full-viewport below the fixed header (h-20 = 5rem)
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <SeerahExplorer events={events} />
    </div>
  )
}
