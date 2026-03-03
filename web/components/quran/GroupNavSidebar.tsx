'use client'
import type { VerseGroup } from '@/data/quran/verse-groups'

interface GroupNavSidebarProps {
  groups: VerseGroup[]
  activeGroupId?: string
  onGroupClick?: (group: VerseGroup) => void
}

export function GroupNavSidebar({ groups, activeGroupId, onGroupClick }: GroupNavSidebarProps) {
  if (groups.length === 0) return null

  return (
    <nav aria-label="Surah sections" className="sticky top-20 space-y-1">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-iw-text-muted">Sections</p>
      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onGroupClick?.(group)}
          aria-current={activeGroupId === group.id ? 'true' : undefined}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeGroupId === group.id
              ? 'bg-iw-accent/10 text-iw-accent'
              : 'text-iw-text-muted hover:bg-iw-surface hover:text-white'
          }`}
        >
          <span className="block font-medium leading-tight">{group.titleEn}</span>
          <span className="mt-0.5 block text-xs opacity-70">
            {group.startAyah === group.endAyah ? `v.${group.startAyah}` : `v.${group.startAyah}–${group.endAyah}`}
          </span>
        </button>
      ))}
    </nav>
  )
}
