/**
 * S9-16 / S9-20 / S9-24: Meilisearch-backed search.
 *
 * Async search via Meilisearch indices (iw_quran, iw_hadith, iw_books, …).
 * Returns the same GroupedResults shape as the static searchGrouped() in lib/search.ts
 * so the search page can use either backend transparently.
 *
 * Falls back to the static search when MEILISEARCH_HOST is not set (local dev without
 * Meilisearch, or before indices are populated).
 *
 * Type filter values must match the ALLOWED_FILTERS allowlist in app/api/search/route.ts.
 *
 * Usage (server component):
 *   import { searchMeilisearch } from '@/lib/search-meilisearch'
 *   const results = await searchMeilisearch(query, typeFilter)
 */

import { MeiliSearch } from 'meilisearch'
import type { GroupedResults, SearchResult } from './search'
import { INDEX_NAMES } from './search/schema'

// ── Client (lazy init — avoids module-level errors when env var is missing) ─

let _client: MeiliSearch | null = null

function getClient(): MeiliSearch | null {
  if (!process.env.MEILISEARCH_HOST) return null
  if (!_client) {
    _client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_SEARCH_KEY ?? process.env.MEILISEARCH_KEY ?? '',
    })
  }
  return _client
}

// ── Type mappings ────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  quran: 'Quran',
  hadith: 'Hadith',
  book: 'Books',
  people: 'Scholars & People',
  article: 'Articles',
  seerah: 'Seerah',
  video: 'Videos',
  audio: 'Audio',
}

const GROUP_ORDER = ['quran', 'hadith', 'book', 'people', 'article', 'seerah', 'video', 'audio']

// ── Meilisearch multi-index search ──────────────────────────────────────────

interface QuranHit {
  id: string
  surah_slug: string
  surah_number: number
  ayah_number: number
  text_en: string | null
  text_ar: string
  surah_name_en?: string
}

interface HadithHit {
  id: string
  collection_slug: string
  book_slug: string
  number: number
  text_en: string | null
  collection_name?: string
  book_name?: string
  grade?: string
}

interface BookHit {
  id: string
  book_slug: string
  title_en: string
  author_name_en?: string
  content_en?: string
  madhab?: string
  subject?: string
}

interface PeopleHit {
  id: string
  slug: string
  name_en: string
  bio_short?: string
  era?: string
  madhab?: string
}

/** Perform a multi-index Meilisearch search. Returns GroupedResults or null on failure. */
export async function searchMeilisearch(
  query: string,
  typeFilter = '',
  limit = 20
): Promise<GroupedResults | null> {
  const client = getClient()
  if (!client || !query.trim()) return null

  // Determine which indices to query
  type IndexKey = 'quran' | 'hadith' | 'books' | 'people'
  const typeToIndex: Record<string, IndexKey> = {
    quran: 'quran',
    hadith: 'hadith',
    book: 'books',
    people: 'people',
  }

  const indicesToQuery: IndexKey[] = typeFilter && typeToIndex[typeFilter]
    ? [typeToIndex[typeFilter]]
    : ['quran', 'hadith', 'books', 'people']

  try {
    // Fan out to all relevant indices in parallel
    const results = await Promise.allSettled(
      indicesToQuery.map((indexKey) =>
        client.index(INDEX_NAMES[indexKey]).search(query, {
          limit,
          attributesToHighlight: ['text_en', 'title_en'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        })
      )
    )

    const groups: GroupedResults['groups'] = []
    let total = 0

    for (let i = 0; i < indicesToQuery.length; i++) {
      const indexKey = indicesToQuery[i]
      const settled = results[i]
      if (settled.status === 'rejected') continue

      const hits = settled.value.hits as Record<string, unknown>[]
      if (hits.length === 0) continue

      let type: string
      let searchResults: SearchResult[]

      switch (indexKey) {
        case 'quran': {
          type = 'quran'
          searchResults = (hits as unknown as QuranHit[]).map((h) => ({
            type,
            title: h.surah_name_en
              ? `${h.surah_name_en} — Verse ${h.ayah_number}`
              : `Surah ${h.surah_number}:${h.ayah_number}`,
            snippet: h.text_en ? h.text_en.slice(0, 140) : h.text_ar.slice(0, 60),
            url: `/quran/${h.surah_number}/${h.ayah_number}`,
            meta: `${h.surah_number}:${h.ayah_number}`,
          }))
          break
        }
        case 'hadith': {
          type = 'hadith'
          searchResults = (hits as unknown as HadithHit[]).map((h) => ({
            type,
            title: `${h.collection_name ?? h.collection_slug} — Hadith #${h.number}`,
            snippet: h.text_en ? h.text_en.slice(0, 140) : '',
            url: `/hadith/${h.collection_slug}/${h.book_slug}/${h.number}`,
            meta: h.grade ?? '',
          }))
          break
        }
        case 'books': {
          type = 'book'
          searchResults = (hits as unknown as BookHit[]).map((h) => ({
            type,
            title: h.title_en,
            snippet: h.content_en
              ? h.content_en.slice(0, 140)
              : h.author_name_en
                ? `By ${h.author_name_en}`
                : '',
            url: `/books/${h.book_slug}`,
            meta: h.author_name_en ?? '',
          }))
          break
        }
        case 'people': {
          type = 'people'
          searchResults = (hits as unknown as PeopleHit[]).map((h) => ({
            type,
            title: h.name_en,
            snippet: h.bio_short ?? (h.era ? `${h.era} scholar` : ''),
            url: `/people/${h.slug}`,
            meta: h.era ?? '',
          }))
          break
        }
        default:
          continue
      }

      total += searchResults.length
      groups.push({
        type,
        label: GROUP_LABELS[type] ?? type,
        results: searchResults,
        total: searchResults.length,
      })
    }

    // Sort by GROUP_ORDER
    groups.sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.type)
      const bi = GROUP_ORDER.indexOf(b.type)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })

    return { groups, total }
  } catch {
    return null
  }
}

/** Check if Meilisearch is configured (MEILISEARCH_HOST is set). */
export function isMeilisearchConfigured(): boolean {
  return Boolean(process.env.MEILISEARCH_HOST)
}
