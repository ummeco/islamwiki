// FILE: src/pages/api/auth/signup.ts
// PURPOSE: POST /api/auth/signup — email+password registration. Astro port of the Next server
//   actions register()/registerEmail() in app/actions/auth.ts. Verifies Turnstile (fail-closed in
//   prod), validates email + password confirmation, calls Hasura Auth signUp, sets cookies, returns
//   a redirect target for the client.
// SECURITY (preserved exactly):
//   - Turnstile bot check; fail-closed when NODE_ENV === 'production'.
//   - validateEmail before account creation; password/confirm match required.
//   - Tokens stored httpOnly; secure in production; sameSite lax.
//   - 409 (existing account) mapped to a generic message to limit enumeration.
import type { APIRoute } from 'astro'
import * as authClient from '@/lib/auth-client'
import { validateEmail } from '@/lib/validation'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData()
  const displayName = form.get('display_name') as string | null
  const email = form.get('email') as string | null
  const password = form.get('password') as string | null
  const confirmPassword = form.get('confirm_password') as string | null
  const turnstileToken = (form.get('cf-turnstile-response') as string | null) ?? ''

  if (!displayName || !email || !password) {
    return json({ error: 'All fields are required.' }, 400)
  }

  // Turnstile — fail closed in production
  const turnstileOk = await verifyTurnstileToken(turnstileToken)
  if (!turnstileOk && process.env.NODE_ENV === 'production') {
    return json({ error: 'Bot check failed. Please try again.' }, 403)
  }

  if (!validateEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match.' }, 400)
  }

  const { data, error } = await authClient.signUp(email, password, displayName)

  if (error || !data) {
    if (error?.status === 409) {
      return json({ error: 'An account with this email already exists.' }, 409)
    }
    if (error?.status === 400) {
      return json({ error: error.message ?? 'Invalid registration details.' }, 400)
    }
    return json({ error: error?.message ?? 'Registration failed. Please try again.' }, 400)
  }

  const isProd = import.meta.env.PROD
  cookies.set('iw_at', data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: data.accessTokenExpiresIn,
    path: '/',
  })
  cookies.set('iw_rt', data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return json({ success: true, redirect: '/' })
}
