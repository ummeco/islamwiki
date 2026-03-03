import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth'
import {
  isValidProvider,
  generateState,
  generatePKCE,
  buildAuthUrl,
  type OAuthProvider,
} from '@/lib/oauth'

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    'complex_password_at_least_32_characters_long_for_dev',
  cookieName: 'iw_session',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isValidProvider(provider)) {
    return NextResponse.json(
      { error: 'Invalid OAuth provider' },
      { status: 400 }
    )
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  // Generate CSRF state
  const state = generateState()
  session.oauthState = state

  // PKCE for X/Twitter
  let codeChallenge: string | undefined
  if (provider === 'x') {
    const pkce = generatePKCE()
    session.oauthPKCE = pkce.codeVerifier
    codeChallenge = pkce.codeChallenge
  }

  await session.save()

  try {
    const authUrl = buildAuthUrl(provider as OAuthProvider, state, codeChallenge)

    // Build redirect response that also carries the session cookie
    const redirectResponse = NextResponse.redirect(authUrl)
    // Copy Set-Cookie header from the session save
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      redirectResponse.headers.set('set-cookie', setCookie)
    }
    return redirectResponse
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth configuration error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
