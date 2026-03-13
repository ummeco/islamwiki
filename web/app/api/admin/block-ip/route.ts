import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { blockIp, unblockIp, listBlockedIps } from '@/lib/contributor/ip-block'
import { getClientIp } from '@/lib/rate-limit'

function isAdmin(trustLevel: number) {
  return trustLevel >= 4
}

export async function GET() {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.trustLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ blocks: listBlockedIps() })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.trustLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ip, reason } = await req.json()
  if (!ip || !reason) {
    return NextResponse.json({ error: 'ip and reason required' }, { status: 400 })
  }

  blockIp(ip, reason, user.username || user.email || user.userId)
  return NextResponse.json({ blocked: ip })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.trustLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ip } = await req.json()
  if (!ip) return NextResponse.json({ error: 'ip required' }, { status: 400 })

  const removed = unblockIp(ip)
  return NextResponse.json({ unblocked: removed ? ip : null })
}

// Also allow blocking the IP from the request context (quick ban)
export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.trustLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { reason } = await req.json()
  if (!reason) return NextResponse.json({ error: 'reason required' }, { status: 400 })

  const ip = getClientIp(req.headers)
  blockIp(ip, reason, user.username || user.email || user.userId)
  return NextResponse.json({ blocked: ip })
}
