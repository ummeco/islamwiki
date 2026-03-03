import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSurahBySlug, getAyah } from '@/lib/data/quran'

interface Props {
  params: Promise<{ surah: string; ayah: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah: surahSlug, ayah: ayahNum } = await params
  const surah = getSurahBySlug(surahSlug)
  if (!surah) return {}
  return {
    title: `${surah.name_en} ${ayahNum} — Verse with Tafsir`,
    description: `Surah ${surah.name_en}, Verse ${ayahNum}. Arabic text, translation, and tafsir commentary from Ibn Kathir, al-Jalalayn, and more.`,
  }
}

export default async function AyahPage({ params }: Props) {
  const { surah: surahSlug, ayah: ayahNum } = await params
  const surah = getSurahBySlug(surahSlug)
  if (!surah) notFound()

  const ayah = getAyah(surah.number, parseInt(ayahNum, 10))
  if (!ayah) notFound()

  return (
    <div className="section-container py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-iw-text-secondary">
        <Link href="/quran" className="hover:text-iw-text">
          Quran
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/quran/${surahSlug}`} className="hover:text-iw-text">
          {surah.name_en}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">Verse {ayahNum}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        {/* Verse header */}
        <div className="mb-8 text-center">
          <p className="text-sm text-iw-accent">
            {surah.name_en} ({surah.name_transliteration}) — Verse {ayahNum}
          </p>
        </div>

        {/* Arabic */}
        <div className="mb-8 rounded-xl border border-iw-border p-8 text-center">
          <p className="quran-text text-3xl">{ayah.text_ar}</p>
        </div>

        {/* Translation */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Translation
          </h2>
          <p className="text-iw-text-secondary">
            {ayah.translation_en || ''}
          </p>
        </div>

        {/* Tafsir */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Tafsir</h2>
          <div className="space-y-4">
            {['Ibn Kathir', 'Al-Jalalayn', 'As-Sa\'di'].map((tafsirName) => (
              <details
                key={tafsirName}
                className="rounded-xl border border-iw-border"
              >
                <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-iw-text hover:text-white">
                  {tafsirName}
                </summary>
                <div className="border-t border-iw-border px-6 py-4 text-sm text-iw-text-secondary">
                  Tafsir commentary for this verse is being prepared.
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-2 flex items-center justify-between border-t border-iw-border pt-6">
          {ayah.number_in_surah > 1 ? (
            <Link
              href={`/quran/${surahSlug}/${ayah.number_in_surah - 1}`}
              className="group flex flex-col items-start"
            >
              <span className="text-xs text-iw-text-muted">Previous</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">
                Verse {ayah.number_in_surah - 1}
              </span>
            </Link>
          ) : (
            <div />
          )}
          <span className="text-xs text-iw-text-muted">
            {ayah.number_in_surah} of {surah.verses_count}
          </span>
          {ayah.number_in_surah < surah.verses_count ? (
            <Link
              href={`/quran/${surahSlug}/${ayah.number_in_surah + 1}`}
              className="group flex flex-col items-end"
            >
              <span className="text-xs text-iw-text-muted">Next</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">
                Verse {ayah.number_in_surah + 1}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}
