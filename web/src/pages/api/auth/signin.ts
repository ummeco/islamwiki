// FILE: src/pages/api/auth/signin.ts
// PURPOSE: POST /api/auth/signin — email+password login. Astro port of the Next server action
//   login() in app/actions/auth.ts. Verifies Turnstile (fail-closed in prod), calls Hasura Auth
//   signIn, sets httpOnly iw_at/iw_rt cookies, returns a safe redirect target for the client.
// SECURITY (preserved exactly):
//   - Turnstile bot check; fail-closed when NODE_ENV === 'production'.
//   - Tokens stored httpOnly; secure flag in production; sameSite lax.
//   - Open-redirect guard: only same-origin paths ("/..." not "//...") are honored.
//   - Hasura Auth errors mapped to generic messages (no account enumeration on 401).
import type { APIRoute } from 'astro'
import * as authClient from '@/lib/auth-client'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function setAuthCookies(
  cookies: Parameters<APIRoute>[0]['cookies'],
  session: authClient.AuthSession
): void {
  const isProd = import.meta.env.PROD
  cookies.set('iw_at', session.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: session.accessTokenExpiresIn,
    path: '/',
  })
  cookies.set('iw_rt', session.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

function safeRedirect(target: string | null): string {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/'
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData()
  const email = form.get('email') as string | null
  const password = form.get('password') as string | null
  const redirectTo = form.get('redirect') as string | null
  const turnstileToken = (form.get('cf-turnstile-response') as string | null) ?? ''

  if (!email || !password) {
    return json({ error: 'Email and password are required.' }, 400)
  }

  // Turnstile — fail closed in production
  const turnstileOk = await verifyTurnstileToken(turnstileToken)
  if (!turnstileOk && process.env.NODE_ENV === 'production') {
    return json({ error: 'Bot check failed. Please try again.' }, 403)
  }

  const { data, error } = await authClient.signIn(email, password)

  if (error || !data) {
    if (error?.status === 401) return json({ error: 'Invalid email or password.' }, 401)
    if (error?.status === 429) {
      return json({ error: 'Too many login attempts. Please try again later.' }, 429)
    }
    return json({ error: error?.message ?? 'Login failed. Please try again.' }, 400)
  }

  setAuthCookies(cookies, data)
  return json({ success: true, redirect: safeRedirect(redirectTo) })
}
