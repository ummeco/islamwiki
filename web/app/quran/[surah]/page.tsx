import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSurahBySlug, getSurahByNumber, getSurahs, getAyahsBySurah } from '@/lib/data/quran'
import { SurahViewer } from '@/components/quran/SurahViewer'
import { getLocale } from '@/lib/i18n/get-locale'
import { SurahIntroButton } from '@/components/quran/SurahIntroButton'
import { surahTitle, surahTranslit } from '@/lib/quran-utils'
import { QuranChapterJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ surah: string }>
}

export const dynamicParams = true

// Pre-generate all surahs by number at build time
export async function generateStaticParams() {
  return getSurahs().map((s) => ({ surah: String(s.number) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah: surahParam } = await params
  const asNum = parseInt(surahParam, 10)
  const surah = !isNaN(asNum) && String(asNum) === surahParam
    ? getSurahByNumber(asNum)
    : getSurahBySlug(surahParam)
  if (!surah) return {}
  const t = surahTitle(surah.name_transliteration, surah.name_en)
  return {
    title: `${t} — Quran`,
    description: `Read ${t} — ${surah.verses_count} verses. Arabic text with English translation, transliteration, and tafsir.`,
    alternates: { languages: getHreflangAlternates(`/quran/${asNum}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: t, section: 'Quran', arabic: surah.name_ar, subtitle: `${surah.verses_count} verses · ${surah.revelation_type}` }) }],
    },
  }
}

export default async function SurahPage({ params }: Props) {
  const { surah: surahParam } = await params

  const asNum = parseInt(surahParam, 10)

  // Slug URLs → redirect to numeric canonical: /quran/al-baqarah → /quran/2
  if (isNaN(asNum) || String(asNum) !== surahParam) {
    const s = getSurahBySlug(surahParam)
    if (s) redirect(`/quran/${s.number}`)
    notFound()
  }

  const surah = getSurahByNumber(asNum)
  if (!surah) notFound()

  const [ayahs, locale] = await Promise.all([
    Promise.resolve(getAyahsBySurah(surah.number)),
    getLocale(),
  ])
  const prevSurah = surah.number > 1 ? getSurahByNumber(surah.number - 1) : null
  const nextSurah = surah.number < 114 ? getSurahByNumber(surah.number + 1) : null

  return (
    <div className="section-container py-12">
      <QuranChapterJsonLd
        surahNumber={surah.number}
        nameEn={surahTranslit(surah.name_transliteration)}
        nameAr={surah.name_ar}
        versesCount={surah.verses_count}
        revelationType={surah.revelation_type}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Quran', url: '/quran' },
        { name: `Surah ${surahTranslit(surah.name_transliteration)}`, url: `/quran/${surah.number}` },
      ]} />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">Quran</Link>
        <span className="mx-2 text-iw-border">/</span>
        <span className="text-iw-text">Surat {surahTranslit(surah.name_transliteration)}</span>
      </nav>

      {/* Surah header */}
      <div className="mb-8 text-center">
        {/* Prev / Counter / Next — one row */}
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

        {/* Title */}
        <h1 className="text-3xl font-bold text-white">
          {surahTitle(surah.name_transliteration, surah.name_en)}
        </h1>

        {/* Surah Intro button — below title */}
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

      {/* Verses + audio (client component) — bismillah handled internally */}
      <SurahViewer
        surahNumber={surah.number}
        surahName={surah.name_en}
        surahNameAr={surah.name_ar}
        totalAyahs={surah.verses_count}
        ayahs={ayahs}
        locale={locale}
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
