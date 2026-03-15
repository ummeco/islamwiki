import { getSurahs } from './data/quran'
import { getCollections, getBooksByCollection } from './data/hadith'
import { getPeople } from './data/people'
import { getBooks } from './data/books'
import { getArticles } from './data/articles'
import { getSeerahEvents } from './data/seerah'
import { getAllHistoryEvents } from './data/history'
import { getMedia } from './data/media'
import { getSects } from './data/sects'
import { getWikiPages } from './data/wiki'
import transliterationData from '@/data/transliteration.json'

// Build a reverse lookup: variant -> canonical term (lowercased)
const variantMap = new Map<string, string>()
for (const [canonical, variants] of Object.entries(transliterationData.terms)) {
  const lower = canonical.toLowerCase()
  variantMap.set(lower, lower)
  for (const v of variants) {
    variantMap.set(v.toLowerCase(), lower)
  }
}

/** Expand a query to include the canonical term and all its variants */
function expandQuery(raw: string): string[] {
  const q = raw.toLowerCase().trim()
  const terms = [q]
  const canonical = variantMap.get(q)
  if (canonical && canonical !== q) terms.push(canonical)
  const canonicalKey = Object.keys(transliterationData.terms).find(
    (k) => k.toLowerCase() === q || k.toLowerCase() === canonical
  )
  if (canonicalKey) {
    const entry = (transliterationData.terms as Record<string, string[]>)[canonicalKey]
    if (entry) {
      for (const v of entry) terms.push(v.toLowerCase())
    }
  }
  return [...new Set(terms)]
}

export interface SearchResult {
  type: string
  title: string
  snippet: string
  url: string
  meta?: string
}

export interface GroupedResults {
  groups: {
    type: string
    label: string
    results: SearchResult[]
    total: number
  }[]
  total: number
}

function matchesAny(text: string | undefined | null, queries: string[]): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  return queries.some((q) => lower.includes(q))
}

/** Extract a snippet around the first match, with ~60 chars of context each side */
function extractSnippet(text: string, queries: string[], maxLen = 160): string {
  const lower = text.toLowerCase()
  let matchIdx = -1
  let matchLen = 0
  for (const q of queries) {
    const idx = lower.indexOf(q)
    if (idx !== -1) {
      matchIdx = idx
      matchLen = q.length
      break
    }
  }
  if (matchIdx === -1) return text.slice(0, maxLen)
  const start = Math.max(0, matchIdx - 60)
  const end = Math.min(text.length, matchIdx + matchLen + 60)
  let snippet = ''
  if (start > 0) snippet += '...'
  snippet += text.slice(start, end)
  if (end < text.length) snippet += '...'
  return snippet
}

const GROUP_ORDER = ['quran', 'hadith', 'seerah', 'history', 'person', 'book', 'article', 'video', 'audio', 'wiki', 'sect']
const GROUP_LABELS: Record<string, string> = {
  quran: 'Quran',
  hadith: 'Hadith',
  seerah: 'Seerah',
  history: 'History',
  person: 'People',
  book: 'Books',
  article: 'Articles',
  video: 'Video',
  audio: 'Audio',
  wiki: 'Wiki',
  sect: 'Sects',
}

// 30s TTL cache for the client-side fallback search (avoids re-scanning all JSON on every keystroke)
const _fallbackCache = new Map<string, { result: GroupedResults; ts: number }>()
const CACHE_TTL = 30_000

export function searchGrouped(query: string, previewLimit = 3): GroupedResults {
  if (!query.trim()) return { groups: [], total: 0 }
  const cacheKey = `${query.trim().toLowerCase()}|${previewLimit}`
  const cached = _fallbackCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.result

  const q = query.toLowerCase().trim()
  const queries = expandQuery(query)
  const buckets = new Map<string, SearchResult[]>()

  for (const type of GROUP_ORDER) buckets.set(type, [])

  // Quran
  for (const s of getSurahs()) {
    const fields = [s.name_en, s.name_transliteration]
    if (fields.some((f) => matchesAny(f, queries)) || s.name_ar.includes(q)) {
      buckets.get('quran')!.push({
        type: 'quran',
        title: `Surah ${s.name_en} (${s.name_transliteration})`,
        snippet: `${s.verses_count} verses. ${s.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'} surah.`,
        url: `/quran/${s.slug}`,
        meta: `Surah ${s.number}`,
      })
    }
  }

  // Hadith — collections and books
  for (const c of getCollections()) {
    if (matchesAny(c.name_en, queries) || c.name_ar.includes(q) || matchesAny(c.author_name_en, queries)) {
      buckets.get('hadith')!.push({
        type: 'hadith',
        title: c.name_en,
        snippet: `By ${c.author_name_en}. ${c.total_hadith.toLocaleString()} hadith.`,
        url: `/hadith/${c.slug}`,
        meta: 'Collection',
      })
    }
    // Search book names within each collection
    const books = getBooksByCollection(c.id)
    for (const b of books) {
      if (matchesAny(b.name_en, queries) || (b.name_ar && b.name_ar.includes(q))) {
        buckets.get('hadith')!.push({
          type: 'hadith',
          title: `${b.name_en} — ${c.name_en}`,
          snippet: `${b.hadith_count} hadith in this book.`,
          url: `/hadith/${c.slug}/${b.slug}`,
          meta: 'Book',
        })
      }
    }
  }

  // Seerah
  for (const e of getSeerahEvents()) {
    if (matchesAny(e.title_en, queries) || e.title_ar.includes(q) || matchesAny(e.description_en, queries)) {
      buckets.get('seerah')!.push({
        type: 'seerah',
        title: e.title_en,
        snippet: extractSnippet(e.description_en, queries),
        url: `/seerah/${e.slug}`,
        meta: e.date_ah || '',
      })
    }
  }

  // History (prophets, battles, post-Jesus)
  for (const e of getAllHistoryEvents()) {
    if (
      matchesAny(e.title_en, queries) ||
      e.title_ar.includes(q) ||
      matchesAny(e.description_en, queries) ||
      (e.muslim_commander && matchesAny(e.muslim_commander, queries)) ||
      (e.opponent && matchesAny(e.opponent, queries))
    ) {
      const sectionLabel = e.section === 'battles' ? 'Battle' : e.section === 'prophets' ? 'Prophet' : 'History'
      buckets.get('history')!.push({
        type: 'history',
        title: e.title_en,
        snippet: extractSnippet(e.description_en, queries),
        url: `/history/${e.slug}`,
        meta: `${sectionLabel} · ${e.period}`,
      })
    }
  }

  // People
  for (const p of getPeople()) {
    const bio = p.bio_short_en || ''
    if (
      matchesAny(p.name_en, queries) ||
      p.name_ar.includes(q) ||
      (bio && matchesAny(bio, queries)) ||
      (p.tags && p.tags.some((t: string) => matchesAny(t, queries)))
    ) {
      buckets.get('person')!.push({
        type: 'person',
        title: p.name_en,
        snippet: bio ? extractSnippet(bio, queries) : `${p.era} era ${p.category}`,
        url: `/people/${p.slug}`,
        meta: p.era || '',
      })
    }
  }

  // Books
  for (const b of getBooks()) {
    const desc = b.description_en || ''
    if (
      matchesAny(b.title_en, queries) ||
      (b.title_ar && b.title_ar.includes(q)) ||
      (b.author_name_en && matchesAny(b.author_name_en, queries)) ||
      (desc && matchesAny(desc, queries))
    ) {
      buckets.get('book')!.push({
        type: 'book',
        title: b.title_en,
        snippet: desc ? extractSnippet(`By ${b.author_name_en ?? ''}. ${desc}`, queries) : `By ${b.author_name_en ?? ''}`,
        url: `/books/${b.slug}`,
        meta: b.author_name_en ?? '',
      })
    }
  }

  // Articles
  for (const a of getArticles()) {
    if (
      matchesAny(a.title, queries) ||
      (a.excerpt && matchesAny(a.excerpt, queries)) ||
      a.tags.some((t: string) => matchesAny(t, queries))
    ) {
      buckets.get('article')!.push({
        type: 'article',
        title: a.title,
        snippet: a.excerpt ? extractSnippet(a.excerpt, queries) : a.category,
        url: `/articles/${a.slug}`,
        meta: a.category,
      })
    }
  }

  // Media (video + audio)
  for (const m of getMedia()) {
    if (
      matchesAny(m.title, queries) ||
      (m.speaker && matchesAny(m.speaker, queries)) ||
      m.tags.some((t: string) => matchesAny(t, queries))
    ) {
      const bucket = m.type === 'video' ? 'video' : 'audio'
      buckets.get(bucket)!.push({
        type: bucket,
        title: m.title,
        snippet: `By ${m.speaker || 'Unknown'}. ${m.duration || ''}`,
        url: `/${m.type === 'video' ? 'videos' : 'audio'}/${m.slug}`,
        meta: m.speaker || '',
      })
    }
  }

  // Wiki
  for (const w of getWikiPages()) {
    if (matchesAny(w.title, queries) || matchesAny(w.slug, queries)) {
      buckets.get('wiki')!.push({
        type: 'wiki',
        title: w.title,
        snippet: w.category || 'Wiki article',
        url: `/wiki/${w.slug}`,
        meta: w.category || '',
      })
    }
  }

  // Sects
  for (const s of getSects()) {
    if (matchesAny(s.name_en, queries) || s.name_ar.includes(q) || matchesAny(s.description_en, queries)) {
      buckets.get('sect')!.push({
        type: 'sect',
        title: s.name_en,
        snippet: extractSnippet(s.description_en, queries),
        url: `/sects/${s.slug}`,
      })
    }
  }

  let total = 0
  const groups = GROUP_ORDER
    .filter((type) => buckets.get(type)!.length > 0)
    .map((type) => {
      const all = buckets.get(type)!
      total += all.length
      return {
        type,
        label: GROUP_LABELS[type] || type,
        results: previewLimit > 0 ? all.slice(0, previewLimit) : all,
        total: all.length,
      }
    })

  const result: GroupedResults = { groups, total }
  _fallbackCache.set(cacheKey, { result, ts: Date.now() })
  return result
}

/** Flat search for backwards compat */
export function searchAll(query: string): SearchResult[] {
  const { groups } = searchGrouped(query, 0)
  return groups.flatMap((g) => g.results)
}
