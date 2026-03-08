'use client'
import type { AudioState, ReciterKey } from '@/hooks/useAudioPlayer'
import { RECITERS } from '@/hooks/useAudioPlayer'

export type AutoScrollMode = 'section' | 'verse' | 'off'

export interface AudioPlayerProps {
  surahName: string
  totalAyahs: number
  audioState: AudioState
  currentAyah: number
  reciter: ReciterKey
  speed: number
  progress: number
  audioError: string | null
  isOpen: boolean
  autoScroll: AutoScrollMode
  tabRef: React.RefObject<HTMLButtonElement | null>
  drawerRef: React.RefObject<HTMLDivElement | null>
  onToggle: () => void
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onRetry: () => void
  onChangeReciter: (r: ReciterKey) => void
  onChangeSpeed: (s: number) => void
  onAutoScrollChange: (m: AutoScrollMode) => void
  onJumpToVerse: (n: number) => void
}

const SPEEDS = [0.75, 1, 1.25] as const

export function AudioPlayer({
  surahName, totalAyahs, audioState, currentAyah, reciter, speed, progress, audioError,
  isOpen, autoScroll, tabRef, drawerRef, onToggle, onPlay, onPause, onStop, onRetry,
  onChangeReciter, onChangeSpeed, onAutoScrollChange, onJumpToVerse,
}: AudioPlayerProps) {
  const isActive = audioState !== 'idle'
  const isPlaying = audioState === 'playing'
  const isLoading = audioState === 'loading'
  const isError = audioState === 'error'

  return (
    <>
      {/* Screen reader status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPlaying && `Playing ${surahName}, verse ${currentAyah}`}
        {isLoading && 'Loading audio...'}
        {isError && `Audio error: ${audioError}`}
      </div>
      <progress value={isLoading ? undefined : progress} max={1} aria-label="Audio playback progress" className="sr-only" />

      {/* Fixed right-edge tab */}
      <button
        ref={tabRef}
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Close audio player' : 'Open audio player'}
        className={[
          'fixed right-0 top-[196px] z-50 flex h-14 w-9 items-center justify-center',
          'rounded-l-xl border-y border-l shadow-md transition-all duration-200',
          isOpen
            ? 'border-iw-accent bg-iw-accent text-[#0D2F17]'
            : isPlaying
              ? 'animate-pulse border-iw-accent/60 bg-iw-accent/15 text-iw-accent'
              : isActive
                ? 'border-iw-accent/40 bg-iw-accent/10 text-iw-accent'
                : 'border-iw-border bg-iw-surface text-iw-text-muted hover:border-iw-accent/40 hover:text-iw-accent',
        ].join(' ')}
      >
        {isLoading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      {/* Slide-out drawer — always in DOM, transform-based */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-20 z-50 h-[calc(100vh-5rem)] w-72 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full w-full flex-col rounded-l-2xl border-y border-l border-iw-border bg-iw-bg shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-iw-border px-4 py-3">
            <span className="text-[12px] font-bold uppercase tracking-widest text-iw-text-muted">Audio Player</span>
            <button
              type="button"
              onClick={onToggle}
              className="text-iw-text-muted transition-colors hover:text-white"
              aria-label="Close audio player"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-5 p-4">
              {/* Error */}
              {isError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
                  {audioError}
                  <button type="button" onClick={onRetry} className="ml-2 underline">
                    Retry
                  </button>
                </div>
              )}

              {/* Surah + verse info */}
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{surahName}</p>
                <button
                  type="button"
                  onClick={() => { if (isActive) onJumpToVerse(currentAyah) }}
                  disabled={!isActive}
                  title={isActive ? 'Click to scroll to this verse' : undefined}
                  className={[
                    'mt-0.5 text-xs transition-colors',
                    isActive
                      ? 'cursor-pointer text-iw-accent hover:text-iw-accent/70'
                      : 'cursor-default text-iw-text-muted',
                  ].join(' ')}
                >
                  {isActive ? `Verse ${currentAyah} of ${totalAyahs}` : `${totalAyahs} verses`}
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-iw-surface">
                  <div
                    className={`h-full rounded-full bg-iw-accent ${isLoading ? 'w-1/3 animate-pulse' : ''}`}
                    style={!isLoading ? { width: `${progress * 100}%` } : undefined}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-iw-text-muted">
                  <span>Verse {isActive ? currentAyah : 0}</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={onStop}
                  disabled={!isActive}
                  aria-label="Stop playback"
                  className="text-iw-text-muted transition-colors hover:text-white disabled:opacity-30"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="1.5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={isPlaying ? onPause : onPlay}
                  disabled={isLoading}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-iw-accent text-[#0D2F17] shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : isPlaying ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  )}
                </button>

                {/* Balance the layout */}
                <div className="h-6 w-6" aria-hidden="true" />
              </div>

              {/* Auto-scroll */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
                  Auto-scroll
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {(['section', 'verse', 'off'] as AutoScrollMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onAutoScrollChange(m)}
                      className={[
                        'rounded-lg border py-1.5 text-[11px] font-medium capitalize transition-colors',
                        autoScroll === m
                          ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                          : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                      ].join(' ')}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
                  Speed
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onChangeSpeed(s)}
                      className={[
                        'rounded-lg border py-1.5 text-[11px] font-medium transition-colors',
                        speed === s
                          ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                          : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                      ].join(' ')}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Reciter */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
                  Reciter
                </p>
                <div className="space-y-0.5">
                  {Object.entries(RECITERS).map(([key, name]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChangeReciter(key as ReciterKey)}
                      className={[
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] transition-colors',
                        reciter === key
                          ? 'bg-iw-accent/10 text-iw-accent'
                          : 'text-iw-text-secondary hover:bg-iw-surface hover:text-white',
                      ].join(' ')}
                    >
                      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${reciter === key ? 'bg-iw-accent' : 'bg-iw-border'}`} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
