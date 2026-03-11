'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined)

  if (state?.sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-iw-accent/10 text-iw-accent">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">Check your inbox</h1>
          <p className="mb-6 text-sm text-iw-text-muted">
            If that email is registered, we sent a password reset link. Check your spam folder too.
          </p>
          <Link href="/account" className="text-sm text-iw-accent transition-colors hover:text-iw-accent-light">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-iw-text-secondary">
            Enter your email and we&rsquo;ll send you a reset link.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            autoFocus
            autoComplete="email"
            className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light disabled:opacity-50"
          >
            {pending ? 'Sending...' : 'Send Reset Link'}
          </button>
          <p className="text-center">
            <Link href="/account" className="text-sm text-iw-text-muted transition-colors hover:text-iw-text-secondary">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
