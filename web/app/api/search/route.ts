import { NextRequest, NextResponse } from 'next/server'
import { searchGrouped } from '@/lib/search'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { buildSafeFilter, parseFilterClauses } from '@/lib/security/meili-filter-sanitize'
import { INDEX_NAMES } from '@/lib/search/schema'

const MEILISEARCH_URL = process.env.MEILISEARCH_HOST ?? process.env.MEILISEARCH_URL
const MEILISEARCH_KEY = process.env.MEILISEARCH_SEARCH_KEY ?? process.env.MEILISEARCH_KEY
const MEILISEARCH_INDEX = 'islamwiki'

/**
 * S9-16 / S9-20 / S9-24: Per-corpus index routing.
 * When `type` param is provided, queries the dedicated per-type index for
 * higher relevance and type-specific filterable attributes.
 * Falls back to the monolithic `islamwiki` index for multi-type searches.
 *
 * S30-02: Added type=all for backwards compat; defaults to all indices.
 */
const ALLOWED_TYPES = ['quran', 'hadith', 'book', 'article', 'all'] as const

const TYPE_TO_INDEX: Record<string, string> = {
  quran: INDEX_NAMES.quran,
  hadith: INDEX_NAMES.hadith,
  book: INDEX_NAMES.books,
  article: INDEX_NAMES.articles,
  all: MEILISEARCH_INDEX,
}

/**
 * S9-16: Allowed filter fields for Quran corpus index (iw_quran).
 * S9-20: Allowed filter fields for Hadith corpus index (iw_hadith).
 * S9-24: Allowed filter fields for Books corpus index (iw_books).
 */
const CORPUS_FILTER_ALLOWLIST: Record<string, Set<string>> = {
  quran: new Set(['surah_number', 'juz', 'page', 'revelation_type']),
  hadith: new Set(['collection_slug', 'grade', 'book_slug']),
  book: new Set(['madhab', 'subject', 'has_text_ar']),
}

/**
 * Allowlist of filter keys — kept for backwards compatibility with existing
 * tests that import these exports. Raw filter strings are no longer accepted
 * by the GET handler; use the structured `filters` query param instead.
 *
 * @deprecated Use structured FilterClause[] via the `filters` query param.
 *   Raw filter strings passed as `filter=...` are rejected with HTTP 400.
 */
export const ALLOWED_FILTER_KEYS = ['category', 'language', 'source', 'verified'] as const

/**
 * @deprecated Internal helper kept for backwards compat with existing tests.
 *   No longer used in the GET handler.
 */
export function extractFilterKeys(filter: string): string[] {
  const normalised = filter.replace(/[()]/g, ' ')
  const tokens = normalised.split(/\s+/)
  const keys: string[] = []

  for (const token of tokens) {
    if (!token || /^(AND|OR|NOT|IN|\[.*\])$/i.test(token)) continue
    const colonIdx = token.indexOf(':')
    if (colonIdx > 0) {
      keys.push(token.slice(0, colonIdx))
    } else if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(token)) {
      keys.push(token)
    }
  }

  return [...new Set(keys)]
}

/**
 * @deprecated Internal helper kept for backwards compat with existing tests.
 *   No longer used in the GET handler.
 */
export function validateFilterKeys(filter: string): string | null {
  const keys = extractFilterKeys(filter)
  const disallowed = keys.filter((k) => !(ALLOWED_FILTER_KEYS as readonly string[]).includes(k))
  if (disallowed.length > 0) {
    return `Filter key(s) not allowed: ${disallowed.join(', ')}. Allowed keys: ${ALLOWED_FILTER_KEYS.join(', ')}.`
  }
  return null
}

// Group order and labels shared with client-side search
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
const GROUP_ORDER = Object.keys(GROUP_LABELS)

/**
 * Proxy a search query to Meilisearch and normalize the response
 * to the same GroupedResults format as the fallback client-side search.
 * @param indexName - Meilisearch index to query. Defaults to monolithic `islamwiki` index.
 * @param corpusType - When querying a per-corpus index, the type label (quran|hadith|book).
 */
async function searchMeilisearch(
  q: string,
  limit: number,
  filter?: string,
  indexName: string = MEILISEARCH_INDEX,
  corpusType?: string
) {
  if (!MEILISEARCH_URL || !MEILISEARCH_KEY) return null

  const isPerCorpus = indexName !== MEILISEARCH_INDEX
  const fetchLimit = isPerCorpus ? limit : limit * GROUP_ORDER.length

  const params = {
    q,
    limit: fetchLimit,
    attributesToHighlight: isPerCorpus ? ['text_en', 'text_ar', 'title_en', 'content_en'] : ['title', 'snippet'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    ...(filter ? { filter } : {}),
  }

  const res = await fetch(
    `${MEILISEARCH_URL}/indexes/${encodeURIComponent(indexName)}/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILISEARCH_KEY}`,
      },
      body: JSON.stringify(params),
    }
  )

  if (!res.ok) return null

  const data = await res.json() as {
    hits: Array<Record<string, unknown> & {
      id?: string
      type?: string
      title?: string
      snippet?: string
      url?: string
      meta?: string
      // Per-corpus quran fields
      surah_number?: number
      ayah_number?: number
      text_ar?: string
      text_en?: string
      surah_slug?: string
      // Per-corpus hadith fields
      collection_slug?: string
      book_slug?: string
      number?: number
      grade?: string
      // Per-corpus books fields
      book_slug_field?: string
      chapter_number?: number
      title_en?: string
      content_en?: string
      madhab?: string
      _formatted?: Record<string, string>
    }>
  }

  if (isPerCorpus && corpusType) {
    // Normalize per-corpus hits to SearchResult shape
    const type = corpusType
    const results = data.hits.slice(0, limit).map((h) => {
      let title = ''
      let snippet = ''
      let url = ''
      let meta = ''

      if (type === 'quran') {
        title = h._formatted?.text_en ?? h.text_en ?? `Surah ${h.surah_number}:${h.ayah_number}`
        snippet = h._formatted?.text_ar ?? h.text_ar ?? ''
        url = `/quran/${h.surah_number ?? h.surah_slug}/${h.ayah_number ?? ''}`
        meta = `${h.surah_number}:${h.ayah_number}`
      } else if (type === 'hadith') {
        title = h._formatted?.text_en ?? h.text_en ?? `Hadith ${h.number}`
        snippet = h._formatted?.text_ar ?? h.text_ar ?? ''
        url = `/hadith/${h.collection_slug ?? ''}/${h.book_slug ?? ''}/${h.number ?? ''}`
        meta = [h.collection_slug, h.grade].filter(Boolean).join(' · ')
      } else if (type === 'book') {
        title = h._formatted?.title_en ?? h.title_en ?? ''
        snippet = h._formatted?.content_en ?? h.content_en ?? ''
        url = `/books/${h.book_slug ?? ''}`
        meta = [h.madhab, h.subject].filter(Boolean).join(' · ')
      }

      return { type, title, snippet, url, meta }
    })

    const group = {
      type,
      label: GROUP_LABELS[type] ?? type,
      results,
      total: data.hits.length,
    }

    return {
      groups: results.length > 0 ? [group] : [],
      total: results.length,
      source: 'meilisearch' as const,
    }
  }

  // Multi-type monolithic index: group by `type` field
  const buckets = new Map<string, typeof data.hits>()
  for (const hit of data.hits) {
    const t = (hit.type as string | undefined) ?? 'unknown'
    const list = buckets.get(t) ?? []
    list.push(hit)
    buckets.set(t, list)
  }

  const groups = GROUP_ORDER
    .filter((t) => buckets.has(t))
    .map((type) => {
      const hits = (buckets.get(type) ?? []).slice(0, limit)
      return {
        type,
        label: GROUP_LABELS[type] ?? type,
        results: hits.map((h) => ({
          type: h.type ?? type,
          title: h._formatted?.title ?? h.title ?? '',
          snippet: h._formatted?.snippet ?? h.snippet ?? '',
          url: h.url ?? '',
          meta: h.meta,
        })),
        total: buckets.get(type)?.length ?? 0,
      }
    })

  return {
    groups,
    total: groups.reduce((acc, g) => acc + g.total, 0),
    source: 'meilisearch' as const,
  }
}

export async function GET(request: NextRequest) {
  // Rate limit: 60 search requests per minute per IP
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`search:${ip}`, { limit: 60, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    )
  }

  const q = request.nextUrl.searchParams.get('q') || ''
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '3', 10), 20)
  // S9-16/20/24: Optional type param for per-corpus index routing.
  // Accepted values: quran | hadith | book. Other values are ignored (falls through to monolithic).
  const typeParam = request.nextUrl.searchParams.get('type') ?? undefined

  // Reject legacy raw filter strings — vulnerable to injection (C12-HIGH fix).
  // Raw `filter=...` query params are no longer accepted.
  if (request.nextUrl.searchParams.has('filter')) {
    return NextResponse.json(
      {
        error:
          'Raw filter strings are not accepted. Use structured filters: ' +
          '?filters=[{"field":"lang","op":"=","value":"en"}]',
      },
      { status: 400 }
    )
  }

  // Accept structured filter clauses as a JSON-encoded query param.
  // Example: ?filters=[{"field":"type","op":"IN","value":["quran","hadith"]}]
  let filter: string | undefined
  const rawFilters = request.nextUrl.searchParams.get('filters')
  if (rawFilters) {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawFilters)
    } catch {
      return NextResponse.json(
        { error: 'filters must be a valid JSON array of filter clause objects.' },
        { status: 400 }
      )
    }
    try {
      const clauses = parseFilterClauses(parsed)
      filter = clauses.length > 0 ? buildSafeFilter(clauses) : undefined
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid filter clauses.' },
        { status: 400 }
      )
    }
  }

  if (!q.trim()) {
    return NextResponse.json({ groups: [], total: 0, source: 'empty' })
  }

  // Analytics: log query length only — no raw query text in logs (privacy)
  console.log(JSON.stringify({ event: 'search', q_len: q.length, type: typeParam ?? null, filter: filter ?? null, t: Date.now() }))

  // S9-16/20/24: Per-corpus index routing.
  // When `type` maps to a dedicated index, validate corpus-specific filter fields and
  // query the per-corpus index for higher relevance + type-specific filterables.
  const corpusIndex = typeParam ? TYPE_TO_INDEX[typeParam] : undefined

  // Validate corpus filter fields — only allow fields for the specific corpus.
  if (typeParam && corpusIndex && filter && CORPUS_FILTER_ALLOWLIST[typeParam]) {
    const allowed = CORPUS_FILTER_ALLOWLIST[typeParam]
    // Extract field names from the Meilisearch filter string (simple token scan)
    const filterFieldTokens = filter.split(/[\s=<>()[\],]+/).filter((t) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t) && !['AND', 'OR', 'NOT', 'IN', 'true', 'false'].includes(t))
    const disallowed = filterFieldTokens.filter((f) => !allowed.has(f))
    if (disallowed.length > 0) {
      return NextResponse.json(
        { error: `Filter field(s) not allowed for ${typeParam} corpus: ${disallowed.join(', ')}. Allowed: ${[...allowed].join(', ')}.` },
        { status: 400 }
      )
    }
  }

  // Try Meilisearch first (requires MEILISEARCH_HOST + MEILISEARCH_SEARCH_KEY env vars)
  if (MEILISEARCH_URL && MEILISEARCH_KEY) {
    try {
      const results = await searchMeilisearch(q, limit, filter, corpusIndex ?? MEILISEARCH_INDEX, corpusIndex ? typeParam : undefined)
      if (results) {
        return NextResponse.json(results, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        })
      }
    } catch {
      // Fall through to client-side search
    }
  }

  // Fallback: client-side JS search over static JSON
  const results = searchGrouped(q, limit)
  // Apply type filter on fallback too
  const filtered = typeParam
    ? { groups: results.groups.filter((g) => g.type === typeParam || (typeParam === 'book' && g.type === 'book')), total: 0 }
    : results
  if (typeParam) filtered.total = filtered.groups.reduce((s, g) => s + g.total, 0)
  return NextResponse.json({ ...(typeParam ? filtered : results), source: 'fallback' })
}
