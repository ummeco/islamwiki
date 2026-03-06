'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { SearchInput } from './search-input'

export function SearchModal() {
  const [open, setOpen] = useState(false)
  // SSR-safe mount detection — avoids setState-in-effect antipattern
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const overlay = open ? (
    <div
      className="fixed inset-0 z-[9999] animate-fade-in bg-black/95 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* ESC hint */}
      <div className="absolute top-4 right-4">
        <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs text-white/50">
          ESC
        </kbd>
      </div>

      {/* Search panel */}
      <div className="absolute inset-x-0 top-[15vh] mx-auto w-full max-w-2xl px-4">
        <p className="mb-3 text-center text-xs font-medium tracking-widest text-white/30 uppercase">
          Islam.wiki Search
        </p>
        <SearchInput
          placeholder="Search Quran, Hadith, scholars, topics..."
          autoFocus
          onNavigate={handleClose}
        />
        <p className="mt-3 text-center text-xs text-white/25">
          Press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd> or click outside to close
        </p>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg border border-iw-border bg-iw-surface px-3 py-1.5 text-sm text-iw-text-muted transition-colors hover:border-iw-text-muted hover:text-iw-text-secondary"
        aria-label="Search"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-iw-border bg-iw-bg px-1.5 py-0.5 font-mono text-[10px] text-iw-text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Portal — renders at document.body, escapes header stacking context */}
      {mounted && createPortal(overlay, document.body)}
    </>
  )
}
