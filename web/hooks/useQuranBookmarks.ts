'use client'

import { useCallback, useSyncExternalStore } from 'react'

export interface QuranBookmark {
  surahNumber: number
  ayahNumber: number
  surahNameEn: string
  surahNameAr: string
  savedAt: number
}

const KEY = 'iw_quran_bookmarks'
const MAX = 500

// Listeners registered by all hook instances
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  // Also sync on storage events from other tabs
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

function readStorage(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as QuranBookmark[]) : []
  } catch {
    return []
  }
}

function writeStorage(next: QuranBookmark[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* quota */ }
  notify()
}

const serverSnapshot: QuranBookmark[] = []

export function useQuranBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, readStorage, () => serverSnapshot)

  // mounted = we are on the client (useSyncExternalStore uses getServerSnapshot on server)
  const mounted = typeof window !== 'undefined'

  const addBookmark = useCallback((bm: Omit<QuranBookmark, 'savedAt'>) => {
    const current = readStorage()
    const exists = current.some(
      (b) => b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber,
    )
    if (exists) return
    writeStorage([{ ...bm, savedAt: Date.now() }, ...current].slice(0, MAX))
  }, [])

  const removeBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
    const current = readStorage()
    writeStorage(current.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber),
    ))
  }, [])

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber),
    [bookmarks],
  )

  const clearAll = useCallback(() => {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
    notify()
  }, [])

  return { bookmarks, mounted, addBookmark, removeBookmark, isBookmarked, clearAll }
}
