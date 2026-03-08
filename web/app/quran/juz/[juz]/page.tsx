import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getJuzAyahs } from '@/lib/data/quran'
import { SurahViewer } from '@/components/quran/SurahViewer'
import { surahTranslit } from '@/lib/quran-utils'

interface Props {
  params: Promise<{ juz: string }>
}

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ juz: String(i + 1) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { juz: juzParam } = await params
  const juz = parseInt(juzParam, 10)
  if (isNaN(juz) || juz < 1 || juz > 30) return {}
  return {
    title: `Juz ${juz} — Quran`,
    description: `Read Juz ${juz} of the Quran with Arabic text, translation, and tafsir.`,
  }
}

export default async function JuzPage({ params }: Props) {
  const { juz: juzParam } = await params
  const juz = parseInt(juzParam, 10)

  if (isNaN(juz) || juz < 1 || juz > 30) notFound()

  const groups = getJuzAyahs(juz)
  if (!groups.length) notFound()

  const prevJuz = juz > 1 ? juz - 1 : null
  const nextJuz = juz < 30 ? juz + 1 : null

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">Juz {juz}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm text-iw-accent">Juz {juz} of 30</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Juz {juz}</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          {groups[0].surah.name_en}
          {groups.length > 1 && ` — ${groups[groups.length - 1].surah.name_en}`}
          {' · '}
          {groups.reduce((sum, g) => sum + g.ayahs.length, 0)} verses
        </p>
      </div>

      {/* Prev/Next juz navigation */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
        {prevJuz ? (
          <Link
            href={`/quran/juz/${prevJuz}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Juz {prevJuz}
          </Link>
        ) : <div />}
        {nextJuz ? (
          <Link
            href={`/quran/juz/${nextJuz}`}
            className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
          >
            Juz {nextJuz}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>

      {/* Surahs in this juz — each renders as its own SurahViewer section */}
      <div className="space-y-12">
        {groups.map(({ surah, ayahs }) => {
          const isFullSurah = ayahs.length === surah.verses_count
          const from = ayahs[0].number_in_surah
          const to = ayahs[ayahs.length - 1].number_in_surah
          const rangeLabel = isFullSurah ? null : `${from}–${to}`

          return (
            <div key={surah.number}>
              {/* Surah header within juz */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-iw-border" />
                <div className="text-center">
                  <Link href={`/quran/${surah.number}`} className="group">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-iw-accent">
                      Surah {surah.number}
                    </span>
                    <h2 className="text-xl font-bold text-white group-hover:text-iw-accent transition-colors">
                      Surat {surahTranslit(surah.name_transliteration)} ({surah.name_en})
                    </h2>
                    <p className="arabic-text text-lg text-iw-text-secondary">{surah.name_ar}</p>
                    {rangeLabel && (
                      <p className="text-[11px] text-iw-text-muted">Verses {rangeLabel}</p>
                    )}
                  </Link>
                </div>
                <div className="h-px flex-1 bg-iw-border" />
              </div>

              {/* Bismillah — shown for all except Al-Fatiha (1) and Al-Tawbah (9), and only at surah start */}
              {surah.number !== 1 && surah.number !== 9 && from === 1 && (
                <p className="arabic-text mb-6 text-center text-2xl text-iw-text-secondary">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              )}

              <SurahViewer
                surahNumber={surah.number}
                surahName={surah.name_en}
                totalAyahs={surah.verses_count}
                ayahs={ayahs}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom navigation */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-iw-border pt-6">
        {prevJuz ? (
          <Link
            href={`/quran/juz/${prevJuz}`}
            className="flex items-center gap-2 text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div>
              <div className="text-xs text-iw-text-muted">Previous</div>
              <div className="font-medium">Juz {prevJuz}</div>
            </div>
          </Link>
        ) : <div />}
        <Link href="/quran" className="text-xs text-iw-text-muted transition-colors hover:text-iw-accent">
          All Surahs
        </Link>
        {nextJuz ? (
          <Link
            href={`/quran/juz/${nextJuz}`}
            className="flex items-center gap-2 text-right text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <div>
              <div className="text-xs text-iw-text-muted">Next</div>
              <div className="font-medium">Juz {nextJuz}</div>
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
