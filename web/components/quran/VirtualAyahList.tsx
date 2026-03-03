'use client'
import { useRef } from 'react'
import { useVirtualAyahs } from '@/hooks/useVirtualAyahs'

interface Ayah {
  number_in_surah: number
  text_ar: string
  translation_en?: string
}

interface VirtualAyahListProps {
  ayahs: Ayah[]
  surahNumber: number
  renderAyah: (ayah: Ayah, index: number) => React.ReactNode
}

const THRESHOLD = 50 // only virtualize if surah has more than this many verses

export function VirtualAyahList({ ayahs, surahNumber, renderAyah }: VirtualAyahListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldVirtualize = ayahs.length > THRESHOLD
  const { start, end } = useVirtualAyahs(ayahs.length, containerRef)

  if (!shouldVirtualize) {
    return (
      <div className="space-y-4">
        {ayahs.map((ayah, i) => renderAyah(ayah, i))}
      </div>
    )
  }

  const estimatedHeight = ayahs.length * 200 // rough total height
  const topPadding = start * 200
  const bottomPadding = Math.max(0, (ayahs.length - end) * 200)
  const visibleAyahs = ayahs.slice(start, end)

  return (
    <div ref={containerRef} style={{ minHeight: estimatedHeight }}>
      <div style={{ height: topPadding }} aria-hidden="true" />
      <div className="space-y-4">
        {visibleAyahs.map((ayah, i) => renderAyah(ayah, start + i))}
      </div>
      <div style={{ height: bottomPadding }} aria-hidden="true" />
    </div>
  )
}
