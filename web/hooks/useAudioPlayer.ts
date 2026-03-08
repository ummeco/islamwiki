'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

export type ReciterKey =
  | 'Alafasy_128kbps'
  | 'Abdurrahmaan_As-Sudais_192kbps'
  | 'Saood_ash-Shuraym_128kbps'
  | 'Abu_Bakr_Ash-Shaatree_128kbps'
  | 'Abdul_Basit_Murattal_192kbps'
  | 'Husary_128kbps'
  | 'Muhammad_Ayyoub_128kbps'
  | 'Minshawy_Murattal_128kbps'
  | 'Ghamadi_40kbps'

// All confirmed working on everyayah.com (verified via HTTP 200 checks)
export const RECITERS: Record<ReciterKey, string> = {
  Alafasy_128kbps: 'Mishary Rashid Alafasy',
  'Abdurrahmaan_As-Sudais_192kbps': 'Abd al-Rahman al-Sudais',
  'Saood_ash-Shuraym_128kbps': 'Saud al-Shuraim',
  'Abu_Bakr_Ash-Shaatree_128kbps': 'Abu Bakr al-Shatri',
  Abdul_Basit_Murattal_192kbps: 'Abdul Basit (Murattal)',
  Husary_128kbps: 'Mahmoud Khalil al-Husary',
  Muhammad_Ayyoub_128kbps: 'Muhammad Ayyoub',
  Minshawy_Murattal_128kbps: 'Mohamed Siddiq al-Minshawi',
  Ghamadi_40kbps: "Sa'd al-Ghamdi",
}

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface UseAudioPlayerOptions {
  surahNumber: number
  totalAyahs: number
  onAyahChange?: (ayahNumber: number) => void
}

function buildUrl(surah: number, ayah: number, reciter: ReciterKey): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`
}

export function useAudioPlayer({ surahNumber, totalAyahs, onAyahChange }: UseAudioPlayerOptions) {
  // ── Double-buffer: two audio elements alternate ──────────────────────────────
  // While audio[active] plays verse N, audio[inactive] preloads verse N+1.
  // On 'ended', flip instantly to the already-buffered element — zero gap.
  const audiosRef = useRef<[HTMLAudioElement, HTMLAudioElement] | null>(null)
  const activeIdxRef = useRef<0 | 1>(0)

  // ── Stable refs for mount-time handlers (no stale closures) ─────────────────
  const ayahRef = useRef(1)
  const completedRef = useRef(0)  // # of verses fully finished before the current one
  const totalRef = useRef(totalAyahs)
  const surahRef = useRef(surahNumber)
  const reciterRef = useRef<ReciterKey>('Alafasy_128kbps')
  const speedRef = useRef(1)
  const onAyahChangeRef = useRef(onAyahChange)
  const loadAyahRef = useRef<(ayah: number) => void>(() => {})

  useEffect(() => { totalRef.current = totalAyahs }, [totalAyahs])
  useEffect(() => { surahRef.current = surahNumber }, [surahNumber])
  useEffect(() => { onAyahChangeRef.current = onAyahChange }, [onAyahChange])

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [state, setState] = useState<AudioState>('idle')
  const [currentAyah, setCurrentAyah] = useState(1)
  const [reciter, setReciterState] = useState<ReciterKey>('Alafasy_128kbps')
  const [speed, setSpeedState] = useState(1)
  // Progress 0–1 across the WHOLE SURAH, updated at 60fps via rAF — silky smooth
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // ── Create audio elements + rAF loop on mount ────────────────────────────────
  useEffect(() => {
    const els: [HTMLAudioElement, HTMLAudioElement] = [new Audio(), new Audio()]
    audiosRef.current = els

    // ── rAF loop: polls currentTime at ~60fps for smooth progress ─────────────
    // Uses refs so it never reads stale closure values.
    let rafId = 0

    function startRaf() {
      if (rafId) return  // already running
      const tick = () => {
        const el = els[activeIdxRef.current]
        if (el.duration) {
          const frac = el.currentTime / el.duration
          setProgress((completedRef.current + frac) / totalRef.current)
        }
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    function stopRaf() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function inactiveIdx(): 0 | 1 {
      return activeIdxRef.current === 0 ? 1 : 0
    }

    function preloadNext(ayah: number) {
      const next = ayah + 1
      if (next > totalRef.current) return
      const el = els[inactiveIdx()]
      const url = buildUrl(surahRef.current, next, reciterRef.current)
      if (el.src !== url) { el.src = url; el.load() }
    }

    // ── Auto-advance to next verse (gapless using double-buffer) ──────────────
    function advance() {
      const next = ayahRef.current + 1
      if (next > totalRef.current) {
        stopRaf()
        setState('idle')
        ayahRef.current = 1
        completedRef.current = 0
        setCurrentAyah(1)
        setProgress(0)
        return
      }

      completedRef.current += 1
      const nextIdx = inactiveIdx()
      const nextEl = els[nextIdx]
      const url = buildUrl(surahRef.current, next, reciterRef.current)

      ayahRef.current = next
      setCurrentAyah(next)
      onAyahChangeRef.current?.(next)

      const doSwap = () => {
        els[activeIdxRef.current].pause()
        activeIdxRef.current = nextIdx
        nextEl.playbackRate = speedRef.current
        nextEl.play().catch(() => {
          stopRaf()
          setState('error')
          setError('Audio unavailable. Check your connection or try another reciter.')
        })
        // rAF continues through swap — no need to restart, it reads from activeIdxRef
        preloadNext(next)
      }

      if (nextEl.src === url && nextEl.readyState >= 3) {
        doSwap()
      } else {
        stopRaf()
        setState('loading')
        if (nextEl.src !== url) { nextEl.src = url; nextEl.load() }
        nextEl.addEventListener('canplay', doSwap, { once: true })
      }
    }

    // ── Load and play a specific ayah (user-initiated) ────────────────────────
    function loadAyah(ayah: number) {
      stopRaf()
      els[0].pause()
      els[1].pause()

      completedRef.current = Math.max(0, ayah - 1)
      ayahRef.current = ayah
      setCurrentAyah(ayah)
      setError(null)
      setProgress(completedRef.current / totalRef.current)
      onAyahChangeRef.current?.(ayah)
      setState('loading')

      const el = els[activeIdxRef.current]
      const url = buildUrl(surahRef.current, ayah, reciterRef.current)
      el.src = url
      el.playbackRate = speedRef.current
      el.load()
      el.play().catch(() => {
        setState('error')
        setError('Failed to start audio. Try another reciter or check your connection.')
      })

      preloadNext(ayah)
    }

    loadAyahRef.current = loadAyah

    // ── Wire events on both elements ─────────────────────────────────────────
    function setupEl(el: HTMLAudioElement, idx: 0 | 1) {
      el.addEventListener('playing', () => {
        if (activeIdxRef.current === idx) {
          setState('playing')
          startRaf()
        }
      })
      el.addEventListener('ended', () => {
        if (activeIdxRef.current === idx) advance()
      })
      el.addEventListener('error', () => {
        if (activeIdxRef.current !== idx) return
        stopRaf()
        setState('error')
        setError('Audio unavailable. Check your connection or try another reciter.')
      })
      el.addEventListener('waiting', () => {
        if (activeIdxRef.current === idx) {
          stopRaf()
          setState('loading')
        }
      })
    }

    setupEl(els[0], 0)
    setupEl(els[1], 1)

    return () => {
      stopRaf()
      els[0].pause()
      els[1].pause()
    }
  }, []) // Empty deps — intentional: all mutable state lives in refs

  // ── Public API ───────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (state === 'idle') {
      loadAyahRef.current(ayahRef.current)
    } else {
      audiosRef.current?.[activeIdxRef.current]?.play().catch(() => {})
    }
  }, [state])

  const pause = useCallback(() => {
    audiosRef.current?.[activeIdxRef.current]?.pause()
    setState('paused')
  }, [])

  const stop = useCallback(() => {
    audiosRef.current?.[0]?.pause()
    audiosRef.current?.[1]?.pause()
    setState('idle')
    ayahRef.current = 1
    completedRef.current = 0
    setCurrentAyah(1)
    setProgress(0)
  }, [])

  const playAyah = useCallback((ayah: number) => {
    loadAyahRef.current(ayah)
  }, [])

  const retry = useCallback(() => {
    loadAyahRef.current(ayahRef.current)
  }, [])

  const changeReciter = useCallback((r: ReciterKey) => {
    reciterRef.current = r
    setReciterState(r)
    const els = audiosRef.current
    if (els) {
      const inactive: 0 | 1 = activeIdxRef.current === 0 ? 1 : 0
      els[inactive].src = ''
    }
    if (state === 'playing' || state === 'loading') {
      loadAyahRef.current(ayahRef.current)
    }
  }, [state])

  const changeSpeed = useCallback((s: number) => {
    speedRef.current = s
    setSpeedState(s)
    const els = audiosRef.current
    if (els) els[activeIdxRef.current].playbackRate = s
  }, [])

  return {
    state, currentAyah, reciter, speed, progress, error,
    play, pause, stop, playAyah, retry, changeReciter, changeSpeed,
  }
}
