import 'server-only'

import { cookies } from 'next/headers'
import { createRemoteJWKSet, jwtVerify } from 'jose'

// ── Session data interface (unchanged — 40 call sites preserved) ──

export interface SessionData {
  userId: string
  username: string
  email: string
  displayName: string
  role: 'user' | 'editor' | 'moderator' | 'admin' | 'owner'
  trustLevel: 0 | 1 | 2 | 3 | 4 | 5
  mustChangePassword?: boolean
  isLoggedIn: boolean
}

// ── JWT claims structure from Hasura Auth ──

interface HasuraJWTClaims {
  sub: string
  email: string
  'https://hasura.io/jwt/claims': {
    'x-hasura-user-id': string
    'x-hasura-default-role': string
    'x-hasura-allowed-roles': string[]
  }
  displayName?: string
  exp: number
  iat: number
}

// Lazy JWKS set — fetched and cached on first use
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'
const JWKS = createRemoteJWKSet(new URL(`${AUTH_URL}/.well-known/jwks.json`))

// Map Hasura roles to our role type
function mapRole(hasuraRole: string): SessionData['role'] {
  const roleMap: Record<string, SessionData['role']> = {
    owner: 'owner',
    admin: 'admin',
    moderator: 'moderator',
    editor: 'editor',
    user: 'user',
  }
  return roleMap[hasuraRole] ?? 'user'
}

// Map role to trust level
function roleToTrustLevel(role: SessionData['role']): SessionData['trustLevel'] {
  const map: Record<SessionData['role'], SessionData['trustLevel']> = {
    user: 0,
    editor: 2,
    moderator: 3,
    admin: 4,
    owner: 5,
  }
  return map[role]
}

// ── Decode + verify JWT → SessionData ──

async function getUserFromJWT(token: string): Promise<SessionData | null> {
  try {
    // jwtVerify: cryptographic signature verification + expiry check via JWKS
    const { payload } = await jwtVerify(token, JWKS)
    const claims = payload as unknown as HasuraJWTClaims

    const hasuraClaims = claims['https://hasura.io/jwt/claims']
    const defaultRole = hasuraClaims?.['x-hasura-default-role'] ?? 'user'
    const role = mapRole(defaultRole)

    // Use displayName as username — avoids email-prefix collisions across providers
    // TODO SF-CRIT.2: fetch canonical username from iw_user_profiles for full fix
    const usernameFromToken = claims.displayName ?? claims.email.split('@')[0]

    return {
      userId: claims.sub,
      username: usernameFromToken,
      email: claims.email,
      displayName: claims.displayName ?? claims.email.split('@')[0],
      role,
      trustLevel: roleToTrustLevel(role),
      isLoggedIn: true,
    }
  } catch {
    return null
  }
}

// ── getSession — same interface as iron-session version ──

export async function getSession(): Promise<SessionData & { save: () => Promise<void>; destroy: () => Promise<void> }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('iw_at')?.value

  let sessionData: SessionData = {
    userId: '',
    username: '',
    email: '',
    displayName: '',
    role: 'user',
    trustLevel: 0,
    isLoggedIn: false,
  }

  if (token) {
    const user = await getUserFromJWT(token)
    if (user) {
      sessionData = user
    }
  }

  // Return session-like object with no-op save/destroy for call-site compatibility
  return {
    ...sessionData,
    save: async () => {
      // Cookies are set by auth actions directly — no-op here
    },
    destroy: async () => {
      // Handled by logout route — no-op here
    },
  }
}

// ── getSessionUser — same interface as iron-session version ──

export async function getSessionUser(): Promise<SessionData | null> {
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return session
}

// ── Server-side token validation (for API routes) ──

export function decodeToken(token: string): Promise<SessionData | null> {
  return getUserFromJWT(token)
}
