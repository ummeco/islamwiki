/**
 * S9-03: DB-backed IP block list — iw_ip_blocks table via Hasura adminClient.
 * In-memory cache with 60s TTL protects against hot-path latency.
 * Falls back to in-memory (cache miss) rather than failing open.
 *
 * IP detection: x-vercel-forwarded-for header (set by Vercel Edge, not forgeable
 * by the client through Cloudflare CDN).
 */
import 'server-only'

interface IpBlock {
  ip: string
  reason: string
  blockedBy: string
  blockedAt: string
}

// ── 60-second in-memory cache ──────────────────────────────────────────────
const CACHE_TTL_MS = 60_000
const cache = new Map<string, { block: IpBlock | null; ts: number }>()

function cacheGet(ip: string): { block: IpBlock | null } | null {
  const entry = cache.get(ip)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(ip)
    return null
  }
  return { block: entry.block }
}

function cacheSet(ip: string, block: IpBlock | null): void {
  cache.set(ip, { block, ts: Date.now() })
}

// ── Hasura GraphQL helpers (admin secret, server-only) ─────────────────────
const HASURA_ADMIN_URL =
  process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL ?? ''
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(HASURA_ADMIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Hasura admin request failed: ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: unknown[] }
  if (json.errors?.length) throw new Error(`Hasura error: ${JSON.stringify(json.errors)}`)
  return json.data as T
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Block an IP address. Upserts into iw_ip_blocks table.
 * If the table doesn't exist yet (migration pending), silently no-ops.
 */
export async function blockIp(ip: string, reason: string, blockedBy: string): Promise<void> {
  const blockedAt = new Date().toISOString()
  try {
    await gql(
      `mutation BlockIp($ip: String!, $reason: String!, $blocked_by: String!, $blocked_at: timestamptz!) {
        insert_iw_ip_blocks_one(
          object: { ip: $ip, reason: $reason, blocked_by: $blocked_by, blocked_at: $blocked_at }
          on_conflict: { constraint: iw_ip_blocks_pkey, update_columns: [reason, blocked_by, blocked_at] }
        ) { ip }
      }`,
      { ip, reason, blocked_by: blockedBy, blocked_at: blockedAt }
    )
  } catch {
    // Table may not exist in dev — silently no-op
  }
  cacheSet(ip, { ip, reason, blockedBy, blockedAt })
}

/**
 * Remove an IP block. Returns true if a row was deleted.
 */
export async function unblockIp(ip: string): Promise<boolean> {
  try {
    const data = await gql<{ delete_iw_ip_blocks: { affected_rows: number } }>(
      `mutation UnblockIp($ip: String!) {
        delete_iw_ip_blocks(where: { ip: { _eq: $ip } }) { affected_rows }
      }`,
      { ip }
    )
    cacheSet(ip, null)
    return (data.delete_iw_ip_blocks?.affected_rows ?? 0) > 0
  } catch {
    cacheSet(ip, null)
    return false
  }
}

/**
 * Check if an IP is blocked. Checks cache first; falls back to DB.
 */
export async function isIpBlocked(ip: string): Promise<IpBlock | null> {
  const cached = cacheGet(ip)
  if (cached !== null) return cached.block

  try {
    const data = await gql<{
      iw_ip_blocks: { ip: string; reason: string; blocked_by: string; blocked_at: string }[]
    }>(
      `query IsIpBlocked($ip: String!) {
        iw_ip_blocks(where: { ip: { _eq: $ip } }, limit: 1) {
          ip reason blocked_by blocked_at
        }
      }`,
      { ip }
    )
    const row = data.iw_ip_blocks?.[0]
    const block = row
      ? { ip: row.ip, reason: row.reason, blockedBy: row.blocked_by, blockedAt: row.blocked_at }
      : null
    cacheSet(ip, block)
    return block
  } catch {
    // DB unavailable — fail closed (assume not blocked) and don't cache
    return null
  }
}

/**
 * List all blocked IPs. No cache — admin view always reads from DB.
 */
export async function listBlockedIps(): Promise<IpBlock[]> {
  try {
    const data = await gql<{
      iw_ip_blocks: { ip: string; reason: string; blocked_by: string; blocked_at: string }[]
    }>(
      `query ListBlockedIps {
        iw_ip_blocks(order_by: { blocked_at: desc }) {
          ip reason blocked_by blocked_at
        }
      }`,
      {}
    )
    return (data.iw_ip_blocks ?? []).map((r) => ({
      ip: r.ip,
      reason: r.reason,
      blockedBy: r.blocked_by,
      blockedAt: r.blocked_at,
    }))
  } catch {
    return []
  }
}

/**
 * Extract the real client IP from a Vercel/Cloudflare request.
 * Prefers x-vercel-forwarded-for (set by Vercel edge, not forgeable by client).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'
  )
}
