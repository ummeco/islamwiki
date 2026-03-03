'use client'

import dynamic from 'next/dynamic'
import type { SeerahMapEvent } from './seerah-map'

const SeerahMap = dynamic(
  () => import('./seerah-map').then((mod) => ({ default: mod.SeerahMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-xl border border-iw-border bg-iw-surface">
        <p className="text-iw-text-secondary">Loading map...</p>
      </div>
    ),
  }
)

interface SeerahMapWrapperProps {
  events: SeerahMapEvent[]
}

export function SeerahMapWrapper({ events }: SeerahMapWrapperProps) {
  return <SeerahMap events={events} />
}
