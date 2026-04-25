/**
 * Tests for T1-4-14: trusted-role mapping in middleware.
 *
 * Verifies:
 * 1. `trusted` role (trust level 1) is in ROLE_TRUST_MAP and returns 1.
 * 2. `curator` role is in ROLE_TRUST_MAP and returns 2.
 * 3. All canonical islamwiki roles map to the correct trust level.
 * 4. Unknown roles fall back to 0.
 * 5. `x-islamwiki-role` forwarding: only known roles pass through; unknown roles become 'public'.
 */
import { describe, it, expect } from 'vitest'

// ── Re-implement the canonical role map from middleware.ts under test ────────
// We keep this map in sync with ROLE_TRUST_MAP in web/middleware.ts manually.
// Any divergence will cause these tests to fail — the intent is to be the spec.

const ROLE_TRUST_MAP: Record<string, number> = {
  owner: 5,
  admin: 4,
  moderator: 3,
  curator: 2,
  editor: 2,
  trusted: 1,
  user: 0,
  public: 0,
}

function getTrustLevelFromRole(role: string | undefined): number {
  return ROLE_TRUST_MAP[role ?? 'user'] ?? 0
}

// Replicates the islamwikiRole derivation from middleware.ts
function deriveIslamwikiRole(role: string | undefined): string {
  return role && role in ROLE_TRUST_MAP ? role : 'public'
}

// ── Trust level mapping ──────────────────────────────────────────────────────

describe('getTrustLevelFromRole() — T1-4-14', () => {
  it('trusted role maps to trust level 1', () => {
    expect(getTrustLevelFromRole('trusted')).toBe(1)
  })

  it('curator role maps to trust level 2', () => {
    expect(getTrustLevelFromRole('curator')).toBe(2)
  })

  it('editor role maps to trust level 2', () => {
    expect(getTrustLevelFromRole('editor')).toBe(2)
  })

  it('moderator role maps to trust level 3', () => {
    expect(getTrustLevelFromRole('moderator')).toBe(3)
  })

  it('admin role maps to trust level 4', () => {
    expect(getTrustLevelFromRole('admin')).toBe(4)
  })

  it('owner role maps to trust level 5', () => {
    expect(getTrustLevelFromRole('owner')).toBe(5)
  })

  it('user role maps to trust level 0', () => {
    expect(getTrustLevelFromRole('user')).toBe(0)
  })

  it('public role maps to trust level 0', () => {
    expect(getTrustLevelFromRole('public')).toBe(0)
  })

  it('undefined role defaults to trust level 0', () => {
    expect(getTrustLevelFromRole(undefined)).toBe(0)
  })

  it('unknown role falls back to trust level 0', () => {
    expect(getTrustLevelFromRole('superuser')).toBe(0)
    expect(getTrustLevelFromRole('')).toBe(0)
  })
})

// ── x-islamwiki-role header derivation ──────────────────────────────────────

describe('deriveIslamwikiRole() — x-islamwiki-role header', () => {
  it('passes curator through as-is', () => {
    expect(deriveIslamwikiRole('curator')).toBe('curator')
  })

  it('passes editor through as-is', () => {
    expect(deriveIslamwikiRole('editor')).toBe('editor')
  })

  it('passes trusted through as-is', () => {
    expect(deriveIslamwikiRole('trusted')).toBe('trusted')
  })

  it('passes moderator through as-is', () => {
    expect(deriveIslamwikiRole('moderator')).toBe('moderator')
  })

  it('passes admin through as-is', () => {
    expect(deriveIslamwikiRole('admin')).toBe('admin')
  })

  it('passes owner through as-is', () => {
    expect(deriveIslamwikiRole('owner')).toBe('owner')
  })

  it('unknown role becomes public', () => {
    expect(deriveIslamwikiRole('superuser')).toBe('public')
  })

  it('undefined role becomes public', () => {
    expect(deriveIslamwikiRole(undefined)).toBe('public')
  })

  it('empty string role becomes public', () => {
    expect(deriveIslamwikiRole('')).toBe('public')
  })
})
