import { NextRequest, NextResponse } from 'next/server'
import { hasuraAdmin } from '@/lib/hasura-admin'
import type { IsnadNode, IsnadResponse } from '@/types/hadith'

/**
 * FILE:     app/api/isnad/route.ts
 * PURPOSE:  Isnad chain-of-transmission API (S30-08)
 * INVARIANTS:
 *   - Returns { hadith_id, chain: [] } (never null, never 500) when no chain data exists
 *   - hadith_id is required; missing param returns 400
 *   - Queries iw_isnad_chains ordered by narrator position
 * DO NOT:   Expose narrator biographical data beyond what is in iw_isnad_chains
 */

const GET_ISNAD_CHAIN = `
  query GetIsnadChain($hadith_id: String!) {
    iw_isnad_chains(
      where: { hadith_id: { _eq: $hadith_id } }
      order_by: { position: asc }
    ) {
      id
      name_ar
      name_en
      era
      reliability
      position
      person_slug
    }
  }
`

interface IsnadChainRow {
  id: string
  name_ar: string
  name_en: string
  era?: string
  reliability: string
  position: number
  person_slug?: string
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<IsnadResponse | { error: string }>> {
  const { searchParams } = new URL(request.url)
  const hadith_id = searchParams.get('hadith_id')

  if (!hadith_id || hadith_id.trim() === '') {
    return NextResponse.json(
      { error: 'Missing hadith_id parameter' },
      { status: 400 }
    )
  }

  try {
    const data = await hasuraAdmin<{ iw_isnad_chains: IsnadChainRow[] }>(
      GET_ISNAD_CHAIN,
      { hadith_id }
    )

    const chain: IsnadNode[] = (data.iw_isnad_chains ?? []).map((row) => ({
      id: row.id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      era: row.era ?? null,
      reliability: (row.reliability as IsnadNode['reliability']) ?? 'unknown',
      order: row.position,
      person_slug: row.person_slug ?? null,
    }))

    return NextResponse.json({ hadith_id, chain })
  } catch (error) {
    // Table may not exist yet in early deploys — return empty chain gracefully
    if (error instanceof Error && error.message.includes('iw_isnad_chains')) {
      return NextResponse.json({ hadith_id, chain: [] })
    }
    console.error('[isnad] Error fetching isnad chain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch isnad chain' },
      { status: 500 }
    )
  }
}
