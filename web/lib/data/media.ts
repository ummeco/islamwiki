import mediaData from '@/data/media/media.json'

interface MediaData {
  id: number
  slug: string
  title: string
  type: 'video' | 'audio'
  external_url: string
  embed_code?: string
  transcript?: string
  duration?: string
  speaker?: string
  speaker_id?: number
  language: string
  tags: string[]
  thumbnail_url?: string
}

const media: MediaData[] = mediaData as MediaData[]

export function getMedia(type?: 'video' | 'audio'): MediaData[] {
  if (type) return media.filter((m) => m.type === type)
  return media
}

export function getMediaBySlug(slug: string): MediaData | undefined {
  return media.find((m) => m.slug === slug)
}
