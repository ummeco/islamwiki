/**
 * S9-24: Books corpus search helpers.
 *
 * Wires to the `iw_books` Meilisearch index for full-text search across
 * 502 classical Islamic book chapters. Supports madhab + subject filters.
 */

import { INDEX_NAMES } from './schema'

export interface BookSearchResult {
  id: string
  book_slug: string
  book_title?: string
  chapter_number: number
  title_en?: string
  content_en?: string
  has_text_ar: boolean
  madhab?: string
  subject?: string
  /** Formatted reference string, e.g. "Minhaj at-Talibin Ch. 12" */
  reference: string
  url: string
  _highlightResult?: {
    title_en?: { value: string }
    content_en?: { value: string }
  }
}

export interface BookSearchResponse {
  hits: BookSearchResult[]
  total: number
  query: string
  index: string
}

/**
 * Search the Books corpus via the /api/search endpoint.
 * Filters are validated server-side against the corpus allowlist.
 *
 * @param query - Search terms in EN (or transliterated Arabic)
 * @param opts.madhab - Filter by legal school (e.g. 'shafi', 'hanafi', 'maliki', 'hanbali')
 * @param opts.subject - Filter by subject category
 * @param opts.limit - Max results (default 10, max 50)
 */
export async function searchBooks(
  query: string,
  opts: {
    madhab?: string
    subject?: string
    limit?: number
  } = {}
): Promise<BookSearchResponse> {
  const { madhab, subject, limit = 10 } = opts

  const filters: Array<{ field: string; op: string; value: string | string[] }> = []
  if (madhab) {
    filters.push({ field: 'madhab', op: '=', value: madhab })
  }
  if (subject) {
    filters.push({ field: 'subject', op: '=', value: subject })
  }

  const params = new URLSearchParams({
    q: query,
    type: 'book',
    limit: String(Math.min(limit, 50)),
  })
  if (filters.length > 0) {
    params.set('filters', JSON.stringify(filters))
  }

  const res = await fetch(`/api/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    return { hits: [], total: 0, query, index: INDEX_NAMES.books }
  }

  const data = (await res.json()) as {
    groups?: Array<{ type: string; hits: BookSearchResult[]; total: number }>
    hits?: BookSearchResult[]
    total?: number
    source?: string
  }

  let hits: BookSearchResult[] = []
  let total = 0

  if (data.groups) {
    const group = data.groups.find((g) => g.type === 'book')
    hits = (group?.hits ?? []) as BookSearchResult[]
    total = group?.total ?? hits.length
  } else if (data.hits) {
    hits = data.hits
    total = data.total ?? hits.length
  }

  // Normalize reference and URL
  hits = hits.map((h) => ({
    ...h,
    reference:
      h.reference ??
      `${h.book_title ?? h.book_slug} — Chapter ${h.chapter_number}${h.title_en ? `: ${h.title_en}` : ''}`,
    url: h.url ?? `/books/${h.book_slug}/${h.chapter_number}`,
  }))

  return { hits, total, query, index: INDEX_NAMES.books }
}

/**
 * Get a highlighted preview string from a book search hit.
 * Returns the content highlight if available, else the title + content_en truncated.
 */
export function getBookPreview(hit: BookSearchResult): string {
  const titleHighlight = hit._highlightResult?.title_en?.value
  const contentHighlight = hit._highlightResult?.content_en?.value

  if (contentHighlight) return contentHighlight
  if (titleHighlight) return titleHighlight

  const title = hit.title_en ? `${hit.title_en}: ` : ''
  return `${title}${hit.content_en?.slice(0, 160) ?? ''}`.trim()
}
