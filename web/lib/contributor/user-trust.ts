import 'server-only'
import { getTrustLevel, type TrustLevel } from './trust'

const HASURA_URL = process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL!
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!

async function hasuraAdmin<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

export interface UserTrust {
  user_id: string
  username: string
  trust_score: number
  trust_level: TrustLevel
  edits_approved: number
  edits_rejected: number
  edits_pending: number
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  created_at: string
  updated_at: string
}

export async function getUserTrustByUsername(username: string): Promise<UserTrust | null> {
  const query = `
    query GetUserTrustByUsername($username: String!) {
      iw_user_trust(where: { username: { _eq: $username } }, limit: 1) {
        user_id username trust_score trust_level
        edits_approved edits_rejected edits_pending
        is_banned ban_reason banned_at created_at updated_at
      }
    }
  `
  const data = await hasuraAdmin<{ iw_user_trust: UserTrust[] }>(query, { username })
  return data.iw_user_trust[0] ?? null
}

export async function getUserTrust(userId: string): Promise<UserTrust | null> {
  const query = `
    query GetUserTrust($id: String!) {
      iw_user_trust_by_pk(user_id: $id) {
        user_id username trust_score trust_level
        edits_approved edits_rejected edits_pending
        is_banned ban_reason banned_at created_at updated_at
      }
    }
  `
  const data = await hasuraAdmin<{ iw_user_trust_by_pk: UserTrust | null }>(query, { id: userId })
  return data.iw_user_trust_by_pk
}

export async function upsertUserTrust(
  userId: string,
  username: string,
  scoreDelta: number,
  field?: 'edits_approved' | 'edits_rejected' | 'edits_pending'
): Promise<UserTrust> {
  // Upsert — create with defaults if not exists, update score
  const current = await getUserTrust(userId)
  const currentScore = current?.trust_score ?? 0
  const newScore = Math.max(0, currentScore + scoreDelta)
  const newLevel = getTrustLevel(newScore)

  const fieldIncrement = field
    ? { [field]: (current?.[field] ?? 0) + 1 }
    : {}

  const mutation = `
    mutation UpsertUserTrust($obj: iw_user_trust_insert_input!) {
      insert_iw_user_trust_one(
        object: $obj
        on_conflict: {
          constraint: iw_user_trust_pkey
          update_columns: [trust_score, trust_level, edits_approved, edits_rejected, edits_pending, updated_at]
        }
      ) {
        user_id username trust_score trust_level
        edits_approved edits_rejected edits_pending
        is_banned ban_reason banned_at created_at updated_at
      }
    }
  `
  const data = await hasuraAdmin<{ insert_iw_user_trust_one: UserTrust }>(mutation, {
    obj: {
      user_id: userId,
      username,
      trust_score: newScore,
      trust_level: newLevel,
      edits_approved: current?.edits_approved ?? 0,
      edits_rejected: current?.edits_rejected ?? 0,
      edits_pending: current?.edits_pending ?? 0,
      ...fieldIncrement,
      updated_at: new Date().toISOString(),
    },
  })
  return data.insert_iw_user_trust_one
}

export async function banUser(userId: string, bannedBy: string, reason: string): Promise<void> {
  const mutation = `
    mutation BanUser($id: String!, $by: String!, $reason: String!, $now: timestamptz!) {
      update_iw_user_trust_by_pk(
        pk_columns: { user_id: $id }
        _set: { is_banned: true, ban_reason: $reason, banned_at: $now, banned_by: $by, updated_at: $now }
      ) { user_id }
    }
  `
  await hasuraAdmin(mutation, {
    id: userId,
    by: bannedBy,
    reason,
    now: new Date().toISOString(),
  })
}
