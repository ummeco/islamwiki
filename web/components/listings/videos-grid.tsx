'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface VideoItem {
  id: number
  slug: string
  title: string
  speaker?: string
  duration?: string
  thumbnail_url?: string
  tags: string[]
}

export function VideosGrid({ videos }: { videos: VideoItem[] }) {
  return (
    <PaginatedGrid<VideoItem>
      items={videos}
      pageSize={24}
      searchPlaceholder="Search videos by title or speaker..."
      filterFn={(video, query) =>
        video.title.toLowerCase().includes(query) ||
        (video.speaker?.toLowerCase().includes(query) ?? false) ||
        video.tags.some((t) => t.toLowerCase().includes(query))
      }
      renderItem={(video) => (
        <Link
          href={`/videos/${video.slug}`}
          className="card group block h-full"
        >
          {video.thumbnail_url && (
            <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-iw-elevated">
              <div className="flex h-full items-center justify-center text-iw-text-muted">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
          <h2 className="font-semibold text-iw-text group-hover:text-white">
            {video.title}
          </h2>
          {video.speaker && (
            <p className="mt-1 text-sm text-iw-accent">{video.speaker}</p>
          )}
          {video.duration && (
            <p className="mt-1 text-xs text-iw-text-secondary">{video.duration}</p>
          )}
        </Link>
      )}
      emptyMessage="No video content yet."
    />
  )
}
