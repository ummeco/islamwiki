/**
 * S9-30: Chunked sitemap with generateSitemaps() for 70K+ hadith URLs.
 *
 * Chunk 0:  All non-hadith URLs (static pages, Quran, People, Books, Articles,
 *           Seerah, History, Media, Sects, Wiki) + hadith collection + book pages.
 * Chunks 1-16: One per hadith collection (Ahmad split to 2 chunks).
 *              Each chunk ≤ 50K URLs.
 *
 * Hreflang (ar, id) is added to all content pages where the locale is meaningful.
 */
import type { MetadataRoute } from 'next'
import { getSurahs } from '@/lib/data/quran'
import { getCollections, getBooksByCollection, getHadithNumbersByBook } from '@/lib/data/hadith'
import { getAllPeople } from '@/lib/data/people'
import { getBooks, getChaptersByBook } from '@/lib/data/books'
import { getArticles } from '@/lib/data/articles'
import { getSeerahEvents } from '@/lib/data/seerah'
import { getAllHistoryEvents } from '@/lib/data/history'
import { getMedia } from '@/lib/data/media'
import { getSects } from '@/lib/data/sects'
import { getWikiPages } from '@/lib/data/wiki'

const BASE_URL = 'https://islam.wiki'
const HREFLANG_LOCALES = ['ar', 'id'] as const

/** Build alternates for a canonical URL */
function withAlternates(url: string): { url: string; alternates?: { languages: Record<string, string> } } {
  return {
    url,
    alternates: {
      languages: Object.fromEntries(
        HREFLANG_LOCALES.map((locale) => [locale, `${BASE_URL}/${locale}${url.replace(BASE_URL, '')}`])
      ),
    },
  }
}

// Hadith collection slugs in a stable order — Ahmad is split into two
// because it has the most hadith (~27K). Adjust if collections change.
const COLLECTION_SLUGS = [
  'bukhari',    // chunk 1
  'muslim',     // chunk 2
  'abu-dawud',  // chunk 3
  'tirmidhi',   // chunk 4
  'nasai',      // chunk 5
  'ibn-majah',  // chunk 6
  'muwatta',    // chunk 7
  'ahmad-a',    // chunk 8  (Ahmad, first half)
  'ahmad-b',    // chunk 9  (Ahmad, second half)
  'darimi',     // chunk 10
  'bulugh-maram',      // chunk 11
  'riyad-saliheen',    // chunk 12
  'adab-mufrad',       // chunk 13
  'shamil',            // chunk 14
  'nawawi-40',         // chunk 15
  'qudsi',             // chunk 16
] as const

/** Required by Next.js for multiple sitemap files */
export async function generateSitemaps() {
  return [
    { id: 0 },
    ...COLLECTION_SLUGS.map((_, i) => ({ id: i + 1 })),
  ]
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Chunk 0: everything except individual hadith pages ─────────────────
  if (id === 0) {
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
      { url: `${BASE_URL}/recent-changes`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
      { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    )

    // Quran juz 1–30
    for (let juz = 1; juz <= 30; juz++) {
      entries.push({
        ...withAlternates(`${BASE_URL}/quran/juz/${juz}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      } as MetadataRoute.Sitemap[number])
    }

    // Mushaf pages 1–604
    for (let page = 1; page <= 604; page++) {
      entries.push({
        url: `${BASE_URL}/quran/page/${page}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    // Quran surahs
    for (const s of getSurahs()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/quran/${s.number}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.9,
      } as MetadataRoute.Sitemap[number])
    }

    // Hadith: collection + book pages only (individual hadith are in chunks 1-16)
    for (const c of getCollections()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/hadith/${c.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      } as MetadataRoute.Sitemap[number])

      for (const b of getBooksByCollection(c.id)) {
        entries.push({
          ...withAlternates(`${BASE_URL}/hadith/${c.slug}/${b.slug}`),
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.7,
        } as MetadataRoute.Sitemap[number])
      }
    }

    // People
    for (const p of getAllPeople()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/people/${p.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      } as MetadataRoute.Sitemap[number])
    }

    // Books
    for (const b of getBooks().filter((b) => b.canonical !== false)) {
      entries.push({
        ...withAlternates(`${BASE_URL}/books/${b.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      } as MetadataRoute.Sitemap[number])
      for (const ch of getChaptersByBook(b.slug)) {
        entries.push({
          ...withAlternates(`${BASE_URL}/books/${b.slug}/${ch.number}`),
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.6,
        } as MetadataRoute.Sitemap[number])
      }
    }

    // Articles
    for (const a of getArticles()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/articles/${a.slug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      } as MetadataRoute.Sitemap[number])
    }

    // Seerah events
    for (const e of getSeerahEvents()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/seerah/${e.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      } as MetadataRoute.Sitemap[number])
    }

    // History
    for (const e of getAllHistoryEvents()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/history/${e.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      } as MetadataRoute.Sitemap[number])
    }

    // Media
    for (const m of getMedia()) {
      const p = m.type === 'video' ? 'videos' : 'audio'
      entries.push({
        ...withAlternates(`${BASE_URL}/${p}/${m.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      } as MetadataRoute.Sitemap[number])
    }

    // Sects
    for (const s of getSects()) {
      entries.push({
        ...withAlternates(`${BASE_URL}/sects/${s.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      } as MetadataRoute.Sitemap[number])
    }

    // Wiki pages
    for (const w of getWikiPages()) {
      if (w.status === 'published' || w.status === 'stub') {
        entries.push({
          ...withAlternates(`${BASE_URL}/wiki/${w.slug}`),
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.5,
        } as MetadataRoute.Sitemap[number])
      }
    }

    return entries
  }

  // ── Chunks 1-16: individual hadith pages per collection ────────────────
  const collectionSlug = COLLECTION_SLUGS[id - 1]
  if (!collectionSlug) return []

  // Handle Ahmad split: ahmad-a = first half of Ahmad hadith, ahmad-b = second half
  const baseSlug = collectionSlug.replace(/-[ab]$/, (m) =>
    m === '-a' || m === '-b' ? '' : m
  ).replace(/^-/, '')

  const realSlug = collectionSlug.startsWith('ahmad') ? 'ahmad' : collectionSlug
  const collections = getCollections()
  const coll = collections.find((c) => c.slug === realSlug)
  if (!coll) return []

  const entries: MetadataRoute.Sitemap = []
  const books = getBooksByCollection(coll.id)

  for (const book of books) {
    const nums = getHadithNumbersByBook(book.id)
    // For Ahmad split: -a gets first half of books, -b gets second half
    let booksToProcess = nums
    if (collectionSlug === 'ahmad-a') {
      booksToProcess = nums.slice(0, Math.ceil(nums.length / 2))
    } else if (collectionSlug === 'ahmad-b') {
      booksToProcess = nums.slice(Math.ceil(nums.length / 2))
    }

    for (const n of booksToProcess) {
      entries.push({
        ...withAlternates(`${BASE_URL}/hadith/${coll.slug}/${book.slug}/${n}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      } as MetadataRoute.Sitemap[number])
    }
  }

  return entries
}
