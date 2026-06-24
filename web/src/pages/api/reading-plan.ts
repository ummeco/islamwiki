/**
 * src/pages/api/reading-plan.ts — Astro SSR port of app/api/reading-plan/route.ts (SIEGE-03 H-05)
 *
 * GET /api/reading-plan?userId={id}&plan={slug}
 *
 * Returns current reading plan state for a user + plan combination.
 * Auth: public read for anonymous (returns template state). User-specific
 * progress resolved from the authenticated user id when provided.
 *
 * Rate-limited: 60 req/min per IP (lib/rate-limit, preserved exactly).
 *
 * DB prefix: iw_  (iw_reading_plans, iw_reading_progress)
 * All data access via Hasura admin secret — server-only, never exposed to client.
 * REF: ports app/api/reading-plan/route.ts · Next→Astro migration (D-P2-STACK-CANON)
 */

import type { APIRoute } from 'astro'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

// ── Types ─────────────────────────────────────────────────────────────────

interface ReadingSection {
  /** Content type: 'quran_ayah' | 'hadith' | 'book_chapter' */
  type: string
  /** Reference string, e.g. 'Al-Baqarah 1-5' */
  ref: string
  /** Deep-link URL to the content */
  url: string
}

interface ReadingPlanState {
  plan_slug: string
  current_day: number
  total_days: number
  today_sections: ReadingSection[]
  percent_complete: number
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

// ── Hasura admin client (server-only) ─────────────────────────────────────

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL ?? ''
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

async function gqlAdmin<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  if (!HASURA_URL || !HASURA_ADMIN_SECRET) return null
  try {
    const res = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { data?: T; errors?: unknown[] }
    if (data.errors?.length) return null
    return data.data as T
  } catch {
    return null
  }
}

// ── Plan data helpers ─────────────────────────────────────────────────────

/**
 * Get reading plan metadata (total days, per-day section mapping).
 */
async function getPlanMeta(
  planSlug: string
): Promise<{ total_days: number; sections_per_day: ReadingSection[][] } | null> {
  const data = await gqlAdmin<{
    iw_reading_plans: Array<{
      total_days: number
      plan_sections: Array<{ day: number; type: string; ref: string; url: string }>
    }>
  }>(
    `query GetPlanMeta($slug: String!) {
      iw_reading_plans(where: { slug: { _eq: $slug } }, limit: 1) {
        total_days
        plan_sections(order_by: { day: asc, sort_order: asc }) {
          day type ref url
        }
      }
    }`,
    { slug: planSlug }
  )

  const plan = data?.iw_reading_plans?.[0]
  if (!plan) return null

  // Group sections by day
  const sectionsPerDay: ReadingSection[][] = Array.from(
    { length: plan.total_days },
    () => []
  )
  for (const s of plan.plan_sections) {
    const idx = s.day - 1
    if (idx >= 0 && idx < plan.total_days) {
      sectionsPerDay[idx].push({ type: s.type, ref: s.ref, url: s.url })
    }
  }

  return { total_days: plan.total_days, sections_per_day: sectionsPerDay }
}

/**
 * Get user-specific progress for a plan.
 * Returns null if user has no progress record yet (new to the plan).
 */
async function getUserProgress(
  userId: string,
  planSlug: string
): Promise<{ current_day: number; completed_days: number } | null> {
  const data = await gqlAdmin<{
    iw_reading_progress: Array<{ current_day: number; completed_days: number }>
  }>(
    `query GetUserProgress($userId: uuid!, $slug: String!) {
      iw_reading_progress(
        where: { user_id: { _eq: $userId }, plan_slug: { _eq: $slug } }
        limit: 1
      ) {
        current_day
        completed_days
      }
    }`,
    { userId, slug: planSlug }
  )

  return data?.iw_reading_progress?.[0] ?? null
}

// ── Route handler ─────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ request, locals }) => {
  // Rate limit: 60 req/min per IP
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`reading-plan:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  })
  if (!rl.allowed) {
    return json({ error: 'Too many requests.' }, 429, {
      'Retry-After': String(rl.retryAfterSeconds),
    })
  }

  const { searchParams } = new URL(request.url)
  const planSlug = searchParams.get('plan')
  // Prefer the authenticated user id from middleware-set locals over a query param.
  // Falls back to the query param to preserve the original anonymous/template behavior.
  const userId = locals.userId ?? searchParams.get('userId')

  if (!planSlug) {
    return json({ error: 'plan query param is required.' }, 400)
  }

  // Validate planSlug format (alphanumeric + hyphens, 2-80 chars)
  if (!/^[a-z0-9-]{2,80}$/.test(planSlug)) {
    return json({ error: 'Invalid plan slug format.' }, 400)
  }

  // Validate userId format if provided (UUID)
  if (userId && !/^[0-9a-f-]{36}$/i.test(userId)) {
    return json({ error: 'Invalid userId format.' }, 400)
  }

  // Fetch plan metadata
  const planMeta = await getPlanMeta(planSlug)
  if (!planMeta) {
    // Return a graceful stub response when the plan table doesn't exist yet
    // (migration pending in dev environments)
    const stub: ReadingPlanState = {
      plan_slug: planSlug,
      current_day: 1,
      total_days: 30,
      today_sections: [],
      percent_complete: 0,
    }
    return json(stub, 200, { 'Cache-Control': 'no-store' })
  }

  // Determine current day
  let currentDay = 1
  let completedDays = 0

  if (userId) {
    const progress = await getUserProgress(userId, planSlug)
    if (progress) {
      currentDay = Math.min(
        Math.max(progress.current_day, 1),
        planMeta.total_days
      )
      completedDays = progress.completed_days
    }
  }

  const todaySections = planMeta.sections_per_day[currentDay - 1] ?? []
  const percentComplete =
    planMeta.total_days > 0
      ? Math.round((completedDays / planMeta.total_days) * 100)
      : 0

  const response: ReadingPlanState = {
    plan_slug: planSlug,
    current_day: currentDay,
    total_days: planMeta.total_days,
    today_sections: todaySections,
    percent_complete: Math.min(percentComplete, 100),
  }

  return json(response, 200, {
    // No ISR — user-specific. No-store for authenticated; short cache for anon.
    'Cache-Control': userId
      ? 'no-store'
      : 'public, s-maxage=60, stale-while-revalidate=300',
  })
}
