/**
 * In-memory IP block list for Phase 1.
 * Persists within a single serverless function lifecycle.
 * Phase 2: migrate to Hasura iw_ip_blocks table.
 */

interface IpBlock {
  ip: string
  reason: string
  blockedBy: string
  blockedAt: string
}

const blockedIps = new Map<string, IpBlock>()

export function blockIp(ip: string, reason: string, blockedBy: string): void {
  blockedIps.set(ip, { ip, reason, blockedBy, blockedAt: new Date().toISOString() })
}

export function unblockIp(ip: string): boolean {
  return blockedIps.delete(ip)
}

export function isIpBlocked(ip: string): IpBlock | null {
  return blockedIps.get(ip) ?? null
}

export function listBlockedIps(): IpBlock[] {
  return Array.from(blockedIps.values())
}
