import type { MetadataRoute } from 'next'
import { getSurahs } from '@/lib/data/quran'
import { getCollections, getBooksByCollection } from '@/lib/data/hadith'
import { getPeople } from '@/lib/data/people'
import { getBooks, getChaptersByBook } from '@/lib/data/books'
import { getArticles } from '@/lib/data/articles'
import { getSeerahEvents } from '@/lib/data/seerah'
import { getAllHistoryEvents } from '@/lib/data/history'
import { getMedia } from '@/lib/data/media'
import { getSects } from '@/lib/data/sects'
import { getWikiPages } from '@/lib/data/wiki'

const BASE_URL = 'https://islam.wiki'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  entries.push(
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/quran`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/hadith`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/seerah`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/history`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/people`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/books`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/videos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/audio`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/sects`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/quran/bookmarks`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/quran/stats`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/recent-changes`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  )

  // Mushaf pages 1–604
  for (let page = 1; page <= 604; page++) {
    entries.push({
      url: `${BASE_URL}/quran/page/${page}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Quran surahs (canonical URLs use numbers, not slugs)
  for (const s of getSurahs()) {
    entries.push({
      url: `${BASE_URL}/quran/${s.number}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }

  // Hadith collections + books
  for (const c of getCollections()) {
    entries.push({
      url: `${BASE_URL}/hadith/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })

    // Books within each collection
    const books = getBooksByCollection(c.id)
    for (const b of books) {
      entries.push({
        url: `${BASE_URL}/hadith/${c.slug}/${b.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  // People
  for (const p of getPeople()) {
    entries.push({
      url: `${BASE_URL}/people/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Books — canonical only (aliases 301-redirect, skip them)
  for (const b of getBooks().filter((b) => b.canonical !== false)) {
    entries.push({
      url: `${BASE_URL}/books/${b.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
    // Chapter URLs
    for (const ch of getChaptersByBook(b.slug)) {
      entries.push({
        url: `${BASE_URL}/books/${b.slug}/${ch.number}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  // Articles
  for (const a of getArticles()) {
    entries.push({
      url: `${BASE_URL}/articles/${a.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  // Seerah events
  for (const e of getSeerahEvents()) {
    entries.push({
      url: `${BASE_URL}/seerah/${e.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // History (prophets, battles, post-Jesus)
  for (const e of getAllHistoryEvents()) {
    entries.push({
      url: `${BASE_URL}/history/${e.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Media (videos + audio)
  for (const m of getMedia()) {
    const path = m.type === 'video' ? 'videos' : 'audio'
    entries.push({
      url: `${BASE_URL}/${path}/${m.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  // Sects
  for (const s of getSects()) {
    entries.push({
      url: `${BASE_URL}/sects/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  // Wiki pages
  for (const w of getWikiPages()) {
    if (w.status === 'published' || w.status === 'stub') {
      entries.push({
        url: `${BASE_URL}/wiki/${w.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    }
  }

  return entries
}
