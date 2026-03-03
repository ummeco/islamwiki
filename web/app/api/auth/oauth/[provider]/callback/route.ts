import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData, OAuthVerification } from '@/lib/auth'
import {
  isValidProvider,
  validateState,
  exchangeCodeForToken,
  fetchUserProfile,
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010'

  if (!isValidProvider(provider)) {
    return NextResponse.redirect(`${baseUrl}/signup?error=invalid_provider`)
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Provider denied access
  if (error) {
    return NextResponse.redirect(`${baseUrl}/signup?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/signup?error=missing_params`)
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  // Validate CSRF state
  if (!session.oauthState || !validateState(session.oauthState, state)) {
    return NextResponse.redirect(`${baseUrl}/signup?error=invalid_state`)
  }

  try {
    // Exchange code for access token
    const codeVerifier = provider === 'x' ? session.oauthPKCE : undefined
    const accessToken = await exchangeCodeForToken(
      provider as OAuthProvider,
      code,
      codeVerifier
    )

    // Fetch user profile
    const profile = await fetchUserProfile(provider as OAuthProvider, accessToken)

    // Store verification in session (deduplicate by provider)
    const verifications: OAuthVerification[] = session.oauthVerifications || []
    const existingIdx = verifications.findIndex((v) => v.provider === provider)
    const entry: OAuthVerification = {
      provider: profile.provider,
      provider_id: profile.provider_id,
      email: profile.email,
      name: profile.name,
    }

    if (existingIdx >= 0) {
      verifications[existingIdx] = entry
    } else {
      verifications.push(entry)
    }

    session.oauthVerifications = verifications
    // Clear temporary OAuth fields
    session.oauthState = undefined
    session.oauthPKCE = undefined
    await session.save()

    // Redirect back to signup with success
    const redirectResponse = NextResponse.redirect(
      `${baseUrl}/signup?verified=${provider}`
    )
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      redirectResponse.headers.set('set-cookie', setCookie)
    }
    return redirectResponse
  } catch (err) {
    console.error(`OAuth callback error for ${provider}:`, err)
    return NextResponse.redirect(`${baseUrl}/signup?error=oauth_failed`)
  }
}
