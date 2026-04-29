/**
 * S9-15: Related Hadith Panel
 *
 * Sidebar component shown on /quran/[surah]/[ayah] pages.
 * Displays hadith that reference this ayah from the `quran_hadith_refs`
 * cross-ref table (populated by S9-26 seeder).
 *
 * Data is fetched server-side via the hasura admin client and passed in
 * as props — this is a pure display component (no client state needed).
 */

import Link from 'next/link'

export interface RelatedHadithRef {
  id: string
  collection_slug: string
  collection_name: string
  book_slug: string
  number: number
  text_en_snippet: string | null
  grade?: string | null
}

interface RelatedHadithPanelProps {
  refs: RelatedHadithRef[]
  /** "2:43" label for the heading */
  ayahLabel: string
}

function gradeColor(grade: string | null | undefined): string {
  if (!grade) return 'text-gray-400'
  const g = grade.toLowerCase()
  if (g.includes('sahih')) return 'text-green-400'
  if (g.includes('hasan')) return 'text-yellow-400'
  if (g.includes('daif') || g.includes("da'if")) return 'text-red-400'
  return 'text-gray-400'
}

export function RelatedHadithPanel({ refs, ayahLabel }: RelatedHadithPanelProps) {
  if (refs.length === 0) return null

  return (
    <aside
      aria-label="Related hadith"
      className="mt-10 rounded-2xl border border-iw-border bg-iw-surface p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-iw-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h2 className="text-sm font-semibold text-iw-text">
          Related Hadith{' '}
          <span className="text-iw-text-muted">({refs.length})</span>
        </h2>
      </div>

      <p className="mb-4 text-xs text-iw-text-muted">
        Hadith that reference or explain Quran {ayahLabel}
      </p>

      <div className="space-y-3">
        {refs.map((ref) => (
          <Link
            key={ref.id}
            href={`/hadith/${ref.collection_slug}/${ref.book_slug}/${ref.number}`}
            className="group block rounded-xl border border-iw-border/60 bg-iw-bg p-4 transition-colors hover:border-iw-accent/40 hover:bg-iw-surface"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-iw-accent group-hover:underline">
                {ref.collection_name} #{ref.number}
              </span>
              {ref.grade && (
                <span className={`text-[10px] font-medium ${gradeColor(ref.grade)}`}>
                  {ref.grade}
                </span>
              )}
            </div>
            {ref.text_en_snippet && (
              <p className="line-clamp-2 text-[13px] leading-relaxed text-iw-text-secondary">
                {ref.text_en_snippet}
              </p>
            )}
          </Link>
        ))}
      </div>
    </aside>
  )
}
