import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSurahBySlug, getSurahByNumber, getSurahs, getAyahsBySurah } from '@/lib/data/quran'
import { SurahViewer } from '@/components/quran/SurahViewer'
import { SurahIntroButton } from '@/components/quran/SurahIntroButton'
import { surahTitle, surahTranslit } from '@/lib/quran-utils'

interface Props {
  params: Promise<{ surah: string; ayah: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  return getSurahs().flatMap((s) =>
    Array.from({ length: Math.min(s.verses_count, 10) }, (_, i) => ({
      surah: String(s.number),
      ayah: String(i + 1),
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah: surahParam, ayah: ayahParam } = await params
  const asNum = parseInt(surahParam, 10)
  const surah = !isNaN(asNum) && String(asNum) === surahParam
    ? getSurahByNumber(asNum)
    : getSurahBySlug(surahParam)
  if (!surah) return {}
  const isRange = ayahParam.includes('-')
  const label = isRange ? `Verses ${ayahParam}` : `Verse ${ayahParam}`
  return {
    title: `${surahTitle(surah.name_transliteration, surah.name_en)} ${label} — Quran`,
    description: `Surah ${surahTitle(surah.name_transliteration, surah.name_en)}, ${label}. Arabic text with English translation and tafsir.`,
  }
}

export default async function AyahPage({ params }: Props) {
  const { surah: surahParam, ayah: ayahParam } = await params

  const asNum = parseInt(surahParam, 10)

  // Slug URLs → redirect to numeric canonical
  if (isNaN(asNum) || String(asNum) !== surahParam) {
    const s = getSurahBySlug(surahParam)
    if (s) redirect(`/quran/${s.number}/${ayahParam}`)
    notFound()
  }

  const surah = getSurahByNumber(asNum)
  if (!surah) notFound()

  // Parse single verse or range: "5" or "5-10"
  const rangeMatch = ayahParam.match(/^(\d+)(?:-(\d+))?$/)
  if (!rangeMatch) notFound()

  const focusFrom = parseInt(rangeMatch[1], 10)
  const focusTo = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : focusFrom

  if (
    focusFrom < 1 ||
    focusTo < focusFrom ||
    focusFrom > surah.verses_count ||
    focusTo > surah.verses_count
  ) notFound()

  const ayahs = getAyahsBySurah(surah.number)
  const prevSurah = surah.number > 1 ? getSurahByNumber(surah.number - 1) : null
  const nextSurah = surah.number < 114 ? getSurahByNumber(surah.number + 1) : null

  // Renders identical to the surah page — the verse number is just an anchor/focus hint
  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <Link href={`/quran/${surah.number}`} className="hover:text-iw-text">
          Surat {surahTranslit(surah.name_transliteration)}
        </Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">
          {focusFrom === focusTo ? `Verse ${focusFrom}` : `Verses ${focusFrom}–${focusTo}`}
        </span>
      </nav>

      {/* Surah header — same as the surah page */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex max-w-2xl items-center justify-between px-2">
          {prevSurah ? (
            <Link
              href={`/quran/${prevSurah.number}`}
              className="flex items-center gap-2 rounded-lg border border-iw-border px-3 py-1.5 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-iw-accent"
            >
              ← Surat {surahTranslit(prevSurah.name_transliteration)}
            </Link>
          ) : <div />}
          <p className="text-sm font-medium text-iw-accent">Surah {surah.number} of 114</p>
          {nextSurah ? (
            <Link
              href={`/quran/${nextSurah.number}`}
              className="flex items-center gap-2 rounded-lg border border-iw-border px-3 py-1.5 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-iw-accent"
            >
              Surat {surahTranslit(nextSurah.name_transliteration)} →
            </Link>
          ) : <div />}
        </div>

        <h1 className="text-3xl font-bold text-white">
          {surahTitle(surah.name_transliteration, surah.name_en)}
        </h1>

        <div className="mt-4 flex justify-center">
          <SurahIntroButton
            surahNumber={surah.number}
            surahName={surah.name_en}
            surahNameAr={surah.name_ar}
            surahTranslitName={surah.name_transliteration}
            verseCount={surah.verses_count}
            revelationType={surah.revelation_type}
            juzStart={surah.juz_start}
            pageStart={surah.page_start}
            wordCount={surah.word_count}
            description={surah.description_en}
          />
        </div>
      </div>

      {/* Verses + audio — with focus on the target verse */}
      <SurahViewer
        surahNumber={surah.number}
        surahName={surah.name_en}
        surahNameAr={surah.name_ar}
        totalAyahs={surah.verses_count}
        ayahs={ayahs}
        focusFrom={focusFrom}
        focusTo={focusTo}
      />

      {/* Bottom navigation */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-iw-border pt-6">
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah.number}`}
            className="flex items-center gap-2 text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <span>←</span>
            <div>
              <div className="text-xs text-iw-text-muted">Previous</div>
              <div className="font-medium">Surat {surahTranslit(prevSurah.name_transliteration)}</div>
            </div>
          </Link>
        ) : <div />}
        <Link href="/quran" className="text-xs text-iw-text-muted transition-colors hover:text-iw-accent">
          All Surahs
        </Link>
        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah.number}`}
            className="flex items-center gap-2 text-right text-sm text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <div>
              <div className="text-xs text-iw-text-muted">Next</div>
              <div className="font-medium">Surat {surahTranslit(nextSurah.name_transliteration)}</div>
            </div>
            <span>→</span>
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
