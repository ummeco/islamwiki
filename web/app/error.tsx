'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-20">
      <h1 className="mb-4 text-3xl font-bold text-white">Something went wrong</h1>
      <p className="mb-8 max-w-md text-center text-iw-text-secondary">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-iw-accent px-6 py-2.5 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-lg border border-iw-border px-6 py-2.5 text-sm font-semibold text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:text-white"
        >
          Home
        </a>
      </div>
    </div>
  )
}
