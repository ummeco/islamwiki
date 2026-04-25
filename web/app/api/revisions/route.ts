import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { submitRevision, getRevisionsByContent } from '@/lib/contributor/revisions'
import { getUserTrust } from '@/lib/contributor/user-trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isIpBlocked } from '@/lib/contributor/ip-block'

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

/**
 * Content types that require at minimum `editor` role (trust level 2).
 * Commentary, tafsir, and translations — not raw primary sources.
 */
const EDITORIAL_CONTENT_TYPES = new Set([
  'quran_tafsir',
  'article',
  'wiki_page',
  'book_chapter',
  'seerah_event',
  'person',
  'book',
  'sect',
  'media',
])

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)

  const ipBlock = isIpBlocked(ip)
  if (ipBlock) {
    return NextResponse.json({ error: 'Your IP has been blocked from editing.' }, { status: 403 })
  }

  const rl = await checkRateLimit(`revisions:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } })

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contentType, contentSlug, contentId, previousContent, newContent, changeSummary, isMinor } = body

  if (!contentType || !contentSlug || !newContent) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (newContent.length > 200_000) {
    return NextResponse.json({ error: 'Content too large' }, { status: 413 })
  }

  // --- Content type role gate (T1-4-13) ---
  // Primary sources (Quran verses, canonical hadith) require `curator` role.
  // Editor role may only submit commentary, tafsir, translations, and wiki content.
  if (PRIMARY_SOURCE_CONTENT_TYPES.has(contentType)) {
    if (user.role !== 'curator' && user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json(
        {
          error:
            'Submitting primary Islamic sources (Quran verses, hadith) requires the Curator role. ' +
            'Editors may submit commentary, tafsir, translations, and wiki pages.',
        },
        { status: 403 }
      )
    }
  }

  const trust = await getUserTrust(user.userId)
  if (trust?.is_banned) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  }

  // Trust Level 0 (New) and 1 (Trusted): max 5 edits per 24 hours.
  // Level 1 users have earned basic trust but still operate under the daily cap
  // until they accumulate enough approved edits to reach Level 2 (Editor).
  const trustLevel = trust?.trust_level ?? 0
  if (trustLevel <= 1) {
    const newUserRl = await checkRateLimit(`new-user-edits:${user.userId}`, { limit: 5, windowMs: 24 * 60 * 60_000 })
    if (!newUserRl.allowed) {
      return NextResponse.json(
        {
          error:
            trustLevel === 0
              ? 'New accounts are limited to 5 edits per day. Your limit will reset in 24 hours.'
              : 'Trusted accounts are limited to 5 edits per day. Your limit will reset in 24 hours.',
        },
        { status: 429 }
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

  return NextResponse.json({ revision }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('type')
  const contentSlug = searchParams.get('slug')

  if (!contentType || !contentSlug) {
    return NextResponse.json({ error: 'type and slug required' }, { status: 400 })
  }

  try {
    const revisions = await getRevisionsByContent(contentType, contentSlug)
    return NextResponse.json({ revisions })
  } catch {
    return NextResponse.json({ revisions: [] }, { status: 500 })
  }
}
