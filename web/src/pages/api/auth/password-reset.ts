// FILE: src/pages/api/auth/password-reset.ts
// PURPOSE: POST /api/auth/password-reset — request a password-reset email. Astro port of the Next
//   server action requestPasswordReset() in app/actions/auth.ts. (The GET callback that consumes
//   the reset link lives in src/pages/api/auth/reset-password.ts.)
// SECURITY (preserved exactly):
//   - Always returns { sent: true } to avoid email enumeration.
//   - validateEmail before dispatch.
import type { APIRoute } from 'astro'
import * as authClient from '@/lib/auth-client'
import { validateEmail } from '@/lib/validation'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email') as string | null

  if (!email || !validateEmail(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }

  // Always return success to avoid email enumeration.
  await authClient.requestPasswordReset(email).catch(() => undefined)
  return json({ sent: true })
}
