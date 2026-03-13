'use client'
import { useEffect, useRef, useState } from 'react'
import { renderContent } from '@/lib/render-content'

interface TafsirModalProps {
  surahNumber: number
  surahName: string
  from: number
  to: number
  onClose: () => void
}

export function TafsirModal({ surahNumber, surahName, from, to, onClose }: TafsirModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const label = from === to ? `${surahNumber}:${from}` : `${surahNumber}:${from}–${to}`

  useEffect(() => {
    abortRef.current = new AbortController()
    setContent('')
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const res = await fetch(
          `/api/tafsir?surah=${surahNumber}&from=${from}&to=${to}`,
          { signal: abortRef.current?.signal }
        )
        if (res.status === 429) {
          setError('You have reached the tafsir limit (10 per 15 minutes). Please try again shortly.')
          setLoading(false)
          return
        }
        if (res.status === 503) {
          setError('Tafsir service is not configured. Add ANTHROPIC_API_KEY to .env.local.')
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        setLoading(false)
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) setContent((prev) => prev + decoder.decode(value))
        }
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') {
          setError('Unable to load tafsir. Please try again.')
          setLoading(false)
        }
      }
    }

    run()
    return () => abortRef.current?.abort()
  }, [surahNumber, from, to])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-iw-border bg-iw-bg shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-iw-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">{surahName} {label}</h2>
            <p className="text-[12px] text-iw-text-muted">Scholarly Commentary (Tafsir) · Up to 10 per 15 minutes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tafsir"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-iw-border text-iw-text-muted transition-colors hover:border-iw-text-muted hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading && !content && (
            <div className="flex items-center gap-3 text-iw-text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-iw-border border-t-iw-accent" />
              <span className="text-sm">Loading scholarly commentary…</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {content && (
            <div className="space-y-4 text-[14px] leading-[1.85] text-iw-text-secondary">
              {loading
                ? content.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                : renderContent(content)}
              {loading && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-iw-accent" />
              )}
            </div>
          )}
        </div>

        {/* Footer — links to full tafsir sources */}
        <div className="flex-shrink-0 border-t border-iw-border px-5 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-iw-text-muted">
            Read full tafsir
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Ibn Kathir', href: `https://quranx.com/tafsir/IbnKathir/${surahNumber}.${from}` },
              { name: 'Al-Tabari', href: `https://quranx.com/tafsir/Tabari/${surahNumber}.${from}` },
              { name: 'Al-Qurtubi', href: `https://quranx.com/tafsir/Qurtubi/${surahNumber}.${from}` },
              { name: 'Al-Baghawi', href: `https://quranx.com/tafsir/Baghawi/${surahNumber}.${from}` },
            ].map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-iw-border px-3 py-1 text-[11px] text-iw-text-muted transition-colors hover:border-iw-accent/50 hover:text-iw-accent"
              >
                {name} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
