'use client'
import { useAudioPlayer, RECITERS, ReciterKey } from '@/hooks/useAudioPlayer'

interface AudioPlayerProps {
  surahNumber: number
  surahName: string
  totalAyahs: number
  currentHighlightedAyah?: number
  onAyahChange?: (ayah: number) => void
}

export function AudioPlayer({ surahNumber, surahName, totalAyahs, onAyahChange }: AudioPlayerProps) {
  const { state, currentAyah, reciter, speed, progress, error, play, pause, retry, changeReciter, changeSpeed } = useAudioPlayer({ surahNumber, totalAyahs, onAyahChange })

  const isActive = state !== 'idle'
  const isPlaying = state === 'playing'
  const isLoading = state === 'loading'
  const isError = state === 'error'

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-iw-border bg-iw-bg/95 backdrop-blur-sm transition-transform duration-300 ${isActive ? 'translate-y-0' : 'translate-y-full'}`}
      role="region"
      aria-label="Quran audio player"
    >
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPlaying ? `Playing ${surahName}, verse ${currentAyah}` : ''}
        {isLoading ? 'Loading audio...' : ''}
        {isError ? `Audio error: ${error}` : ''}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-iw-surface">
        <div
          className={`h-full bg-iw-accent transition-all duration-300 ${isLoading ? 'animate-pulse w-1/3' : ''}`}
          style={!isLoading ? { width: `${progress * 100}%` } : undefined}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="section-container flex items-center gap-4 py-3">
        {/* Play/Pause */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={isLoading || isError}
          aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-iw-accent text-iw-bg disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isPlaying ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          {isError ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">{error}</span>
              <button onClick={retry} className="text-xs text-iw-accent hover:underline">Retry</button>
            </div>
          ) : (
            <div>
              <p className="truncate text-sm font-medium text-white">{surahName}</p>
              <p className="text-xs text-iw-text-muted">Verse {currentAyah} of {totalAyahs}</p>
            </div>
          )}
        </div>

        {/* Speed */}
        <select
          value={speed}
          onChange={(e) => changeSpeed(Number(e.target.value))}
          aria-label="Playback speed"
          className="rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text-secondary"
        >
          <option value={0.75}>0.75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
        </select>

        {/* Reciter */}
        <select
          value={reciter}
          onChange={(e) => changeReciter(e.target.value as ReciterKey)}
          aria-label="Select reciter"
          className="hidden rounded border border-iw-border bg-iw-surface px-2 py-1 text-xs text-iw-text-secondary sm:block"
        >
          {Object.entries(RECITERS).map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>

        {/* Close / stop */}
        <button
          onClick={pause}
          aria-label="Stop audio"
          className="text-iw-text-muted hover:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
