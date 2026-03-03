'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { AudioPlayer } from './AudioPlayer'
import { AudioStartButton } from './AudioStartButton'
import { PlayAyahButton } from './PlayAyahButton'

interface Ayah {
  number_in_surah: number
  text_ar: string
  translation_en?: string
}

interface SurahViewerProps {
  surahNumber: number
  surahName: string
  surahSlug: string
  totalAyahs: number
  ayahs: Ayah[]
}

export function SurahViewer({ surahNumber, surahName, surahSlug, totalAyahs, ayahs }: SurahViewerProps) {
  const [audioActive, setAudioActive] = useState(false)
  const [currentAyah, setCurrentAyah] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleAyahChange = useCallback((ayah: number) => {
    setCurrentAyah(ayah)
    setIsPlaying(true)
    const el = document.getElementById(`v${ayah}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handlePlayAyah = useCallback((ayah: number) => {
    setAudioActive(true)
    // The AudioPlayer component will receive the initial ayah via playAyah
    // We signal intent via currentAyah state — the player picks it up on mount
    setCurrentAyah(ayah)
    setIsPlaying(true)
  }, [])

  return (
    <>
      {/* "Listen" button — shown in the header area above the verses */}
      <div className="mx-auto mb-6 max-w-3xl flex justify-center">
        {!audioActive ? (
          <AudioStartButton onClick={() => setAudioActive(true)} />
        ) : null}
      </div>

      {/* Verses */}
      <div className="mx-auto max-w-3xl space-y-6">
        {ayahs.map((ayah) => (
          <div
            key={ayah.number_in_surah}
            id={`v${ayah.number_in_surah}`}
            className="rounded-xl border border-iw-border p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-iw-accent/10 text-xs font-bold text-iw-accent">
                  {ayah.number_in_surah}
                </span>
                <PlayAyahButton
                  ayahNumber={ayah.number_in_surah}
                  isCurrentAyah={audioActive && currentAyah === ayah.number_in_surah}
                  isPlaying={isPlaying && audioActive && currentAyah === ayah.number_in_surah}
                  onPlay={handlePlayAyah}
                />
              </div>
              <Link
                href={`/quran/${surahSlug}/${ayah.number_in_surah}`}
                className="text-xs text-iw-text-muted transition-colors hover:text-iw-accent"
              >
                Tafsir
              </Link>
            </div>

            {/* Arabic text */}
            <p className="quran-text mb-4">{ayah.text_ar}</p>

            <p className="text-sm leading-relaxed text-iw-text-secondary">
              {ayah.translation_en || ''}
            </p>
          </div>
        ))}
      </div>

      {/* Sticky audio player */}
      {audioActive && (
        <AudioPlayer
          surahNumber={surahNumber}
          surahName={surahName}
          totalAyahs={totalAyahs}
          onAyahChange={handleAyahChange}
        />
      )}
    </>
  )
}
