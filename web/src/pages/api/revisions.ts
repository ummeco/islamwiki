// FILE: src/pages/api/revisions.ts
// PURPOSE: POST /api/revisions (submit a wiki revision — IP-block gate, rate-limit, auth,
//   contentType allowlist, primary-source role gate, ban check, new-user daily cap) and
//   GET /api/revisions?type=&slug= (list revisions). Astro port of app/api/revisions/route.ts.
// SECURITY (preserved exactly):
//   - isIpBlocked gate before anything else; per-IP rate limit (10/min).
//   - Auth required (session via verified JWT).
//   - validateContentType allowlist BEFORE use (blocks MIME-type / polyglot-XSS injection).
//   - Primary-source content (Quran/hadith) requires curator|admin|owner role (theology gate).
//   - Banned accounts rejected; trust level 0/1 capped at 5 edits / 24h.
import type { APIRoute } from 'astro'
import { getSessionUserFromCookies } from '@/lib/session'
import { submitRevision, getRevisionsByContent } from '@/lib/contributor/revisions'
import { getUserTrust } from '@/lib/contributor/user-trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isIpBlocked } from '@/lib/contributor/ip-block'
import { validateContentType } from '@/lib/security/content-type-allowlist'

export const prerender = false

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/**
 * Primary source content types — Quran verses and canonical hadith.
 * Submissions to these types require the `curator` role (trust level 2 with primary-source
 * write permission). The `editor` role may only submit commentary, tafsir, and translations.
 */
const PRIMARY_SOURCE_CONTENT_TYPES = new Set([
  'quran_ayah',
  'quran_surah',
  'quran_translation',
  'hadith_entry',
  'hadith_collection',
  'hadith_book',
  'hadith_isnad',
])

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = getClientIp(request.headers)

  const ipBlock = await isIpBlocked(ip)
  if (ipBlock) {
    return json({ error: 'Your IP has been blocked from editing.' }, 403)
  }

  const rl = await checkRateLimit(`revisions:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return json({ error: 'Too many requests' }, 429, { 'Retry-After': String(rl.retryAfterSeconds) })

  const user = await getSessionUserFromCookies(cookies)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const body = await request.json()
  const { contentSlug, contentId, previousContent, newContent, changeSummary, isMinor } = body

  // Validate contentType against the allowlist BEFORE any other use.
  // Accepts only known MIME types; rejects arbitrary strings that could
  // enable MIME-type injection or stored-XSS via polyglot payloads.
  let contentType: string
  try {
    contentType = validateContentType(body.contentType)
  } catch {
    return json({ error: 'Invalid contentType' }, 400)
  }

  if (!contentType || !contentSlug || !newContent) {
    return json({ error: 'Missing required fields' }, 400)
  }
  if (newContent.length > 200_000) {
    return json({ error: 'Content too large' }, 413)
  }

  // --- Content type role gate (T1-4-13) ---
  // Primary sources (Quran verses, canonical hadith) require `curator` role.
  // Editor role may only submit commentary, tafsir, translations, and wiki content.
  if (PRIMARY_SOURCE_CONTENT_TYPES.has(contentType)) {
    if (user.role !== 'curator' && user.role !== 'admin' && user.role !== 'owner') {
      return json(
        {
          error:
            'Submitting primary Islamic sources (Quran verses, hadith) requires the Curator role. ' +
            'Editors may submit commentary, tafsir, translations, and wiki pages.',
        },
        403
      )
    }
  }

  const trust = await getUserTrust(user.userId)
  if (trust?.is_banned) {
    return json({ error: 'Account suspended' }, 403)
  }

  // Trust Level 0 (New) and 1 (Trusted): max 5 edits per 24 hours.
  // Level 1 users have earned basic trust but still operate under the daily cap
  // until they accumulate enough approved edits to reach Level 2 (Editor).
  const trustLevel = trust?.trust_level ?? 0
  if (trustLevel <= 1) {
    const newUserRl = await checkRateLimit(`new-user-edits:${user.userId}`, { limit: 5, windowMs: 24 * 60 * 60_000 })
    if (!newUserRl.allowed) {
      return json(
        {
          error:
            trustLevel === 0
              ? 'New accounts are limited to 5 edits per day. Your limit will reset in 24 hours.'
              : 'Trusted accounts are limited to 5 edits per day. Your limit will reset in 24 hours.',
        },
        429
      )
    }
  }

  const revision = await submitRevision({
    contentType,
    contentSlug,
    contentId,
    editorId: user.userId,
    editorUsername: user.username || user.email || 'Anonymous',
    previousContent: previousContent ?? null,
    newContent,
    changeSummary,
    isMinor: isMinor ?? false,
    editorTrustScore: trust?.trust_score ?? 0,
  })

  return json({ revision }, 201)
}

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('type')
  const contentSlug = searchParams.get('slug')

  if (!contentType || !contentSlug) {
    return json({ error: 'type and slug required' }, 400)
  }

  try {
    const revisions = await getRevisionsByContent(contentType, contentSlug)
    return json({ revisions })
  } catch {
    return json({ revisions: [] }, 500)
  }
}
