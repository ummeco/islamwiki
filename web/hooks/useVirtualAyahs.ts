'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

const AYAH_ESTIMATED_HEIGHT = 200 // px, rough estimate
const BUFFER_COUNT = 5 // render 5 extra ayahs above/below viewport

export interface VirtualItem {
  index: number
  start: number
  size: number
}

export function useVirtualAyahs(totalAyahs: number, containerRef: React.RefObject<HTMLElement | null>) {
  const [range, setRange] = useState({ start: 0, end: Math.min(20, totalAyahs) })
  const scrollHandler = useCallback(() => {
    if (!containerRef.current) return
    const scrollTop = window.scrollY
    const viewportHeight = window.innerHeight
    const containerTop = containerRef.current.getBoundingClientRect().top + scrollTop
    const relativeScroll = Math.max(0, scrollTop - containerTop)
    const startIndex = Math.max(0, Math.floor(relativeScroll / AYAH_ESTIMATED_HEIGHT) - BUFFER_COUNT)
    const visibleCount = Math.ceil(viewportHeight / AYAH_ESTIMATED_HEIGHT) + BUFFER_COUNT * 2
    const endIndex = Math.min(totalAyahs, startIndex + visibleCount)
    setRange({ start: startIndex, end: endIndex })
  }, [totalAyahs, containerRef])

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler, { passive: true })
    scrollHandler()
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [scrollHandler])

  return range
}
