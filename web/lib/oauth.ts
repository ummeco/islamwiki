import 'server-only'

import crypto from 'node:crypto'

// ── Provider configuration ──

export type OAuthProvider = 'google' | 'facebook' | 'x' | 'github'

interface ProviderConfig {
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  scopes: string
  clientIdEnv: string
  clientSecretEnv: string
  pkce: boolean
  tokenAuthMethod?: 'basic' | 'post' // default: post
  scopeSeparator?: string // default: space
}

const PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userinfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: 'openid email profile',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    pkce: false,
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    userinfoUrl: 'https://graph.facebook.com/me?fields=id,name,email',
    scopes: 'email,public_profile',
    clientIdEnv: 'FACEBOOK_APP_ID',
    clientSecretEnv: 'FACEBOOK_APP_SECRET',
    pkce: false,
    scopeSeparator: ',',
  },
  x: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.x.com/2/oauth2/token',
    userinfoUrl: 'https://api.x.com/2/users/me?user.fields=profile_image_url',
    scopes: 'tweet.read users.read',
    clientIdEnv: 'X_CLIENT_ID',
    clientSecretEnv: 'X_CLIENT_SECRET',
    pkce: true,
    tokenAuthMethod: 'basic',
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userinfoUrl: 'https://api.github.com/user',
    scopes: 'user:email',
    clientIdEnv: 'GITHUB_CLIENT_ID',
    clientSecretEnv: 'GITHUB_CLIENT_SECRET',
    pkce: false,
  },
}

export function getProviderConfig(provider: OAuthProvider): ProviderConfig | undefined {
  return PROVIDERS[provider]
}

export function isValidProvider(provider: string): provider is OAuthProvider {
  return provider in PROVIDERS
}

// ── Crypto helpers ──

export function generateState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // code_verifier: 43-128 chars, Base64URL-safe
  const verifier = crypto.randomBytes(32).toString('base64url')
  // code_challenge: SHA-256 of verifier, Base64URL-encoded
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
  return { codeVerifier: verifier, codeChallenge: challenge }
}

export function validateState(stored: string, received: string): boolean {
  if (stored.length !== received.length) return false
  try {
    return crypto.timingSafeEqual(
      Buffer.from(stored, 'utf-8'),
      Buffer.from(received, 'utf-8')
    )
  } catch {
    return false
  }
}

// ── OAuth flow helpers ──

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010'
}

export function buildAuthUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge?: string
): string {
  const config = PROVIDERS[provider]
  const clientId = process.env[config.clientIdEnv]
  if (!clientId) {
    throw new Error(`Missing env var ${config.clientIdEnv}`)
  }

  const redirectUri = `${getBaseUrl()}/api/auth/oauth/${provider}/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })

  // Scopes
  if (provider === 'facebook') {
    params.set('scope', config.scopes)
  } else {
    params.set('scope', config.scopes)
  }

  // PKCE for X/Twitter
  if (config.pkce && codeChallenge) {
    params.set('code_challenge', codeChallenge)
    params.set('code_challenge_method', 'S256')
  }

  return `${config.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  codeVerifier?: string
): Promise<string> {
  const config = PROVIDERS[provider]
  const clientId = process.env[config.clientIdEnv]
  const clientSecret = process.env[config.clientSecretEnv]
  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${provider}`)
  }

  const redirectUri = `${getBaseUrl()}/api/auth/oauth/${provider}/callback`
  const body = new URLSearchParams({
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  // Some providers want client_id/secret in body, others in Authorization header
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (config.tokenAuthMethod === 'basic') {
    // X/Twitter uses Basic auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
    body.set('client_id', clientId)
  } else {
    body.set('client_id', clientId)
    body.set('client_secret', clientSecret)
  }

  if (config.pkce && codeVerifier) {
    body.set('code_verifier', codeVerifier)
  }

  // GitHub needs Accept: application/json
  if (provider === 'github') {
    headers['Accept'] = 'application/json'
  }

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed for ${provider}: ${res.status} ${text}`)
  }

  const data = await res.json()
  const token = data.access_token
  if (!token) {
    throw new Error(`No access_token in response from ${provider}`)
  }

  return token
}

export interface OAuthUserProfile {
  provider: OAuthProvider
  provider_id: string
  email?: string
  name?: string
}

export async function fetchUserProfile(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserProfile> {
  const config = PROVIDERS[provider]

  const res = await fetch(config.userinfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`User profile fetch failed for ${provider}: ${res.status} ${text}`)
  }

  const data = await res.json()

  // Normalize across providers
  switch (provider) {
    case 'google':
      return {
        provider: 'google',
        provider_id: String(data.id),
        email: data.email,
        name: data.name,
      }
    case 'facebook':
      return {
        provider: 'facebook',
        provider_id: String(data.id),
        email: data.email,
        name: data.name,
      }
    case 'x':
      return {
        provider: 'x',
        provider_id: String(data.data?.id || data.id),
        name: data.data?.name || data.name,
      }
    case 'github':
      return {
        provider: 'github',
        provider_id: String(data.id),
        email: data.email,
        name: data.name || data.login,
      }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
