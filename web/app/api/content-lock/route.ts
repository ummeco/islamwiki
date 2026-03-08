import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { canLockPages } from '@/lib/contributor/trust'

const HASURA_URL = process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL!
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!

async function hasuraAdmin<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': HASURA_SECRET },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('type')
  const contentSlug = searchParams.get('slug')
  if (!contentType || !contentSlug) {
    return NextResponse.json({ error: 'type and slug required' }, { status: 400 })
  }

  const data = await hasuraAdmin<{ iw_content_locks: { id: string; lock_level: number; locked_by: string; lock_reason: string | null }[] }>(
    `query IsLocked($type: String!, $slug: String!) {
      iw_content_locks(where: { content_type: { _eq: $type }, content_slug: { _eq: $slug } }) {
        id lock_level locked_by lock_reason
      }
    }`,
    { type: contentType, slug: contentSlug }
  )

  const lock = data.iw_content_locks[0] ?? null
  return NextResponse.json({ locked: !!lock, lock })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canLockPages(user.trustLevel)) {
    return NextResponse.json({ error: 'Requires Moderator level (3+)' }, { status: 403 })
  }

  const { action, contentType, contentSlug, lockReason, lockLevel = 2 } = await req.json()
  if (!contentType || !contentSlug) {
    return NextResponse.json({ error: 'contentType and contentSlug required' }, { status: 400 })
  }

  if (action === 'lock') {
    await hasuraAdmin(
      `mutation LockContent($obj: iw_content_locks_insert_input!) {
        insert_iw_content_locks_one(
          object: $obj
          on_conflict: { constraint: iw_content_locks_content_type_content_slug_key, update_columns: [lock_level, locked_by, lock_reason] }
        ) { id }
      }`,
      { obj: { content_type: contentType, content_slug: contentSlug, locked_by: user.userId, lock_reason: lockReason ?? null, lock_level: lockLevel } }
    )
    return NextResponse.json({ success: true, action: 'locked' })
  }

  if (action === 'unlock') {
    await hasuraAdmin(
      `mutation UnlockContent($type: String!, $slug: String!) {
        delete_iw_content_locks(where: { content_type: { _eq: $type }, content_slug: { _eq: $slug } }) { affected_rows }
      }`,
      { type: contentType, slug: contentSlug }
    )
    return NextResponse.json({ success: true, action: 'unlocked' })
  }

  return NextResponse.json({ error: 'action must be lock or unlock' }, { status: 400 })
}
