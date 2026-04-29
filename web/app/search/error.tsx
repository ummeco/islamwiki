'use client'

/**
 * B5-03: islamwiki/web — search error state (Meilisearch down / API failure)
 * Shown by Next.js error boundary when SearchPage throws.
 */
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('[Islam.wiki] Search error:', error)
  }, [error])

  return (
    <div className="section-container py-16 text-center">
      <div className="mx-auto max-w-md">
        {/* Icon */}
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-iw-error/20"
          aria-hidden="true"
        >
          <svg
            className="h-6 w-6 text-iw-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-lg font-semibold text-white">Search unavailable</h1>
        <p className="mb-6 text-sm text-iw-text-secondary">
          The search service is temporarily unavailable. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-iw-accent px-6 py-2 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iw-accent"
        >
          Retry search
        </button>
      </div>
    </div>
  )
}
