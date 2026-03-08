import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { reviewContent } from '@/lib/ai/review'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 AI review requests per 15 minutes per IP
  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`ai-review:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  // Only moderators and above can trigger manual AI reviews
  if (user.trustLevel < 3) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, content, contentType } = body

    if (!title || !content || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, contentType.' },
        { status: 400 }
      )
    }

    const result = await reviewContent(title, content, contentType)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error.' },
      { status: 500 }
    )
  }
}
