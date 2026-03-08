import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { submitRevision, getRevisionById } from '@/lib/contributor/revisions'
import { upsertUserTrust } from '@/lib/contributor/user-trust'
import { TRUST_DELTAS, canRevertEdits } from '@/lib/contributor/trust'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canRevertEdits(user.trustLevel)) {
    return NextResponse.json({ error: 'Requires Editor level (2+)' }, { status: 403 })
  }

  const { revisionId, reason } = await req.json()
  if (!revisionId) return NextResponse.json({ error: 'revisionId required' }, { status: 400 })
  if (!reason) return NextResponse.json({ error: 'reason required for revert' }, { status: 400 })

  const original = await getRevisionById(revisionId)
  if (!original) return NextResponse.json({ error: 'Revision not found' }, { status: 404 })

  const revert = await submitRevision({
    contentType: original.content_type,
    contentSlug: original.content_slug,
    contentId: original.content_id ?? undefined,
    editorId: user.userId,
    editorUsername: user.username || user.email || 'Anonymous',
    previousContent: original.new_content,
    newContent: original.previous_content ?? '',
    changeSummary: `Revert: ${reason}`,
    isMinor: false,
    editorTrustScore: user.trustLevel * 50,
  })

  await upsertUserTrust(original.editor_id, original.editor_username, TRUST_DELTAS.edit_reverted)

  return NextResponse.json({ revert })
}
