/**
 * S9-15 / S9-27: Quran ↔ Hadith cross-reference queries.
 *
 * Queries the `iw_cross_refs` table (created in S9-25) via Hasura admin.
 * Used by:
 *   - /quran/[surah]/[ayah] → RelatedHadithPanel  (S9-15)
 *   - /quran/[surah]/[ayah] → TafsirCrossRefPanel (S9-27)
 *
 * Falls back to empty arrays when the table is empty (before seeder runs).
 * Server-only — import only from RSC or API routes.
 */
import 'server-only'
import { hasuraAdmin } from '@/lib/hasura-admin'
import type { RelatedHadithRef } from '@/components/quran/RelatedHadithPanel'

// ── Shared types ────────────────────────────────────────────────────────────

interface CrossRefRow {
  id: string
  source_type: string
  source_id: string
  target_type: string
  target_id: string
  ref_type: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Build the canonical source_id for a quran ayah: "{surahNumber}:{ayahNumber}" */
export function ayahSourceId(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`
}

// ── Get hadith refs for an ayah ─────────────────────────────────────────────

export interface AyahHadithCrossRef {
  id: string
  collection_slug: string
  collection_name: string
  book_slug: string
  number: number
  text_en_snippet: string | null
  grade: string | null
}

const QUERY_HADITH_REFS = `
  query GetHadithCrossRefs($sourceId: String!, $limit: Int!) {
    iw_cross_refs(
      where: {
        source_type: { _eq: "quran_ayah" }
        source_id: { _eq: $sourceId }
        target_type: { _eq: "hadith" }
        ref_type: { _in: ["mentioned_in", "commentary", "related"] }
      }
      limit: $limit
    ) {
      id
      target_id
      ref_type
    }
  }
`

/**
 * Returns up to `limit` hadith cross-references for a given ayah.
 * The `target_id` format is "{collection_slug}:{book_slug}:{number}".
 */
export async function getHadithCrossRefsForAyah(
  surahNumber: number,
  ayahNumber: number,
  limit = 10
): Promise<RelatedHadithRef[]> {
  const sourceId = ayahSourceId(surahNumber, ayahNumber)

  try {
    const data = await hasuraAdmin<{
      iw_cross_refs: Pick<CrossRefRow, 'id' | 'target_id' | 'ref_type'>[]
    }>(QUERY_HADITH_REFS, { sourceId, limit })

    const refs = data.iw_cross_refs
    if (!refs || refs.length === 0) return []

    return refs
      .map((row): RelatedHadithRef | null => {
        // target_id format: "bukhari:prayer/1/5" or "collection:book:number"
        const parts = row.target_id.split(':')
        if (parts.length < 3) return null
        const [collectionSlug, bookSlug, numberStr] = parts
        const number = parseInt(numberStr, 10)
        if (isNaN(number)) return null

        return {
          id: row.id,
          collection_slug: collectionSlug,
          collection_name: COLLECTION_DISPLAY_NAMES[collectionSlug] ?? collectionSlug,
          book_slug: bookSlug,
          number,
          text_en_snippet: null,
          grade: null,
        }
      })
      .filter((r): r is RelatedHadithRef => r !== null)
  } catch {
    // Table may not exist yet (before migration runs)
    return []
  }
}

// ── Get tafsir cross-refs for an ayah ──────────────────────────────────────

export interface TafsirRef {
  id: string
  book_slug: string
  book_title: string
  chapter_number: number
  excerpt: string | null
}

const QUERY_TAFSIR_REFS = `
  query GetTafsirCrossRefs($sourceId: String!, $limit: Int!) {
    iw_cross_refs(
      where: {
        source_type: { _eq: "quran_ayah" }
        source_id: { _eq: $sourceId }
        target_type: { _eq: "book_chapter" }
        ref_type: { _eq: "commentary" }
      }
      limit: $limit
    ) {
      id
      target_id
      ref_type
    }
  }
`

/** Returns up to `limit` tafsir book chapter cross-refs for a given ayah. */
export async function getTafsirCrossRefsForAyah(
  surahNumber: number,
  ayahNumber: number,
  limit = 5
): Promise<TafsirRef[]> {
  const sourceId = ayahSourceId(surahNumber, ayahNumber)

  try {
    const data = await hasuraAdmin<{
      iw_cross_refs: Pick<CrossRefRow, 'id' | 'target_id'>[]
    }>(QUERY_TAFSIR_REFS, { sourceId, limit })

    const rows = data.iw_cross_refs
    if (!rows || rows.length === 0) return []

    return rows
      .map((row): TafsirRef | null => {
        // target_id: "book_slug:chapter_number"
        const sep = row.target_id.lastIndexOf(':')
        if (sep === -1) return null
        const bookSlug = row.target_id.slice(0, sep)
        const chapterNumber = parseInt(row.target_id.slice(sep + 1), 10)
        if (isNaN(chapterNumber)) return null
        return {
          id: row.id,
          book_slug: bookSlug,
          book_title: TAFSIR_DISPLAY_NAMES[bookSlug] ?? bookSlug,
          chapter_number: chapterNumber,
          excerpt: null,
        }
      })
      .filter((r): r is TafsirRef => r !== null)
  } catch {
    return []
  }
}

// ── Display name maps ────────────────────────────────────────────────────────

const COLLECTION_DISPLAY_NAMES: Record<string, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  'abu-dawud': 'Sunan Abi Dawud',
  tirmidhi: "Jami' at-Tirmidhi",
  nasai: "Sunan al-Nasa'i",
  'ibn-majah': 'Sunan Ibn Majah',
  'musnad-ahmad': 'Musnad Ahmad',
  muwatta: "Muwatta' Imam Malik",
  darimi: 'Sunan al-Darimi',
  'riyadh-salihin': 'Riyad as-Salihin',
  shamail: 'Shamail al-Muhammadiyya',
}

const TAFSIR_DISPLAY_NAMES: Record<string, string> = {
  'tafsir-ibn-kathir': 'Tafsir Ibn Kathir',
  'tafsir-jalalayn': 'Tafsir al-Jalalayn',
  'tafsir-tabari': 'Tafsir al-Tabari',
  'tafsir-qurtubi': 'Tafsir al-Qurtubi',
  'tafsir-baghawi': 'Tafsir al-Baghawi',
}
