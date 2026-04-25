import { NextRequest, NextResponse } from 'next/server'
import { searchGrouped } from '@/lib/search'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const MEILISEARCH_URL = process.env.MEILISEARCH_URL
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY
const MEILISEARCH_INDEX = 'islamwiki'

/**
 * Allowlist of filter keys accepted in the `filter` query parameter.
 * Any key outside this list is rejected with HTTP 400 to prevent
 * Meilisearch filter injection (e.g. _geoRadius, _geoBoundingBox,
 * internal _vectors fields, etc.).
 *
 * Format accepted: `key:value` or `key = value` (Meilisearch filter syntax).
 * Multiple conditions may be joined with AND/OR but every key must be in this list.
 */
export const ALLOWED_FILTER_KEYS = ['category', 'language', 'source', 'verified'] as const

/**
 * Parse a Meilisearch filter expression and return all attribute keys found.
 * Supports simple `key:value`, `key = value`, `key != value`, `key > value`,
 * `key IN [...]`, and compound expressions joined by AND / OR / NOT.
 * Parentheses are stripped before scanning.
 */
export function extractFilterKeys(filter: string): string[] {
  // Strip parentheses and split on whitespace-delimited AND/OR/NOT
  const normalised = filter.replace(/[()]/g, ' ')
  const tokens = normalised.split(/\s+/)
  const keys: string[] = []

  for (const token of tokens) {
    if (!token || /^(AND|OR|NOT|IN|\[.*\])$/i.test(token)) continue
    // token may be `key:value` or just `key` when operator is separate
    const colonIdx = token.indexOf(':')
    if (colonIdx > 0) {
      keys.push(token.slice(0, colonIdx))
    } else if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(token)) {
      // Looks like a plain identifier (key before `=`, `!=`, `>`, `<`, `>=`, `<=`)
      keys.push(token)
    }
  }

  return [...new Set(keys)]
}

/**
 * Validate that every key in a filter expression is in the allowlist.
 * Returns null if valid, or an error message string if not.
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
 */
async function searchMeilisearch(q: string, limit: number, filter?: string) {
  if (!MEILISEARCH_URL || !MEILISEARCH_KEY) return null

  const params = {
    q,
    limit: limit * GROUP_ORDER.length,   // over-fetch then group
    attributesToHighlight: ['title', 'snippet'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    ...(filter ? { filter } : {}),
  }

  const res = await fetch(
    `${MEILISEARCH_URL}/indexes/${MEILISEARCH_INDEX}/search`,
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
    hits: Array<{
      id: string; type: string; title: string; snippet: string
      url: string; meta?: string; _formatted?: { title?: string; snippet?: string }
    }>
  }

  // Group by type
  const buckets = new Map<string, typeof data.hits>()
  for (const hit of data.hits) {
    const list = buckets.get(hit.type) ?? []
    list.push(hit)
    buckets.set(hit.type, list)
  }

  const groups = GROUP_ORDER
    .filter((t) => buckets.has(t))
    .map((type) => {
      const hits = (buckets.get(type) ?? []).slice(0, limit)
      return {
        type,
        label: GROUP_LABELS[type] ?? type,
        results: hits.map((h) => ({
          type: h.type,
          title: h._formatted?.title ?? h.title,
          snippet: h._formatted?.snippet ?? h.snippet,
          url: h.url,
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
  const rawFilter = request.nextUrl.searchParams.get('filter')

  // Validate filter key allowlist before forwarding to Meilisearch
  if (rawFilter) {
    const filterError = validateFilterKeys(rawFilter)
    if (filterError) {
      return NextResponse.json({ error: filterError }, { status: 400 })
    }
  }

  const filter = rawFilter ?? undefined

  if (!q.trim()) {
    return NextResponse.json({ groups: [], total: 0, source: 'empty' })
  }

  // Analytics: log query length only — no raw query text in logs (privacy)
  console.log(JSON.stringify({ event: 'search', q_len: q.length, filter: filter ?? null, t: Date.now() }))

  // Try Meilisearch first (requires MEILISEARCH_URL + MEILISEARCH_KEY env vars)
  if (MEILISEARCH_URL && MEILISEARCH_KEY) {
    try {
      const results = await searchMeilisearch(q, limit, filter)
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
  return NextResponse.json({ ...results, source: 'fallback' })
}
