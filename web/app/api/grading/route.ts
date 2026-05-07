import { NextRequest, NextResponse } from 'next/server'

/**
 * S30-03: Multi-scholar hadith grading API
 * GET /api/grading?hadith_id=<id>
 *
 * Returns: { scholar_id, scholar_name, grade, arabic_grade, source }[]
 * Grade values: sahih|hasan|daif|mawdu
 *
 * TODO: Connect to Hasura query for iw_hadith_gradings + iw_scholars join.
 * For now, returns empty array (scaffold).
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hadith_id = searchParams.get('hadith_id')

  if (!hadith_id) {
    return NextResponse.json(
      { error: 'Missing hadith_id parameter' },
      { status: 400 }
    )
  }

  try {
    // TODO S30-03: Replace with Hasura query
    // const result = await adminClient.request(GET_HADITH_GRADINGS, { hadith_id })
    // return NextResponse.json(result.iw_hadith_gradings)

    // Scaffold: return empty array
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching gradings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gradings' },
      { status: 500 }
    )
  }
}
