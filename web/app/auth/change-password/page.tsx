'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/auth'

export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, undefined)

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Change Your Password
          </h1>
          <p className="mt-2 text-sm text-iw-text-secondary">
            Please update your password to continue.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="current_password"
              className="mb-1 block text-sm font-medium text-iw-text-secondary"
            >
              Current Password
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              required
              className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="new_password"
              className="mb-1 block text-sm font-medium text-iw-text-secondary"
            >
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="confirm_password"
              className="mb-1 block text-sm font-medium text-iw-text-secondary"
            >
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-3 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
            />
          </div>
          <button
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
