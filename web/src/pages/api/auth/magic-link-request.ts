// FILE: src/pages/api/auth/magic-link-request.ts
// PURPOSE: POST /api/auth/magic-link-request — request a passwordless magic-link email. Astro port
//   of the Next server action requestMagicLink() in app/actions/auth.ts. (The GET callback that
//   consumes the link lives in src/pages/api/auth/magic-link.ts.)
// SECURITY (preserved exactly):
//   - Always returns { sent: true } regardless of whether the email exists (no enumeration).
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

  // Don't reveal whether the email exists — always report sent.
  await authClient.requestMagicLink(email).catch(() => undefined)
  return json({ sent: true })
}
