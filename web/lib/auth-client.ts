/**
 * Hasura Auth client for Islam.wiki.
 * Server-only — never import from Client Components.
 * auth.ummat.dev is the shared Ummat SSO (Hasura Auth).
 */
import 'server-only'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'

export interface AuthSession {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  user: {
    id: string
    email: string
    displayName: string
    defaultRole: string
    roles: string[]
    metadata: Record<string, unknown>
  }
}

export interface AuthError {
  error: string
  message?: string
  status?: number
}

// ── Core fetch helper ──

async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: AuthError | null }> {
  try {
    const res = await fetch(`${AUTH_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!res.ok) {
      let errorBody: { error?: string; message?: string } = {}
      try {
        errorBody = await res.json()
      } catch {
        // ignore parse error
      }
      return {
        data: null,
        error: {
          error: errorBody.error ?? 'auth_error',
          message: errorBody.message ?? `Auth request failed: ${res.status}`,
          status: res.status,
        },
      }
    }

    const data = await res.json() as T
    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        error: 'network_error',
        message: err instanceof Error ? err.message : 'Network error',
      },
    }
  }
}

// ── Sign in with email + password ──

export async function signIn(email: string, password: string) {
  return authFetch<AuthSession>('/signin/email-password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ── Sign up with email + password ──

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  metadata?: Record<string, unknown>
) {
  return authFetch<AuthSession>('/signup/email-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      options: {
        displayName,
        defaultRole: 'user',
        ...(metadata ? { metadata } : {}),
      },
    }),
  })
}

// ── Sign out (invalidates refresh token server-side) ──

export async function signOut(refreshToken: string) {
  return authFetch<void>('/signout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

// ── Refresh access token ──

export async function refreshAccessToken(refreshToken: string) {
  return authFetch<AuthSession>('/token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

// ── Request magic link (passwordless email login) ──

export async function requestMagicLink(email: string) {
  return authFetch<void>('/signin/passwordless/email', {
    method: 'POST',
    body: JSON.stringify({
      email,
      options: { redirectTo: 'https://islam.wiki/api/auth/magic-link' },
    }),
  })
}

// ── Request password reset email ──

export async function requestPasswordReset(email: string) {
  return authFetch<void>('/user/password/reset', {
    method: 'POST',
    body: JSON.stringify({
      email,
      options: { redirectTo: 'https://islam.wiki/api/auth/reset-password' },
    }),
  })
}

// ── Change password (requires valid access token) ──

export async function changePassword(accessToken: string, newPassword: string) {
  return authFetch<void>('/user/password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ newPassword }),
  })
}

// ── Google OAuth URL ──

export function googleOAuthUrl(): string {
  const redirectTo = encodeURIComponent('https://islam.wiki/api/auth/oauth/callback')
  return `${AUTH_URL}/signin/provider/google?redirectTo=${redirectTo}`
}

// ── Exchange passwordless/OAuth ticket for session ──

export async function exchangeTicket(ticket: string) {
  return authFetch<AuthSession>(`/signin/passwordless/email/verify?ticket=${encodeURIComponent(ticket)}`, {
    method: 'GET',
  })
}
