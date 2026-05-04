/**
 * S9-16: Quran corpus search helpers.
 *
 * Wires to the `iw_quran` Meilisearch index for full-text search over
 * 6,236 ayahs. Supports Arabic highlight and EN keyword search.
 * Transliteration lookups map English phonetic input to Arabic results.
 */

import { INDEX_NAMES } from './schema'

export interface QuranSearchResult {
  id: string
  surah_number: number
  surah_slug: string
  ayah_number: number
  text_ar: string
  text_en?: string
  juz: number
  page: number
  /** Formatted reference string, e.g. "Al-Fatiha 1:1" */
  reference: string
  url: string
  _highlightResult?: {
    text_en?: { value: string }
    text_ar?: { value: string }
  }
}

export interface QuranSearchResponse {
  hits: QuranSearchResult[]
  total: number
  query: string
  index: string
}

/**
 * Search the Quran corpus via the /api/search endpoint.
 * Filters are validated server-side against the corpus allowlist.
 *
 * @param query - Search terms (EN or AR)
 * @param opts.surahNumber - Filter by surah number (1-114)
 * @param opts.juz - Filter by juz (1-30)
 * @param opts.limit - Max results (default 10, max 50)
 */
export async function searchQuran(
  query: string,
  opts: {
    surahNumber?: number
    juz?: number
    limit?: number
  } = {}
): Promise<QuranSearchResponse> {
  const { surahNumber, juz, limit = 10 } = opts

  const filters: Array<{ field: string; op: string; value: string | string[] }> = []
  if (surahNumber !== undefined) {
    filters.push({ field: 'surah_number', op: '=', value: String(surahNumber) })
  }
  if (juz !== undefined) {
    filters.push({ field: 'juz', op: '=', value: String(juz) })
  }

  const params = new URLSearchParams({
    q: query,
    type: 'quran',
    limit: String(Math.min(limit, 50)),
  })
  if (filters.length > 0) {
    params.set('filters', JSON.stringify(filters))
  }

  const res = await fetch(`/api/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return { hits: [], total: 0, query, index: INDEX_NAMES.quran }
  }

  const data = (await res.json()) as {
    groups?: Array<{ type: string; hits: QuranSearchResult[]; total: number }>
    hits?: QuranSearchResult[]
    total?: number
    source?: string
  }

  // Per-corpus index returns hits directly; monolithic index returns groups
  let hits: QuranSearchResult[] = []
  let total = 0

  if (data.groups) {
    const group = data.groups.find((g) => g.type === 'quran')
    hits = (group?.hits ?? []) as QuranSearchResult[]
    total = group?.total ?? hits.length
  } else if (data.hits) {
    hits = data.hits
    total = data.total ?? hits.length
  }

  // Normalize reference strings
  hits = hits.map((h) => ({
    ...h,
    reference: h.reference ?? `${h.surah_slug ?? `Surah ${h.surah_number}`} ${h.surah_number}:${h.ayah_number}`,
    url: h.url ?? `/quran/${h.surah_number}/${h.ayah_number}`,
  }))

  return { hits, total, query, index: INDEX_NAMES.quran }
}

/**
 * Get a highlighted preview string from a search hit.
 * Returns the EN highlight if available, else the first 120 chars of text_en.
 */
export function getQuranPreview(hit: QuranSearchResult): string {
  const highlighted = hit._highlightResult?.text_en?.value
  if (highlighted) return highlighted
  return hit.text_en?.slice(0, 120) ?? hit.text_ar?.slice(0, 80) ?? ''
}
