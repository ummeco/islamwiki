import 'server-only'

import { cookies } from 'next/headers'
import { getIronSession, type SessionOptions } from 'iron-session'

// ── Session data stored in encrypted cookie ──

export interface OAuthVerification {
  provider: string
  provider_id: string
  email?: string
  name?: string
}

export interface SessionData {
  userId: string
  username: string
  email: string
  displayName: string
  role: 'user' | 'editor' | 'moderator' | 'admin' | 'owner'
  trustLevel: 0 | 1 | 2 | 3 | 4 | 5
  mustChangePassword?: boolean
  isLoggedIn: boolean
  // Temporary OAuth fields (used during signup verification flow)
  oauthState?: string
  oauthPKCE?: string
  oauthVerifications?: OAuthVerification[]
}

const defaultSession: SessionData = {
  userId: '',
  username: '',
  email: '',
  displayName: '',
  role: 'user',
  trustLevel: 0,
  isLoggedIn: false,
}

// ── Session options ──

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long_for_dev',
  cookieName: 'iw_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

// ── Helpers ──

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    Object.assign(session, defaultSession)
  }

  return session
}

export async function getSessionUser(): Promise<SessionData | null> {
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return session
}
