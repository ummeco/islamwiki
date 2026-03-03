'use client'
import type { VerseGroup } from '@/data/quran/verse-groups'

interface VerseGroupBadgeProps {
  group: VerseGroup
}

export function VerseGroupBadge({ group }: VerseGroupBadgeProps) {
  return (
    <div className="mb-4 mt-8 rounded-lg border border-iw-accent/20 bg-iw-accent/5 px-4 py-3">
      <h3 className="text-sm font-semibold text-iw-accent">{group.titleEn}</h3>
      <p className="mt-1 text-xs text-iw-text-muted">{group.summaryEn}</p>
      <p className="mt-1.5 text-xs text-iw-text-muted/60">
        Verses {group.startAyah}–{group.endAyah}
      </p>
    </div>
  )
}
