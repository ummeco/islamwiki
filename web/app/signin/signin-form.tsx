'use client'

// T09 (SEC-HARDENING): Turnstile widget injects cf-turnstile-response hidden input
// automatically — server action reads it from FormData.

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'
import { AuthCard } from '@/components/auth/auth-card'
import { FloatingInput } from '@/components/auth/floating-input'
import { login } from '@/app/actions/auth'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export function SignInForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''
  const [state, formAction, pending] = useActionState(login, undefined)
  const turnstileRef = useRef<HTMLDivElement>(null)

  // Mount Turnstile managed widget — auto-injects cf-turnstile-response into form
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to contribute to Islam.wiki"
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        {state?.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {state.error}
          </div>
        )}

        <FloatingInput
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
        />

        <FloatingInput
          name="password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
        />

        {/* T09: Turnstile managed widget — auto-injects cf-turnstile-response */}
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
        <Link href="/signup" className="font-medium text-iw-accent hover:text-white">
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}
