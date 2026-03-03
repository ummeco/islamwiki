import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()

  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      trustLevel: user.trustLevel,
    },
  })
}
