'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

export type ReciterKey = 'Alafasy_128kbps' | 'Abdul_Basit_Murattal_192kbps' | 'Husary_128kbps'

export const RECITERS: Record<ReciterKey, string> = {
  Alafasy_128kbps: 'Mishary Rashid Alafasy',
  Abdul_Basit_Murattal_192kbps: 'Abdul Basit Abdul Samad',
  Husary_128kbps: 'Mahmoud Khalil al-Husary',
}

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface UseAudioPlayerOptions {
  surahNumber: number
  totalAyahs: number
  onAyahChange?: (ayahNumber: number) => void
}

export function useAudioPlayer({ surahNumber, totalAyahs, onAyahChange }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioState>('idle')
  const [currentAyah, setCurrentAyah] = useState(1)
  const [reciter, setReciter] = useState<ReciterKey>('Alafasy_128kbps')
  const [speed, setSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function getAudioUrl(ayah: number) {
    const s = String(surahNumber).padStart(3, '0')
    const a = String(ayah).padStart(3, '0')
    return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`
  }

  const loadAyah = useCallback((ayah: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    audio.pause()
    setState('loading')
    setError(null)
    setProgress(0)
    setCurrentAyah(ayah)
    onAyahChange?.(ayah)
    audio.src = getAudioUrl(ayah)
    audio.playbackRate = speed
    audio.load()
    audio.play().catch(() => {
      setState('error')
      setError('Failed to load audio. Please try again.')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber, reciter, speed, onAyahChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlaying = () => setState('playing')
    const onPause = () => setState((s) => s !== 'idle' ? 'paused' : 'idle')
    const onEnded = () => {
      if (currentAyah < totalAyahs) {
        loadAyah(currentAyah + 1)
      } else {
        setState('idle')
        setCurrentAyah(1)
      }
    }
    const onError = () => {
      setState('error')
      setError('Audio unavailable. Check your connection or try another reciter.')
    }
    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    }
    const onWaiting = () => setState('loading')
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('waiting', onWaiting)
    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('waiting', onWaiting)
    }
  }, [currentAyah, totalAyahs, loadAyah])

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  const play = useCallback(() => {
    if (state === 'idle') {
      loadAyah(1)
    } else {
      audioRef.current?.play()
    }
  }, [state, loadAyah])

  const pause = useCallback(() => audioRef.current?.pause(), [])

  const playAyah = useCallback((ayah: number) => loadAyah(ayah), [loadAyah])

  const retry = useCallback(() => loadAyah(currentAyah), [loadAyah, currentAyah])

  const changeReciter = useCallback((r: ReciterKey) => {
    setReciter(r)
    if (state !== 'idle' && audioRef.current) {
      const wasPlaying = state === 'playing'
      setState('idle')
      audioRef.current.pause()
      if (wasPlaying) {
        setTimeout(() => loadAyah(currentAyah), 0)
      }
    }
  }, [state, currentAyah, loadAyah])

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }, [])

  return {
    state, currentAyah, reciter, speed, progress, error,
    play, pause, playAyah, retry, changeReciter, changeSpeed,
  }
}
