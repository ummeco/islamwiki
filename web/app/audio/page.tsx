import type { Metadata } from 'next'
import { getMedia } from '@/lib/data/media'
import { AudioGrid } from '@/components/listings/audio-grid'

export const metadata: Metadata = {
  title: 'Audio — Islamic Lectures & Recitations',
  description:
    'Islamic audio content: lectures, recitations, and podcasts with searchable transcripts.',
}

export default function AudioIndexPage() {
  const audios = getMedia('audio')

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Audio</h1>
        <p className="mt-2 text-iw-text-secondary">
          Islamic lectures, Quran recitations, and educational audio with searchable transcripts.
        </p>
      </div>

      <AudioGrid audios={audios} />
    </div>
  )
}
