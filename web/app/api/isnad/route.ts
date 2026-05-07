import { NextRequest, NextResponse } from 'next/server'

/**
 * S30-08: Isnad chain-of-transmission API
 * GET /api/isnad?hadith_id=<id>
 *
 * Returns adjacency list format:
 * {
 *   hadith_id: string
 *   chain: [
 *     { id, name_ar, name_en, era, reliability, order },
 *     ...
 *   ]
 * }
 *
 * TODO: Connect to Hasura query for iw_isnad_chains.
 * For now, returns scaffold structure.
 */

interface IsnadNode {
  id: string
  name_ar: string
  name_en: string
  era?: string
  reliability: 'thiqah' | 'da\'if' | 'unknown'
  order: number
}

interface IsnadResponse {
  hadith_id: string
  chain: IsnadNode[]
}

export async function GET(request: NextRequest): Promise<NextResponse<IsnadResponse | { error: string }>> {
  const { searchParams } = new URL(request.url)
  const hadith_id = searchParams.get('hadith_id')

  if (!hadith_id) {
    return NextResponse.json(
      { error: 'Missing hadith_id parameter' },
      { status: 400 }
    )
  }

  try {
    // TODO S30-08: Replace with Hasura query
    // const result = await adminClient.request(GET_ISNAD_CHAIN, { hadith_id })
    // return NextResponse.json({
    //   hadith_id,
    //   chain: result.iw_isnad_chains
    // })

    // Scaffold: return empty chain
    return NextResponse.json({
      hadith_id,
      chain: [],
    })
  } catch (error) {
    console.error('Error fetching isnad chain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch isnad chain' },
      { status: 500 }
    )
  }
}
