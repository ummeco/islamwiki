/**
 * FILE:     types/hadith.ts
 * PURPOSE:  Shared TypeScript interfaces for the hadith API layer
 *           (grading + isnad endpoints, Hasura iw_hadith_gradings + iw_isnad_chains tables).
 * INVARIANTS:
 *   - grade values must match iw_hadith_gradings.grade domain (sahih|hasan|daif|mawdu|unknown)
 *   - reliability values must match iw_isnad_chains.reliability domain (thiqah|da'if|unknown)
 *   - All nullable fields use `string | null`, never `undefined`, for JSON safety
 * DO NOT: Import this file from client components — use only in server routes and RSCs
 */

// ── Grading ─────────────────────────────────────────────────────────────────

export type GradeValue = 'sahih' | 'hasan' | "da'if" | 'daif' | 'mawdu' | 'unknown'

export interface HadithGrading {
  id: string
  scholar_id: string
  scholar_name: string
  /** Canonical grade slug — matches GradeValue */
  grade: string
  /** Arabic grade label (e.g. صحيح) — preserves tashkeel */
  arabic_grade: string
  source: string | null
  notes: string | null
}

// ── Isnad ───────────────────────────────────────────────────────────────────

export type NarratorReliability = 'thiqah' | "da'if" | 'unknown'

export interface IsnadNode {
  id: string
  /** Arabic narrator name — must preserve tashkeel */
  name_ar: string
  name_en: string
  era: string | null
  reliability: NarratorReliability
  /** Position in chain (0 = Prophet ﷺ direction, ascending to Companion) */
  order: number
  person_slug: string | null
}

export interface IsnadResponse {
  hadith_id: string
  chain: IsnadNode[]
}
