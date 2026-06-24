/**
 * ChangePasswordForm.tsx — Astro island port of app/auth/change-password/page.tsx
 *
 * PURPOSE: Authenticated "set new password" form (reached after a reset-link callback
 *   establishes a short-lived session). Hydrated via client:load on /auth/change-password.
 *
 * CONVERSION (Next → Astro):
 *   - changePassword server action (useActionState) → fetch() POST /api/auth/change-password.
 *     The route requires a valid iw_at cookie (401→redirect /account), changes the password
 *     via lib/auth-client server-side, and returns { success, redirect } / { error }.
 * SECURITY: the access token lives in an httpOnly cookie read only by the server route;
 *   no token or auth secret reaches this client island.
 * REF: ports app/auth/change-password/page.tsx (auth-interactive migration group)
 */
'use client'

import { useState } from 'react'

const inputCls =
  'w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60'

export function ChangePasswordForm() {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const res = await fetch('/api/auth/change-password', { method: 'POST', body: new FormData(e.currentTarget) })
      const data = (await res.json()) as { error?: string; success?: boolean; redirect?: string }
      if (data.success) window.location.assign(data.redirect ?? '/account')
      else if (res.status === 401) window.location.assign(data.redirect ?? '/account')
      else if (data.error) setError(data.error)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="mt-2 text-sm text-iw-text-secondary">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new_password" className="mb-1 block text-sm font-medium text-iw-text-secondary">
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              autoFocus
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium text-iw-text-secondary">
              Confirm New Password
            </label>
            <input id="confirm_password" name="confirm_password" type="password" required minLength={8} className={inputCls} />
          </div>
          <button
            aria-label="Submit"
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light disabled:opacity-50"
          >
            {pending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
