/**
 * FILE:     lib/fiqh/madhab-rulings.ts
 * PURPOSE:  Fetch madhab-level fiqh rulings from iw_madhab_rulings via Hasura admin.
 *           Used by article, hadith, and ayah pages to populate MadhabVariancePanel.
 * INVARIANTS:
 *   - Returns [] (never null, never throws) when table is empty or not yet created
 *   - Arabic ruling text is passed through verbatim — tashkeel must not be modified
 *   - Server-only (never import from Client Components)
 * DO NOT: Query this table from client-side code or expose admin secret
 */
import 'server-only'
import { hasuraAdmin } from '@/lib/hasura-admin'
import type { MadhabRuling } from '@/components/fiqh/MadhabVariancePanel'
import type { Madhab } from '@/types/books'

const GET_MADHAB_RULINGS = `
  query GetMadhabRulings($ref_type: String!, $ref_id: String!) {
    iw_madhab_rulings(
      where: {
        ref_type: { _eq: $ref_type }
        ref_id: { _eq: $ref_id }
      }
      order_by: [{ madhab: asc }]
    ) {
      id
      madhab
      ruling
      ruling_ar
      evidence
      scholar_source
    }
  }
`

interface MadhabRulingRow {
  id: string
  madhab: string
  ruling: string
  ruling_ar: string | null
  evidence: string | null
  scholar_source: string | null
}

/**
 * Fetch madhab rulings for a content item.
 * @param refType - 'article' | 'hadith' | 'ayah'
 * @param refId   - Article slug, hadith iw_id, or ayah "surah:ayah"
 */
export async function getMadhabRulings(
  refType: 'article' | 'hadith' | 'ayah',
  refId: string
): Promise<MadhabRuling[]> {
  try {
    const data = await hasuraAdmin<{ iw_madhab_rulings: MadhabRulingRow[] }>(
      GET_MADHAB_RULINGS,
      { ref_type: refType, ref_id: refId }
    )

    return (data.iw_madhab_rulings ?? []).map((row) => ({
      id: row.id,
      madhab: row.madhab as Madhab,
      ruling: row.ruling,
      ruling_ar: row.ruling_ar,
      evidence: row.evidence,
      scholar_source: row.scholar_source,
    }))
  } catch {
    // Table may not exist yet in early deploys — return empty array gracefully
    return []
  }
}
