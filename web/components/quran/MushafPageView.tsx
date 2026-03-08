'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AyahData, SurahData } from '@/lib/data/quran'
import { normalizeArabic, toArabicIndic, surahTranslit } from '@/lib/quran-utils'

interface PageGroup {
  surah: SurahData
  ayahs: AyahData[]
}

interface MushafPageViewProps {
  pageNumber: number
  groups: PageGroup[]
}

export function MushafPageView({ pageNumber, groups }: MushafPageViewProps) {
  const [mode, setMode] = useState<'mushaf' | 'study'>('mushaf')

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setMode('mushaf')}
          aria-pressed={mode === 'mushaf'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'mushaf' ? 'bg-iw-accent/20 text-iw-accent' : 'text-iw-text-secondary hover:text-iw-text'}`}
        >
          Mushaf
        </button>
        <button
          onClick={() => setMode('study')}
          aria-pressed={mode === 'study'}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'study' ? 'bg-iw-accent/20 text-iw-accent' : 'text-iw-text-secondary hover:text-iw-text'}`}
        >
          Study
        </button>
      </div>

      {mode === 'mushaf' ? (
        <MushafMode groups={groups} pageNumber={pageNumber} />
      ) : (
        <StudyMode groups={groups} />
      )}
    </div>
  )
}

function MushafMode({ groups, pageNumber }: { groups: PageGroup[]; pageNumber: number }) {
  return (
    <div className="rounded-xl border border-iw-border bg-iw-surface p-6 sm:p-10">
      <div dir="rtl" className="space-y-6">
        {groups.map(({ surah, ayahs }) => {
          const isFirstAyah = ayahs[0]?.number_in_surah === 1
          return (
            <div key={surah.number}>
              {/* Surah ornamental banner — shown only when the first ayah of a surah is on this page */}
              {isFirstAyah && (
                <div className="mb-4 rounded-lg border border-iw-accent/30 bg-iw-accent/5 py-3 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-iw-accent">
                    Surah {surah.number}
                  </div>
                  <div className="quran-text mt-1 text-2xl text-white">{surah.name_ar}</div>
                  <div className="mt-0.5 text-xs text-iw-text-muted">
                    {surahTranslit(surah.name_transliteration)} · {surah.name_en} · {surah.verses_count} verses
                  </div>
                </div>
              )}

              {/* Bismillah — all surahs except Al-Fatiha (1) and Al-Tawbah (9), only at surah start */}
              {isFirstAyah && surah.number !== 1 && surah.number !== 9 && (
                <p className="quran-text mb-4 text-center text-2xl text-iw-text-secondary">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              )}

              {/* Continuous RTL flow — ayahs inline with ayah-end markers */}
              <p className="quran-text text-justify text-[1.6rem] leading-[3rem] text-white" style={{ fontFeatureSettings: '"liga" 1, "calt" 1' }}>
                {ayahs.map((ayah) => (
                  <span key={ayah.number_in_surah}>
                    <Link
                      href={`/quran/${surah.number}#ayah-${ayah.number_in_surah}`}
                      className="transition-colors hover:text-iw-accent"
                    >
                      {normalizeArabic(ayah.text_ar)}
                    </Link>
                    {' '}
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-iw-accent/30 text-[0.65rem] text-iw-accent"
                      title={`Verse ${ayah.number_in_surah}`}
                    >
                      {toArabicIndic(ayah.number_in_surah)}
                    </span>
                    {' '}
                  </span>
                ))}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-center text-xs text-iw-text-muted">Page {pageNumber}</div>
    </div>
  )
}

function StudyMode({ groups }: { groups: PageGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map(({ surah, ayahs }) => {
        const isFirstAyah = ayahs[0]?.number_in_surah === 1
        return (
          <div key={surah.number}>
            {/* Surah header */}
            {isFirstAyah && (
              <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-5 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-iw-accent">
                  Surah {surah.number}
                </div>
                <div className="quran-text mt-1 text-3xl text-white">{surah.name_ar}</div>
                <div className="mt-1 text-sm text-iw-text-secondary">
                  {surahTranslit(surah.name_transliteration)} · {surah.name_en}
                </div>

                {/* Bismillah */}
                {surah.number !== 1 && surah.number !== 9 && (
                  <p className="quran-text mt-4 text-xl text-iw-text-secondary">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                )}
              </div>
            )}

            {/* Per-ayah blocks */}
            <div className="space-y-4">
              {ayahs.map((ayah) => (
                <div
                  key={ayah.number_in_surah}
                  id={`ayah-${ayah.number_in_surah}`}
                  className="rounded-xl border border-iw-border bg-iw-surface p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-iw-accent/30 text-xs font-semibold text-iw-accent">
                      {ayah.number_in_surah}
                    </div>
                    <div className="flex-1 text-right">
                      <p
                        dir="rtl"
                        className="quran-text text-right text-2xl leading-[2.5rem] text-white"
                      >
                        {normalizeArabic(ayah.text_ar)}
                      </p>
                      {ayah.transliteration && (
                        <p className="mt-2 text-right text-[13px] italic text-iw-text-muted">
                          {ayah.transliteration}
                        </p>
                      )}
                      {ayah.translations['sahih-int'] && (
                        <p className="mt-2 text-right text-sm text-iw-text-secondary">
                          {ayah.translations['sahih-int']}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-iw-border/50 pt-3 text-xs text-iw-text-muted">
                    <span>Juz {ayah.juz} · Hizb {ayah.hizb}</span>
                    <Link
                      href={`/quran/${surah.number}#ayah-${ayah.number_in_surah}`}
                      className="text-iw-accent hover:underline"
                    >
                      {surahTranslit(surah.name_transliteration)} {ayah.number_in_surah} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
