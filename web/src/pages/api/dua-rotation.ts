/**
 * SIEGE-03 H-05: Du'a rotation REST API endpoint (Astro port).
 *
 * GET /api/dua-rotation?category={slug}&locale={en|ar|id}
 *
 * Returns today's du'a rotation entry for a given category.
 * Rotation is date-seeded (deterministic — same du'a for all users on the
 * same calendar date per category). Public endpoint, no auth required.
 *
 * Rate-limited: 120 req/min per IP.
 *
 * DB prefix: iw_  (iw_duas, iw_dua_categories)
 * All data access via Hasura GraphQL — never direct DB.
 * Hasura admin secret is read from process.env (server-only; never exposed
 * to client islands).
 */

import type { APIRoute } from 'astro'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const prerender = false

// ── Types ─────────────────────────────────────────────────────────────────

type DuaLocale = 'en' | 'ar' | 'id'

interface DuaRotationEntry {
  dua_id: string
  arabic_text: string
  transliteration: string
  translation: string
  source_ref: string
  category: string
  rotation_date: string
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
    const json = (await res.json()) as { data?: T; errors?: unknown[] }
    if (json.errors?.length) return null
    return json.data as T
  } catch {
    return null
  }
}

// ── Date-seed rotation logic ──────────────────────────────────────────────

/**
 * Returns today's date as YYYY-MM-DD (UTC).
 */
function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Deterministic integer hash of a string (djb2).
 */
function hashString(s: string): number {
  let hash = 5381
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 33) ^ s.charCodeAt(i)
  }
  return Math.abs(hash >>> 0)
}

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

// ── Route handler ─────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ request }) => {
  // Rate limit: 120 req/min per IP
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`dua-rotation:${ip}`, {
    limit: 120,
    windowMs: 60_000,
  })
  if (!rl.allowed) {
    return jsonResponse({ error: 'Too many requests.' }, 429, {
      'Retry-After': String(rl.retryAfterSeconds),
    })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'morning'
  const localeParam = searchParams.get('locale') ?? 'en'

  // Validate category (alphanumeric + hyphens, 2-60 chars)
  if (!/^[a-z0-9-]{2,60}$/.test(category)) {
    return jsonResponse({ error: 'Invalid category format.' }, 400)
  }

  // Validate locale
  const validLocales: DuaLocale[] = ['en', 'ar', 'id']
  const locale: DuaLocale = validLocales.includes(localeParam as DuaLocale)
    ? (localeParam as DuaLocale)
    : 'en'

  const todayKey = getTodayDateKey()
  const rotationSeed = hashString(`${todayKey}:${category}`)

  // Fetch du'as for this category from Hasura
  const data = await gqlAdmin<{
    iw_duas: Array<{
      id: string
      arabic_text: string
      transliteration: string
      translation_en: string | null
      translation_ar: string | null
      translation_id: string | null
      source_ref: string
    }>
  }>(
    `query GetDuasByCategory($category: String!) {
      iw_duas(
        where: { category_slug: { _eq: $category }, is_active: { _eq: true } }
        order_by: { sort_order: asc }
      ) {
        id
        arabic_text
        transliteration
        translation_en
        translation_ar
        translation_id
        source_ref
      }
    }`,
    { category }
  )

  const duas = data?.iw_duas

  // If DB is unavailable or table not yet migrated, return a graceful stub
  if (!duas || duas.length === 0) {
    const stub: DuaRotationEntry = {
      dua_id: 'stub-bismillah',
      arabic_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Bismillah ir-rahman ir-rahim',
      translation:
        locale === 'ar'
          ? 'بسم الله الرحمن الرحيم'
          : locale === 'id'
            ? 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.'
            : 'In the name of Allah, the Most Gracious, the Most Merciful.',
      source_ref: 'Quran 1:1',
      category,
      rotation_date: todayKey,
    }
    return jsonResponse(stub, 200, {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    })
  }

  // Pick today's du'a deterministically via rotation seed
  const index = rotationSeed % duas.length
  const dua = duas[index]

  // Select translation based on requested locale
  const translation =
    locale === 'ar'
      ? (dua.translation_ar ?? dua.translation_en ?? '')
      : locale === 'id'
        ? (dua.translation_id ?? dua.translation_en ?? '')
        : (dua.translation_en ?? '')

  const response: DuaRotationEntry = {
    dua_id: dua.id,
    arabic_text: dua.arabic_text,
    transliteration: dua.transliteration,
    translation,
    source_ref: dua.source_ref,
    category,
    rotation_date: todayKey,
  }

  return jsonResponse(response, 200, {
    // Rotation is deterministic and changes at midnight UTC.
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  })
}
