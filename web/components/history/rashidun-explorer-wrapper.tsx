'use client'

import dynamic from 'next/dynamic'
import type { RashidunMapEvent } from './rashidun-map'

const RashidunExplorer = dynamic(
  () => import('@/components/history/rashidun-explorer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-[#3a2a00] bg-[#0f0a00]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#3a2a00] border-t-[#D4AF37]" />
          <p className="text-xs text-[#8a7030]">Loading Rashidun explorer…</p>
        </div>
      </div>
    ),
  }
)

export function RashidunExplorerWrapper({ events }: { events: RashidunMapEvent[] }) {
  return <RashidunExplorer events={events} />
}
