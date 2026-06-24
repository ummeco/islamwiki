/**
 * AudioGridIsland.tsx — Astro island for the audio listing grid.
 *
 * PURPOSE: Client-side searchable/paginated grid of audio media. Ports
 *   components/listings/audio-grid.tsx (next/link → <a>), reusing the
 *   framework-independent PaginatedGrid verbatim.
 * INPUTS: audios — AudioItem[].
 * OUTPUTS: Interactive grid hydrated via client:load.
 * CONSTRAINTS: No next/* imports.
 * REF: ports components/listings/audio-grid.tsx · D-P2-STACK-CANON
 */
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface AudioItem {
  id: number
  slug: string
  title: string
  speaker?: string
  duration?: string
  tags: string[]
}

export default function AudioGridIsland({ audios }: { audios: AudioItem[] }) {
  return (
    <PaginatedGrid<AudioItem>
      items={audios}
      pageSize={24}
      searchPlaceholder="Search audio by title, speaker, or tag..."
      emptyMessage="No audio content found."
      filterFn={(item, query) => {
        const q = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          (item.speaker?.toLowerCase().includes(q) ?? false) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        )
      }}
      renderItem={(audio) => (
        <a key={audio.id} href={`/audio/${audio.slug}`} className="card group">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-iw-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-iw-text group-hover:text-white line-clamp-2">
                {audio.title}
              </h2>
              {audio.speaker && (
                <p className="mt-1 text-sm text-iw-accent">{audio.speaker}</p>
              )}
              {audio.duration && (
                <p className="mt-1 text-xs text-iw-text-secondary">
                  {audio.duration}
                </p>
              )}
            </div>
          </div>
        </a>
      )}
    />
  )
}
