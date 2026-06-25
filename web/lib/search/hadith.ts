/**
 * S9-20: Hadith corpus search helpers.
 *
 * Wires to the `iw_hadith` Meilisearch index for full-text search across
 * all 9 major hadith collections. Supports Arabic full-text, grade filter,
 * and collection/book filter.
 */

import { INDEX_NAMES } from './schema'

export interface HadithSearchResult {
  id: string
  collection_slug: string
  collection_name?: string
  book_slug: string
  book_name?: string
  number: number
  text_ar?: string
  text_en?: string
  grade?: string
  /** Formatted reference string, e.g. "Bukhari 1:1 (1)" */
  reference: string
  url: string
  _highlightResult?: {
    text_en?: { value: string }
    text_ar?: { value: string }
  }
}

export interface HadithSearchResponse {
  hits: HadithSearchResult[]
  total: number
  query: string
  index: string
}

/** Supported grade filter values */
export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | string

/**
 * Search the Hadith corpus via the /api/search endpoint.
 * Filters are validated server-side against the corpus allowlist.
 *
 * @param query - Search terms (EN or AR)
 * @param opts.collection - Filter by collection slug (e.g. 'bukhari', 'muslim')
 * @param opts.grade - Filter by hadith grade (e.g. 'sahih', 'hasan')
 * @param opts.book - Filter by book slug within a collection
 * @param opts.limit - Max results (default 10, max 50)
 */
export async function searchHadith(
  query: string,
  opts: {
    collection?: string
    grade?: HadithGrade
    book?: string
    limit?: number
  } = {}
): Promise<HadithSearchResponse> {
  const { collection, grade, book, limit = 10 } = opts

  const filters: Array<{ field: string; op: string; value: string | string[] }> = []
  if (collection) {
    filters.push({ field: 'collection_slug', op: '=', value: collection })
  }
  if (grade) {
    filters.push({ field: 'grade', op: '=', value: grade })
  }
  if (book) {
    filters.push({ field: 'book_slug', op: '=', value: book })
  }

  const params = new URLSearchParams({
    q: query,
    type: 'hadith',
    limit: String(Math.min(limit, 50)),
  })
  if (filters.length > 0) {
    params.set('filters', JSON.stringify(filters))
  }

  const res = await fetch(`/api/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    return { hits: [], total: 0, query, index: INDEX_NAMES.hadith }
  }

  const data = (await res.json()) as {
    groups?: Array<{ type: string; hits: HadithSearchResult[]; total: number }>
    hits?: HadithSearchResult[]
    total?: number
    source?: string
  }

  let hits: HadithSearchResult[] = []
  let total = 0

  if (data.groups) {
    const group = data.groups.find((g) => g.type === 'hadith')
    hits = (group?.hits ?? []) as HadithSearchResult[]
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
      `${h.collection_name ?? h.collection_slug} — ${h.book_name ?? h.book_slug} (${h.number})`,
    url: h.url ?? `/hadith/${h.collection_slug}/${h.book_slug}/${h.number}`,
  }))

  return { hits, total, query, index: INDEX_NAMES.hadith }
}

/**
 * Get a highlighted preview string from a hadith search hit.
 * Returns the EN highlight if available, else a truncated text_en.
 */
export function getHadithPreview(hit: HadithSearchResult): string {
  const highlighted = hit._highlightResult?.text_en?.value
  if (highlighted) return highlighted
  return hit.text_en?.slice(0, 180) ?? hit.text_ar?.slice(0, 120) ?? ''
}
