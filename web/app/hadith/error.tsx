'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function HadithError({
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
      <h1 className="mb-3 text-2xl font-bold text-white">Failed to load Hadith content</h1>
      <p className="mb-8 max-w-sm text-center text-sm text-iw-text-secondary">
        There was a problem loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-iw-accent px-5 py-2 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light"
        >
          Try again
        </button>
        <Link
          href="/hadith"
          className="rounded-lg border border-iw-border px-5 py-2 text-sm font-semibold text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:text-white"
        >
          Back to Hadith
        </Link>
      </div>
    </div>
  )
}
