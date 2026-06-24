/**
 * SignInForm.tsx — Astro island port of app/signin/signin-form.tsx
 *
 * PURPOSE: Email + password sign-in card with Cloudflare Turnstile (managed widget).
 *   /signin redirects to /account at the routing layer; this island is the standalone
 *   sign-in surface kept for parity (mounted via client:load).
 *
 * CONVERSION (Next → Astro):
 *   - login server action → fetch() POST /api/auth/signin (sets httpOnly cookies server-side,
 *     verifies Turnstile server-side, returns { success, redirect } / { error }).
 *   - useSearchParams (next/navigation) → URLSearchParams(window.location.search).
 *   - next/link → <a>. AuthCard / FloatingInput (Next-only components) inlined here so the
 *     island is self-contained.
 * SECURITY: Turnstile token is auto-injected by the managed widget into the FormData and
 *   verified server-side (fail-closed in prod); no auth secret reaches this client island.
 * REF: ports app/signin/signin-form.tsx (auth-interactive migration group)
 */
'use client'

import { useEffect, useRef, useState } from 'react'

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''

const inputCls =
  'w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60'

export function SignInForm() {
  const [redirectTo, setRedirectTo] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const turnstileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setRedirectTo(new URLSearchParams(window.location.search).get('redirect') || '')
    } catch {
      // window unavailable
    }
  }, [])

  // Mount Turnstile managed widget — auto-injects cf-turnstile-response into the form.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const res = await fetch('/api/auth/signin', { method: 'POST', body: new FormData(e.currentTarget) })
      const data = (await res.json()) as { error?: string; success?: boolean; redirect?: string }
      if (data.error) setError(data.error)
      else if (data.success) window.location.assign(data.redirect ?? '/')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-iw-border bg-iw-surface p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-iw-text-secondary">Sign in to contribute to Islam.wiki</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            {error && (
              <div
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                {error}
              </div>
            )}

            <input name="email" type="email" placeholder="Email" required autoComplete="email" className={inputCls} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete="current-password"
              className={inputCls}
            />

            {/* Turnstile managed widget — auto-injects cf-turnstile-response */}
            {TURNSTILE_SITE_KEY && (
              <div
                ref={turnstileRef}
                className="cf-turnstile"
                data-sitekey={TURNSTILE_SITE_KEY}
                data-appearance="interaction-only"
              />
            )}

            <button
              aria-label="Submit"
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light disabled:opacity-50"
            >
              {pending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-iw-text-secondary">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-medium text-iw-accent hover:text-white">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
