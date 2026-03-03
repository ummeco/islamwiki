import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSurahBySlug, getSurahByNumber, getSurahs, getAyahsBySurah } from '@/lib/data/quran'
import { SurahViewer } from '@/components/quran/SurahViewer'

interface Props {
  params: Promise<{ surah: string }>
}

export async function generateStaticParams() {
  return getSurahs().map((s) => ({ surah: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah: slug } = await params
  const surah = getSurahBySlug(slug)
  if (!surah) return {}
  return {
    title: `Surah ${surah.name_en} (${surah.name_transliteration})`,
    description: `Read Surah ${surah.name_en} (${surah.name_ar}) — ${surah.verses_count} verses. Arabic text with English translation and tafsir.`,
  }
}

export default async function SurahPage({ params }: Props) {
  const { surah: slug } = await params
  const surah = getSurahBySlug(slug)
  if (!surah) notFound()

  const ayahs = getAyahsBySurah(surah.number)
  const prevSurah = surah.number > 1 ? getSurahByNumber(surah.number - 1) : null
  const nextSurah = surah.number < 114 ? getSurahByNumber(surah.number + 1) : null

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">{surah.name_en}</span>
      </nav>

      {/* Surah header */}
      <div className="mb-8 text-center">
        <p className="text-sm text-iw-accent">Surah {surah.number} of 114</p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          {surah.name_en}
        </h1>
        <p className="arabic-text mt-2 text-3xl text-white">
          {surah.name_ar}
        </p>
        <p className="mt-2 text-sm text-iw-text-secondary">
          {surah.name_transliteration} · {surah.verses_count} verses ·{' '}
          {surah.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'}
        </p>
      </div>

      {/* Prev/Next navigation */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah.slug}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevSurah.name_en}
          </Link>
        ) : (
          <div />
        )}
        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah.slug}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            {nextSurah.name_en}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <p className="arabic-text mb-8 text-center text-2xl text-iw-text-secondary">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {/* Verses + audio player (client component) */}
      <SurahViewer
        surahNumber={surah.number}
        surahName={surah.name_en}
        surahSlug={slug}
        totalAyahs={surah.verses_count}
        ayahs={ayahs}
      />

      {/* Bottom navigation */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-iw-border pt-6">
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah.slug}`}
            className="flex items-center gap-2 text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div>
              <div className="text-xs text-iw-text-muted">Previous</div>
              <div className="font-medium">{prevSurah.name_en}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        <Link
          href="/quran"
          className="text-xs text-iw-text-muted transition-colors hover:text-iw-accent"
        >
          All Surahs
        </Link>
        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah.slug}`}
            className="flex items-center gap-2 text-right text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <div>
              <div className="text-xs text-iw-text-muted">Next</div>
              <div className="font-medium">{nextSurah.name_en}</div>
            </div>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
