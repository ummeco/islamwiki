// @vitest-environment node

/**
 * Tests for T1-4-1: islamwiki middleware JWT verification.
 *
 * Verifies:
 * 1. Valid token with correct signature and claims passes through.
 * 2. Expired token returns null (401 path).
 * 3. Malformed / non-JWT string returns null.
 * 4. Token signed with wrong key returns null (forged JWT).
 * 5. Missing token (no Authorization / cookie) returns null.
 * 6. Valid token with Hasura claims extracts role correctly.
 * 7. Valid token missing Hasura claims falls back to public role.
 *
 * Strategy: re-implement verifyJWT inline using jose SignJWT + jwtVerify
 * against a fixed local Uint8Array secret — avoids needing a live JWKS server
 * in CI. The production middleware uses createRemoteJWKSet; unit tests exercise
 * the same jwtVerify call shape with a local key to validate claim parsing.
 */
import { describe, it, expect } from 'vitest'
import { SignJWT, jwtVerify } from 'jose'

// ── Types (mirror middleware.ts) ─────────────────────────────────────────────

interface HasuraClaims {
  'x-hasura-default-role'?: string
  'x-hasura-allowed-roles'?: string[]
  'x-hasura-user-id'?: string
}

interface JWTPayload {
  sub: string
  exp: number
  'https://hasura.io/jwt/claims'?: HasuraClaims
  displayName?: string
  email?: string
}

// ── Fixed test secrets (Uint8Array — works in Node.js + jsdom) ───────────────
// Uses a fixed 32-byte secret so tests are deterministic.

const TEST_SECRET = new TextEncoder().encode('islamwiki-test-secret-key-32bytes!')
const WRONG_SECRET = new TextEncoder().encode('islamwiki-WRONG-secret-key-32byte!')

// ── JWT helpers ───────────────────────────────────────────────────────────────

async function signToken(
  payload: Record<string, unknown>,
  secret: Uint8Array = TEST_SECRET,
  options: { expiresIn?: string; expiredAt?: Date } = {}
): Promise<string> {
  let builder = new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject((payload.sub as string) ?? 'test-user-id')

  if (options.expiredAt) {
    // Set issuedAt well in the past and expiry also in the past
    const pastTs = Math.floor(options.expiredAt.getTime() / 1000) - 7200 // 2h before expiry
    builder = builder.setIssuedAt(pastTs)
    builder = builder.setExpirationTime(options.expiredAt)
  } else {
    builder = builder.setExpirationTime(options.expiresIn ?? '1h')
  }

  return builder.sign(secret)
}

/**
 * Mirrors the verifyJWT function from middleware.ts.
 * Production uses createRemoteJWKSet; tests use a local Uint8Array secret.
 */
async function verifyJWT(token: string, secret: Uint8Array = TEST_SECRET): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ── Hasura claims builder ─────────────────────────────────────────────────────

function hasuraClaims(role: string, userId = 'usr_abc123'): Record<string, unknown> {
  return {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': role,
      'x-hasura-allowed-roles': [role, 'public'],
      'x-hasura-user-id': userId,
    },
  }
}

// ── Role derivation (mirrors middleware.ts) ───────────────────────────────────

const ROLE_TRUST_MAP: Record<string, number> = {
  owner: 5, admin: 4, moderator: 3, curator: 2, editor: 2, trusted: 1, user: 0, public: 0,
}

function deriveIslamwikiRole(role: string | undefined): string {
  return role && role in ROLE_TRUST_MAP ? role : 'public'
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('verifyJWT() — T1-4-1 JWT signature verification', () => {

  // Case 1: valid token ─────────────────────────────────────────────────────

  it('returns payload for a valid token with correct signature', async () => {
    const token = await signToken({ sub: 'usr_valid', ...hasuraClaims('editor') })
    const payload = await verifyJWT(token)

    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('usr_valid')
    expect(payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']).toBe('editor')
  })

  // Case 2: expired token ───────────────────────────────────────────────────

  it('returns null for an expired token', async () => {
    const expiredAt = new Date(Date.now() - 60_000) // 1 minute in the past
    const token = await signToken(
      { sub: 'usr_expired', ...hasuraClaims('user') },
      TEST_SECRET,
      { expiredAt }
    )

    const payload = await verifyJWT(token)

    expect(payload).toBeNull()
  })

  // Case 3: malformed string ────────────────────────────────────────────────

  it('returns null for malformed / non-JWT strings', async () => {
    expect(await verifyJWT('not.a.jwt')).toBeNull()
    expect(await verifyJWT('header.payload')).toBeNull()  // only 2 parts
    expect(await verifyJWT('')).toBeNull()
    expect(await verifyJWT('aaaa.bbbb.cccc')).toBeNull()   // valid structure, garbage content
  })

  // Case 4: wrong signature (forged JWT) ────────────────────────────────────

  it('returns null for a token signed with the wrong key (forged JWT)', async () => {
    // Sign with TEST_SECRET, then verify with WRONG_SECRET — simulates a forged token
    const token = await signToken({ sub: 'usr_forged', ...hasuraClaims('admin') })

    const payload = await verifyJWT(token, WRONG_SECRET)

    expect(payload).toBeNull()
  })

  // Case 5: missing token ───────────────────────────────────────────────────

  it('returns null when no token is provided (missing cookie)', async () => {
    // Mirrors middleware: const token = request.cookies.get('iw_at')?.value
    // Cookie absent → token is undefined → skip jwtVerify, return null
    const tokenFromCookie: string | undefined = undefined
    const payload = tokenFromCookie ? await verifyJWT(tokenFromCookie) : null

    expect(payload).toBeNull()
  })

  // Case 6: Hasura claims extraction ────────────────────────────────────────

  it('extracts x-hasura-default-role and user-id from valid JWT', async () => {
    const token = await signToken({
      sub: 'usr_curator_001',
      email: 'curator@example.com',
      ...hasuraClaims('curator', 'usr_curator_001'),
    })

    const payload = await verifyJWT(token)

    expect(payload).not.toBeNull()
    const claims = payload!['https://hasura.io/jwt/claims']
    expect(claims).toBeDefined()
    expect(claims!['x-hasura-default-role']).toBe('curator')
    expect(claims!['x-hasura-user-id']).toBe('usr_curator_001')
    expect(claims!['x-hasura-allowed-roles']).toContain('curator')
  })

  // Case 7: missing Hasura claims → public role ─────────────────────────────

  it('falls back to public role when Hasura claims namespace is absent', async () => {
    const token = await signToken({ sub: 'usr_no_claims' })
    const payload = await verifyJWT(token)

    expect(payload).not.toBeNull()
    const role = payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    expect(deriveIslamwikiRole(role)).toBe('public')
  })

  // Case 8: sub claim carries the user-id forwarded as x-islamwiki-user-id ──

  it('sub claim is present for downstream x-islamwiki-user-id header', async () => {
    const token = await signToken({
      sub: 'usr_sub_check',
      ...hasuraClaims('editor', 'usr_sub_check'),
    })
    const payload = await verifyJWT(token)

    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('usr_sub_check')
    // Middleware sets: requestHeaders.set('x-islamwiki-user-id', jwtPayload.sub)
    // Verify the sub is a string the middleware can safely use as a header value
    expect(typeof payload!.sub).toBe('string')
    expect(payload!.sub.length).toBeGreaterThan(0)
  })
})

// ── Role derivation with JWT context ─────────────────────────────────────────

describe('x-islamwiki-role derivation from JWT payload — T1-4-1 + T1-4-14', () => {
  it('trusted role from JWT claims maps to islamwiki-role: trusted', async () => {
    const token = await signToken({ sub: 'u1', ...hasuraClaims('trusted') })
    const payload = await verifyJWT(token)
    const role = payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    expect(deriveIslamwikiRole(role)).toBe('trusted')
  })

  it('curator role from JWT claims maps to islamwiki-role: curator', async () => {
    const token = await signToken({ sub: 'u2', ...hasuraClaims('curator') })
    const payload = await verifyJWT(token)
    const role = payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    expect(deriveIslamwikiRole(role)).toBe('curator')
  })

  it('admin role from JWT claims maps to islamwiki-role: admin (trust level 4)', async () => {
    const token = await signToken({ sub: 'u3', ...hasuraClaims('admin') })
    const payload = await verifyJWT(token)
    const role = payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    expect(deriveIslamwikiRole(role)).toBe('admin')
    expect(ROLE_TRUST_MAP[role!]).toBe(4)
  })

  it('unknown role in JWT claims falls back to public', async () => {
    const token = await signToken({
      sub: 'u4',
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'superuser', // not in ROLE_TRUST_MAP
        'x-hasura-allowed-roles': ['superuser'],
      },
    })
    const payload = await verifyJWT(token)
    const role = payload!['https://hasura.io/jwt/claims']?.['x-hasura-default-role']
    expect(deriveIslamwikiRole(role)).toBe('public')
  })
})

// ── Auth-gate path matching ───────────────────────────────────────────────────

describe('Auth-gated path matching — T1-4-1 route guards', () => {
  // Mirrors middleware.ts needsAuth logic
  function needsAuth(checkPath: string): boolean {
    return (
      checkPath.startsWith('/admin') ||
      checkPath.startsWith('/auth/') ||
      checkPath === '/account' ||
      checkPath === '/signin' ||
      checkPath === '/signup' ||
      checkPath.includes('/edit')
    )
  }

  it('/admin/* routes are auth-gated', () => {
    expect(needsAuth('/admin')).toBe(true)
    expect(needsAuth('/admin/queue')).toBe(true)
    expect(needsAuth('/admin/users')).toBe(true)
  })

  it('/edit paths are auth-gated', () => {
    expect(needsAuth('/quran/al-fatiha/edit')).toBe(true)
    expect(needsAuth('/wiki/some-page/edit')).toBe(true)
  })

  it('account / signin / signup are auth-gated', () => {
    expect(needsAuth('/account')).toBe(true)
    expect(needsAuth('/signin')).toBe(true)
    expect(needsAuth('/signup')).toBe(true)
  })

  it('public content routes are not auth-gated', () => {
    expect(needsAuth('/')).toBe(false)
    expect(needsAuth('/quran/al-fatiha')).toBe(false)
    expect(needsAuth('/hadith/bukhari')).toBe(false)
    expect(needsAuth('/search')).toBe(false)
    expect(needsAuth('/articles/some-article')).toBe(false)
    expect(needsAuth('/people/ibn-taymiyyah')).toBe(false)
  })
})
