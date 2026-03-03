import type { Metadata } from 'next'
import { getMedia } from '@/lib/data/media'
import { VideosGrid } from '@/components/listings/videos-grid'

export const metadata: Metadata = {
  title: 'Videos \u2014 Islamic Lectures & Series',
  description:
    'Islamic video lectures and series with searchable transcripts and professional formatting.',
}

export default function VideosIndexPage() {
  const videos = getMedia('video')

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Videos</h1>
        <p className="mt-2 text-iw-text-secondary">
          Islamic lectures and series from trusted scholars, with searchable transcripts.
        </p>
      </div>

      <VideosGrid videos={videos} />
    </div>
  )
}
