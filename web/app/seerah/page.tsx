import type { Metadata } from 'next'
import { getSeerahEvents } from '@/lib/data/seerah'
import { getSeerahContent } from '@/lib/data/seerah-content'
import { SeerahExplorer } from '@/components/seerah/seerah-explorer'

export const metadata: Metadata = {
  title: 'Seerah \u2014 Life of Prophet Muhammad \uFDFA',
  description:
    "An interactive journey through the life of Prophet Muhammad \uFDFA. Explore 200+ chronological events with geographic routes, battle maps, and the Hijrah — from birth in Mecca to the establishment of the Islamic state in Medina.",
}

export default function SeerahIndexPage() {
  const events = getSeerahEvents()

  // Load all markdown content files at build time so the client overlay can render them
  const contentMap: Record<string, string> = {}
  for (const event of events) {
    const content = getSeerahContent(event.slug)
    if (content) contentMap[event.slug] = content
  }

  return (
    // Full-viewport below the fixed header (h-20 = 5rem)
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <SeerahExplorer events={events} contentMap={contentMap} />
    </div>
  )
}
