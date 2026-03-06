'use client'
import { useState } from 'react'

export interface ReadingPrefs {
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  readingMode: 'light' | 'sepia' | 'dark'
  defaultTranslation: string
  madhab: 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'all'
}

const DEFAULT_PREFS: ReadingPrefs = {
  fontSize: 'md',
  readingMode: 'dark',
  defaultTranslation: 'khattab',
  madhab: 'all',
}

const STORAGE_KEY = 'iw_reading_prefs'

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<ReadingPrefs>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFS
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) }
    } catch {}
    return DEFAULT_PREFS
  })

  const updatePrefs = (updates: Partial<ReadingPrefs>) => {
    const newPrefs = { ...prefs, ...updates }
    setPrefs(newPrefs)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs)) } catch {}
  }

  return { prefs, updatePrefs }
}

interface ReadingPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

export function ReadingPreferences({ isOpen, onClose }: ReadingPreferencesProps) {
  const { prefs, updatePrefs } = useReadingPrefs()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Reading preferences"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-2xl border border-iw-border bg-iw-bg p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Reading Preferences</h2>
          <button onClick={onClose} aria-label="Close preferences" className="text-iw-text-muted hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* Font size */}
          <div>
            <label className="mb-2 block text-sm font-medium text-iw-text-secondary">Arabic Font Size</label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updatePrefs({ fontSize: size })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    prefs.fontSize === size
                      ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted'
                  }`}
                >
                  {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : size === 'lg' ? 'Large' : 'X-Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Default translation */}
          <div>
            <label className="mb-2 block text-sm font-medium text-iw-text-secondary">Default Translation</label>
            <select
              value={prefs.defaultTranslation}
              onChange={(e) => updatePrefs({ defaultTranslation: e.target.value })}
              className="w-full rounded-lg border border-iw-border bg-iw-surface px-3 py-2 text-sm text-white"
            >
              <option value="khattab">Dr. Mustafa Khattab (The Clear Quran)</option>
              <option value="sahih_international">Sahih International</option>
              <option value="haleem">Abdul Haleem (Oxford)</option>
              <option value="pickthall">Pickthall</option>
              <option value="yusuf_ali">Yusuf Ali</option>
              <option value="iwt">IWT — Islam.wiki Translation</option>
            </select>
          </div>

          {/* Madhab preference */}
          <div>
            <label className="mb-2 block text-sm font-medium text-iw-text-secondary">Madhab Preference</label>
            <p className="mb-2 text-xs text-iw-text-muted">Affects display order of fiqh opinions in hadith pages</p>
            <select
              value={prefs.madhab}
              onChange={(e) => updatePrefs({ madhab: e.target.value as ReadingPrefs['madhab'] })}
              className="w-full rounded-lg border border-iw-border bg-iw-surface px-3 py-2 text-sm text-white"
            >
              <option value="all">Show all madhabs equally</option>
              <option value="hanafi">Hanafi</option>
              <option value="maliki">Maliki</option>
              <option value="shafii">Shafi&apos;i</option>
              <option value="hanbali">Hanbali</option>
            </select>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-iw-accent py-2.5 text-sm font-semibold text-iw-bg"
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
}
