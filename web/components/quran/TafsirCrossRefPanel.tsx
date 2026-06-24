/**
 * S9-27: Tafsir cross-reference display panel.
 *
 * Shown on /quran/[surah]/[ayah] pages.
 * Displays classical tafsir book chapters that reference this ayah,
 * sourced from `iw_cross_refs` (source_type=quran_ayah, target_type=book_chapter,
 * ref_type=commentary).
 *
 * Pure display component — data fetched server-side and passed as props.
 */

import { Link } from "@/lib/compat/next-shims";
import type { TafsirRef } from '@/lib/cross-refs/quran-hadith'

interface TafsirCrossRefPanelProps {
  refs: TafsirRef[]
  ayahLabel: string
}

export function TafsirCrossRefPanel({ refs, ayahLabel }: TafsirCrossRefPanelProps) {
  if (refs.length === 0) return null

  return (
    <aside
      aria-label="Tafsir commentary"
      className="mt-6 rounded-2xl border border-iw-border bg-iw-surface p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-iw-accent/80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="text-sm font-semibold text-iw-text">
          Tafsir Commentary{' '}
          <span className="text-iw-text-muted">({refs.length})</span>
        </h2>
      </div>

      <p className="mb-4 text-xs text-iw-text-muted">
        Classical commentary on Quran {ayahLabel}
      </p>

      <div className="space-y-2">
        {refs.map((ref) => (
          <Link
            key={ref.id}
            href={`/books/${ref.book_slug}/${ref.chapter_number}`}
            className="group flex items-center justify-between rounded-xl border border-iw-border/60 bg-iw-bg px-4 py-3 transition-colors hover:border-iw-accent/40 hover:bg-iw-surface"
          >
            <div>
              <p className="text-sm font-medium text-iw-text group-hover:text-white">
                {ref.book_title}
              </p>
              {ref.excerpt && (
                <p className="mt-0.5 line-clamp-1 text-xs text-iw-text-muted">
                  {ref.excerpt}
                </p>
              )}
            </div>
            <svg
              className="ml-3 h-3.5 w-3.5 flex-shrink-0 text-iw-text-muted group-hover:text-iw-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </aside>
  )
}
