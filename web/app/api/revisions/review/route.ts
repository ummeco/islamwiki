import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { reviewRevision, getRevisionById } from '@/lib/contributor/revisions'
import { upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS } from '@/lib/contributor/trust'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`review:${getClientIp(req.headers)}`, 30, 60_000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.trustLevel < 2) {
    return NextResponse.json({ error: 'Requires Editor level (2+)' }, { status: 403 })
  }

  const { revisionId, action } = await req.json()
  if (!revisionId || !['approved', 'denied'].includes(action)) {
    return NextResponse.json({ error: 'revisionId and action (approved|denied) required' }, { status: 400 })
  }

  const existing = await getRevisionById(revisionId)
  if (!existing) return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
  if (existing.editor_id === user.userId) {
    return NextResponse.json({ error: 'Cannot review your own edits' }, { status: 403 })
  }

  const revision = await reviewRevision(revisionId, user.userId, action)
  const delta = action === 'approved' ? TRUST_DELTAS.edit_approved : TRUST_DELTAS.edit_denied
  const field = action === 'approved' ? 'edits_approved' : 'edits_rejected'
  await upsertUserTrust(revision.editor_id, revision.editor_username, delta, field)

  return NextResponse.json({ revision })
}
