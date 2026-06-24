// FILE:    src/pages/api/grading.ts
// PURPOSE: Multi-scholar hadith grading API (S30-03) — Astro SSR port of app/api/grading/route.ts
// INVARIANTS:
//   - Returns [] (not null, not 500) when no grading data exists
//   - hadith_id is required; missing param returns 400
//   - Queries iw_hadith_gradings joined to iw_scholars via Hasura admin (server-only)
// DO NOT: Return grading data to unauthenticated requests without review
// REF: ports app/api/grading/route.ts · Next→Astro migration (D-P2-STACK-CANON)

import type { APIRoute } from 'astro'
import { hasuraAdmin } from '@/lib/hasura-admin'
import type { HadithGrading } from '@/types/hadith'

export const prerender = false

const GET_HADITH_GRADINGS = `
  query GetHadithGradings($hadith_id: String!) {
    iw_hadith_gradings(
      where: { hadith_id: { _eq: $hadith_id } }
      order_by: { display_order: asc_nulls_last }
    ) {
      id
      scholar_id
      scholar_name
      grade
      arabic_grade
      source
      notes
    }
  }
`

interface GradingRow {
  id: string
  scholar_id: string
  scholar_name: string
  grade: string
  arabic_grade: string
  source?: string
  notes?: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url)
  const hadith_id = searchParams.get('hadith_id')

  if (!hadith_id || hadith_id.trim() === '') {
    return json({ error: 'Missing hadith_id parameter' }, 400)
  }

  try {
    const data = await hasuraAdmin<{ iw_hadith_gradings: GradingRow[] }>(
      GET_HADITH_GRADINGS,
      { hadith_id }
    )

    const gradings: HadithGrading[] = (data.iw_hadith_gradings ?? []).map((row) => ({
      id: row.id,
      scholar_id: row.scholar_id,
      scholar_name: row.scholar_name,
      grade: row.grade,
      arabic_grade: row.arabic_grade,
      source: row.source ?? null,
      notes: row.notes ?? null,
    }))

    return json(gradings)
  } catch (error) {
    // Table may not exist yet in early deploys — return empty array gracefully
    if (error instanceof Error && error.message.includes('iw_hadith_gradings')) {
      return json([])
    }
    console.error('[grading] Error fetching gradings:', error)
    return json({ error: 'Failed to fetch gradings' }, 500)
  }
}
