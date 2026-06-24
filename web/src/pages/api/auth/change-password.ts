// FILE: src/pages/api/auth/change-password.ts
// PURPOSE: POST /api/auth/change-password — authenticated password change. Astro port of the Next
//   server action changePassword() in app/actions/auth.ts. Reads the access token from the httpOnly
//   iw_at cookie, validates the new password + confirmation, calls Hasura Auth changePassword,
//   returns a safe redirect target.
// SECURITY (preserved exactly):
//   - Requires a valid iw_at access-token cookie (401 when absent).
//   - new_password / confirm_password match required.
//   - Open-redirect guard: only same-origin paths are honored, default /account.
import type { APIRoute } from 'astro'
import { changePassword } from '@/lib/auth-client'

export const prerender = false

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('iw_at')?.value
  if (!token) {
    return json({ error: 'Not authenticated.', redirect: '/account' }, 401)
  }

  const form = await request.formData()
  const redirectTo = form.get('redirect_to') as string | null
  const newPassword = form.get('new_password') as string | null
  const confirmPassword = form.get('confirm_password') as string | null

  if (!newPassword || !confirmPassword) {
    return json({ error: 'All fields are required.' }, 400)
  }
  if (newPassword !== confirmPassword) {
    return json({ error: 'New passwords do not match.' }, 400)
  }

  const { error } = await changePassword(token, newPassword)
  if (error) {
    return json({ error: error.message ?? 'Failed to change password.' }, 400)
  }

  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/account'
  return json({ success: true, redirect: safeRedirect })
}
