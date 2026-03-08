import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { submitRevision, getRevisionsByContent } from '@/lib/contributor/revisions'
import { getUserTrust } from '@/lib/contributor/user-trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = checkRateLimit(`revisions:${ip}`, 10, 60_000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

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

  const trust = await getUserTrust(user.userId)
  if (trust?.is_banned) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
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

  const revisions = await getRevisionsByContent(contentType, contentSlug)
  return NextResponse.json({ revisions })
}
