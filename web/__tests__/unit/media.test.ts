import { describe, it, expect } from 'vitest'
import { getMedia, getMediaBySlug } from '@/lib/data/media'

describe('getMedia', () => {
  it('returns an array', () => {
    const result = getMedia()
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns all items when no type filter', () => {
    const all = getMedia()
    expect(all.length).toBeGreaterThan(0)
  })

  it('filters by type=video', () => {
    const videos = getMedia('video')
    expect(videos.every((m) => m.type === 'video')).toBe(true)
    expect(videos.length).toBeGreaterThan(0)
  })

  it('filters by type=audio', () => {
    const audio = getMedia('audio')
    // may be empty if no audio in fixture; just assert type correctness
    expect(audio.every((m) => m.type === 'audio')).toBe(true)
  })

  it('total equals sum of video + audio', () => {
    const all = getMedia()
    const videos = getMedia('video')
    const audio = getMedia('audio')
    expect(all.length).toBe(videos.length + audio.length)
  })

  it('each item has required fields', () => {
    const first = getMedia()[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('title')
    expect(first).toHaveProperty('type')
    expect(first).toHaveProperty('external_url')
    expect(first).toHaveProperty('language')
    expect(first).toHaveProperty('tags')
  })
})

describe('getMediaBySlug', () => {
  it('returns undefined for unknown slug', () => {
    expect(getMediaBySlug('nonexistent-slug-xyz-999')).toBeUndefined()
  })

  it('returns a matching item for a known slug', () => {
    const all = getMedia()
    const first = all[0]
    const found = getMediaBySlug(first.slug)
    expect(found).toBeDefined()
    expect(found?.id).toBe(first.id)
    expect(found?.slug).toBe(first.slug)
  })

  it('returns the correct item when multiple exist', () => {
    const all = getMedia()
    if (all.length > 1) {
      const second = all[1]
      const found = getMediaBySlug(second.slug)
      expect(found?.slug).toBe(second.slug)
    }
  })
})
