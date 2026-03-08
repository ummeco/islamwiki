export const TRUST_THRESHOLDS = {
  0: 0,    // New — all edits pending
  1: 10,   // Trusted — minor edits auto-approved
  2: 50,   // Editor — most edits auto-approved
  3: 150,  // Moderator — all auto-approved, can review others
  4: 500,  // Admin — full access
  5: -1,   // Owner — hardcoded, not score-based
} as const

export const TRUST_DELTAS = {
  edit_approved: 5,
  edit_denied: -3,
  edit_reverted: -10,
  warned: -10,
  reported: -2,
  first_edit: 2,
  milestone_10: 5,   // 10 approved edits
  milestone_50: 10,  // 50 approved edits
} as const

export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5

export function getTrustLevel(score: number): TrustLevel {
  if (score >= TRUST_THRESHOLDS[4]) return 4
  if (score >= TRUST_THRESHOLDS[3]) return 3
  if (score >= TRUST_THRESHOLDS[2]) return 2
  if (score >= TRUST_THRESHOLDS[1]) return 1
  return 0
}

export function getTrustLevelName(level: TrustLevel): string {
  const names: Record<TrustLevel, string> = {
    0: 'New',
    1: 'Trusted',
    2: 'Editor',
    3: 'Moderator',
    4: 'Admin',
    5: 'Owner',
  }
  return names[level]
}

export function canAutoApprove(
  trustLevel: TrustLevel,
  isMinor: boolean,
  diffSizePct: number
): boolean {
  // Level 3+ auto-approve all edits
  if (trustLevel >= 3) return true
  // Level 2+ auto-approve minor edits or small changes (<20%)
  if (trustLevel >= 2 && (isMinor || diffSizePct < 20)) return true
  // Level 1: minor edits only, no large diffs
  if (trustLevel >= 1 && isMinor && diffSizePct < 10) return true
  return false
}

export function canReviewEdits(trustLevel: TrustLevel): boolean {
  return trustLevel >= 2
}

export function canRevertEdits(trustLevel: TrustLevel): boolean {
  return trustLevel >= 2
}

export function canWarnUsers(trustLevel: TrustLevel): boolean {
  return trustLevel >= 3
}

export function canBanUsers(trustLevel: TrustLevel): boolean {
  return trustLevel >= 4
}

export function canLockPages(trustLevel: TrustLevel): boolean {
  return trustLevel >= 3
}

export function canAccessAdmin(trustLevel: TrustLevel): boolean {
  return trustLevel >= 4
}

/**
 * Calculate diff size as % of the longer content.
 * Returns 0-100.
 */
export function calcDiffSizePct(prev: string | null, next: string): number {
  const prevLen = prev?.length ?? 0
  const nextLen = next.length
  const maxLen = Math.max(prevLen, nextLen)
  if (maxLen === 0) return 0
  const diff = Math.abs(nextLen - prevLen)
  return Math.min(100, Math.round((diff / maxLen) * 100))
}
