import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { getUserTrust, banUser, upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS, canWarnUsers, canBanUsers } from '@/lib/contributor/trust'

export async function GET(req: NextRequest) {
  const caller = await getSessionUser()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = new URL(req.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Only self or moderators (level 3+) may read full trust records
  if (caller.userId !== userId && caller.trustLevel < 3) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const trust = await getUserTrust(userId)
  return NextResponse.json({ trust })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, targetUserId, reason } = await req.json()

  if (action === 'warn') {
    if (!canWarnUsers(user.trustLevel)) {
      return NextResponse.json({ error: 'Requires Moderator level (3+)' }, { status: 403 })
    }
    const trust = await getUserTrust(targetUserId)
    const updated = await upsertUserTrust(targetUserId, trust?.username ?? targetUserId, TRUST_DELTAS.warned)
    return NextResponse.json({ trust: updated })
  }

  if (action === 'ban') {
    if (!canBanUsers(user.trustLevel)) {
      return NextResponse.json({ error: 'Requires Admin level (4+)' }, { status: 403 })
    }
    if (!reason) return NextResponse.json({ error: 'reason required' }, { status: 400 })
    await banUser(targetUserId, user.userId, reason)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'action must be warn or ban' }, { status: 400 })
}
