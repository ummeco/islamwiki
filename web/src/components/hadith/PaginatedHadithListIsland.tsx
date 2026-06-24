/**
 * PaginatedHadithListIsland.tsx — Astro island port of components/hadith/PaginatedHadithList.tsx
 *
 * PURPOSE: Client-paginated list of hadith cards for a book. Ported from the Next.js
 *          'use client' component verbatim except the router glue: next/navigation
 *          (useRouter/useSearchParams) → native URLSearchParams + history.replaceState,
 *          and next/link <Link> → plain <a> (Astro client-side routing not required for
 *          static content links). All grade-coloring/labeling/rendering logic unchanged.
 * INPUTS:  hadiths[], colSlug, bookSlug
 * OUTPUTS: Paginated card grid with ?page= URL sync
 * CONSTRAINTS:
 *   - No next/* imports (Astro island).
 *   - Behavior parity with the Next component: ?page= query persists across pagination.
 * REF: ports components/hadith/PaginatedHadithList.tsx · D-P2-STACK-CANON
 */
'use client'

import { useState, useCallback } from 'react'

interface HadithItem {
  n: number
  ar?: string
  text_en?: string
  grade?: string
  chapter_en?: string
  chapter_ar?: string
}

function gradeColor(grade: string | undefined): string {
  if (!grade) return 'bg-gray-500/20 text-gray-300'
  const g = grade.toLowerCase()
  if (g.includes('sahih')) return 'bg-green-500/20 text-green-300'
  if (g.includes('hasan')) return 'bg-yellow-500/20 text-yellow-300'
  if (g.includes('daif') || g.includes("da'if")) return 'bg-red-500/20 text-red-300'
  if (g.includes('mawdu') || g.includes("mawdu'")) return 'bg-red-700/20 text-red-400'
  return 'bg-gray-500/20 text-gray-300'
}

function gradeLabel(grade: string | undefined): string {
  if (!grade) return 'Ungraded'
  const g = grade.toLowerCase()
  if (g === 'sahih') return 'Sahih'
  if (g === 'hasan') return 'Hasan'
  if (g.includes('hasan sahih')) return 'Hasan Sahih'
  if (g.includes('daif') || g.includes("da'if")) return "Da'if"
  return grade.charAt(0).toUpperCase() + grade.slice(1)
}

function gradeDescription(grade: string | undefined): string {
  if (!grade) return 'Grade: Ungraded'
  const g = grade.toLowerCase()
  if (g.includes('sahih')) return 'Grade: Sahih — authentic hadith'
  if (g.includes('hasan sahih')) return 'Grade: Hasan Sahih — good and authentic'
  if (g.includes('hasan')) return 'Grade: Hasan — good hadith'
  if (g.includes('daif') || g.includes("da'if")) return "Grade: Daʿif — weak hadith"
  return `Grade: ${grade}`
}

const PAGE_SIZE = 50

export function PaginatedHadithList({
  hadiths,
  colSlug,
  bookSlug,
}: {
  hadiths: HadithItem[]
  colSlug: string
  bookSlug: string
}) {
  const initialPage =
    typeof window !== 'undefined'
      ? Math.max(0, parseInt(new URLSearchParams(window.location.search).get('page') ?? '1', 10) - 1)
      : 0
  const [page, setPage] = useState(initialPage)
  const totalPages = Math.ceil(hadiths.length / PAGE_SIZE)

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      const params = new URLSearchParams(window.location.search)
      if (newPage === 0) {
        params.delete('page')
      } else {
        params.set('page', String(newPage + 1))
      }
      const qs = params.toString()
      window.history.replaceState(
        null,
        '',
        `/hadith/${colSlug}/${bookSlug}${qs ? `?${qs}` : ''}`
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [colSlug, bookSlug]
  )
  const slice = hadiths.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  let currentChapter = ''
  // Track the last chapter from previous pages
  if (page > 0) {
    for (let i = page * PAGE_SIZE - 1; i >= 0; i--) {
      if (hadiths[i].chapter_en) {
        currentChapter = hadiths[i].chapter_en!
        break
      }
    }
  }

  return (
    <div>
      {/* Page info */}
      {totalPages > 1 && (
        <div className="mb-4 flex items-center justify-between text-sm text-iw-text-secondary">
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, hadiths.length)} of {hadiths.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-lg border border-iw-border px-3 py-1.5 text-sm transition-colors hover:border-iw-accent/30 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-iw-text-secondary">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded-lg border border-iw-border px-3 py-1.5 text-sm transition-colors hover:border-iw-accent/30 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Hadith cards */}
      <div className="space-y-4">
        {(() => {
          // Pre-compute chapter headers before rendering to avoid mutation during .map()
          const chapterHeaders = new Map<number, string>()
          let trackedChapter = currentChapter
          for (const h of slice) {
            if (h.chapter_en && h.chapter_en !== trackedChapter) {
              chapterHeaders.set(h.n, h.chapter_en)
              trackedChapter = h.chapter_en
            }
          }
          return slice.map((h) => {
            const chapterHeader = chapterHeaders.get(h.n)

            return (
              <div key={h.n}>
                {chapterHeader && (
                  <div className="mb-2 mt-8 first:mt-0">
                    <h2 className="text-lg font-semibold text-white">{h.chapter_en}</h2>
                    {h.chapter_ar && (
                      <p className="arabic-text text-sm text-white/60" lang="ar" dir="rtl">{h.chapter_ar}</p>
                    )}
                  </div>
                )}
                <a
                  href={`/hadith/${colSlug}/${bookSlug}/${h.n}`}
                  className="block rounded-xl border border-iw-border bg-iw-surface p-6 transition-colors hover:border-iw-accent/30"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-iw-accent">
                      Hadith #{h.n}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${gradeColor(h.grade)}`}
                      title={gradeDescription(h.grade)}
                      aria-label={gradeDescription(h.grade)}
                    >
                      {gradeLabel(h.grade)}
                    </span>
                  </div>

                  {h.ar && (
                    <p className="quran-text mb-3 line-clamp-2 text-right text-base leading-loose text-white/90" lang="ar" dir="rtl">
                      {h.ar}
                    </p>
                  )}

                  {h.text_en && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-iw-text-secondary">
                      {h.text_en}
                    </p>
                  )}

                  {!h.text_en && !h.ar && (
                    <p className="text-sm italic text-iw-text-secondary/50">
                      Arabic text only
                    </p>
                  )}
                </a>
              </div>
            )
          })
        })()}
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg border border-iw-border px-4 py-2 text-sm transition-colors hover:border-iw-accent/30 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-iw-text-secondary">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="rounded-lg border border-iw-border px-4 py-2 text-sm transition-colors hover:border-iw-accent/30 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
