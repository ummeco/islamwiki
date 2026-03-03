import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { reviewContent } from '@/lib/ai/review'

export async function POST(request: NextRequest) {
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
