import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAyahsByPage } from '@/lib/data/quran'
import { MushafPageView } from '@/components/quran/MushafPageView'

interface Props {
  params: Promise<{ page: string }>
}

export async function generateStaticParams() {
  return Array.from({ length: 604 }, (_, i) => ({ page: String(i + 1) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: pageParam } = await params
  const page = parseInt(pageParam, 10)
  if (isNaN(page) || page < 1 || page > 604) return {}
  return {
    title: `Page ${page} — Quran`,
    description: `Read Mushaf page ${page} of the Quran with Arabic text, transliteration, and translation.`,
  }
}

export default async function QuranPageRoute({ params }: Props) {
  const { page: pageParam } = await params
  const pageNumber = parseInt(pageParam, 10)

  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) notFound()

  const groups = getAyahsByPage(pageNumber)
  if (!groups.length) notFound()

  const prevPage = pageNumber > 1 ? pageNumber - 1 : null
  const nextPage = pageNumber < 604 ? pageNumber + 1 : null

  const firstGroup = groups[0]
  const lastGroup = groups[groups.length - 1]

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">Page {pageNumber}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-sm text-iw-accent">Page {pageNumber} of 604</p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {firstGroup.surah.name_en}
          {lastGroup.surah.number !== firstGroup.surah.number && ` — ${lastGroup.surah.name_en}`}
        </h1>
        <p className="mt-1 text-sm text-iw-text-secondary">
          {groups.reduce((s, g) => s + g.ayahs.length, 0)} verses
        </p>
      </div>

      {/* Prev/Next navigation */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
        {prevPage ? (
          <Link
            href={`/quran/page/${prevPage}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Page {prevPage}
          </Link>
        ) : <div />}
        {nextPage ? (
          <Link
            href={`/quran/page/${nextPage}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            Page {nextPage}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>

      {/* Page content with mode toggle */}
      <MushafPageView pageNumber={pageNumber} groups={groups} />

      {/* Bottom navigation */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-iw-border pt-6">
        {prevPage ? (
          <Link
            href={`/quran/page/${prevPage}`}
            className="flex items-center gap-2 text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div>
              <div className="text-xs text-iw-text-muted">Previous</div>
              <div className="font-medium">Page {prevPage}</div>
            </div>
          </Link>
        ) : <div />}
        <Link href="/quran" className="text-xs text-iw-text-muted transition-colors hover:text-iw-accent">
          All Surahs
        </Link>
        {nextPage ? (
          <Link
            href={`/quran/page/${nextPage}`}
            className="flex items-center gap-2 text-right text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <div>
              <div className="text-xs text-iw-text-muted">Next</div>
              <div className="font-medium">Page {nextPage}</div>
            </div>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
