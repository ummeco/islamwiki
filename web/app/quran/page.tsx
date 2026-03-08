import type { Metadata } from 'next'
import Link from 'next/link'
import { getSurahs } from '@/lib/data/quran'
import { QuranGrid } from '@/components/listings/quran-grid'

export const metadata: Metadata = {
  title: 'Quran',
  description:
    'Read the Holy Quran with Arabic text, translations, and tafsir. All 114 surahs with verse-by-verse commentary from Ibn Kathir, al-Jalalayn, and more.',
}

export default function QuranIndexPage() {
  const surahs = getSurahs()

  return (
    <div className="section-container py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">The Holy Quran</h1>
          <p className="mt-2 text-iw-text-secondary">
            114 surahs, 6,236 verses. Arabic text with translations and tafsir commentary.
          </p>
        </div>
        <Link
          href="/quran/1"
          className="inline-flex items-center gap-2 rounded-xl border border-iw-accent/40 bg-iw-accent/10 px-5 py-2.5 text-sm font-semibold text-iw-accent transition-colors hover:bg-iw-accent/20"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
          Read from Al-Fatiha
        </Link>
      </div>

      {/* Quick links row */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/quran/page/1"
          className="inline-flex items-center gap-1.5 rounded-lg border border-iw-border px-3 py-1.5 text-xs text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
        >
          Mushaf Pages
        </Link>
        <Link
          href="/quran/bookmarks"
          className="inline-flex items-center gap-1.5 rounded-lg border border-iw-border px-3 py-1.5 text-xs text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
        >
          My Bookmarks
        </Link>
        <Link
          href="/quran/stats"
          className="inline-flex items-center gap-1.5 rounded-lg border border-iw-border px-3 py-1.5 text-xs text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
        >
          Statistics
        </Link>
      </div>

      {/* Juz quick links */}
      <div className="mb-8 rounded-xl border border-iw-border bg-iw-surface p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
          Read by Juz (Para)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <Link
              key={juz}
              href={`/quran/juz/${juz}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-iw-border text-[12px] font-medium text-iw-text-secondary transition-colors hover:border-iw-accent/50 hover:text-iw-accent"
            >
              {juz}
            </Link>
          ))}
        </div>
      </div>

      <QuranGrid surahs={surahs} />
    </div>
  )
}
