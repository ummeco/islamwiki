'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'

export function BookmarksClient() {
  const { bookmarks, mounted, clearAll } = useQuranBookmarks()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">Bookmarks</span>
      </nav>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
          <p className="mt-2 text-sm text-iw-text-secondary">
            Saved verses stored locally in your browser.
          </p>
        </div>

        {mounted && bookmarks.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-iw-text-secondary">Clear all?</span>
                <button
                  onClick={() => { clearAll(); setConfirmClear(false) }}
                  className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-text-muted"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {!mounted && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-iw-border bg-iw-surface" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {mounted && bookmarks.length === 0 && (
        <div className="rounded-xl border border-iw-border bg-iw-surface py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-iw-border">
            <svg className="h-6 w-6 text-iw-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">No bookmarks yet</h2>
          <p className="mt-2 text-sm text-iw-text-secondary">
            Bookmark any verse while reading to save it here.
          </p>
          <Link
            href="/quran"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-iw-accent/40 bg-iw-accent/10 px-5 py-2.5 text-sm font-semibold text-iw-accent transition-colors hover:bg-iw-accent/20"
          >
            Browse the Quran
          </Link>
        </div>
      )}

      {/* Bookmark list */}
      {mounted && bookmarks.length > 0 && (
        <>
          <p className="mb-4 text-xs text-iw-text-muted">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
            {bookmarks.length >= 500 && ' · 500-bookmark limit reached'}
          </p>
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <Link
                key={`${bm.surahNumber}:${bm.ayahNumber}`}
                href={`/quran/${bm.surahNumber}#ayah-${bm.ayahNumber}`}
                className="flex items-center justify-between rounded-xl border border-iw-border bg-iw-surface px-5 py-4 transition-colors hover:border-iw-text-muted"
              >
                <div>
                  <div className="font-medium text-white">
                    {bm.surahNameEn} · Verse {bm.ayahNumber}
                  </div>
                  <div className="mt-0.5 text-xs text-iw-text-muted">
                    Surah {bm.surahNumber}
                    {bm.savedAt ? ` · Saved ${new Date(bm.savedAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <span className="arabic-text text-xl text-iw-text-secondary">{bm.surahNameAr}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
