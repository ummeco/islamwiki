'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  type: string
  title: string
  snippet: string
  url: string
  meta?: string
}

interface GroupedResult {
  type: string
  label: string
  results: SearchResult[]
  total: number
}

interface SearchResponse {
  groups: GroupedResult[]
  total: number
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const qLower = query.toLowerCase()
  const idx = lower.indexOf(qLower)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-iw-accent/20 text-iw-accent">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchInput({
  placeholder = 'Search...',
  autoFocus = false,
  onNavigate,
}: {
  placeholder?: string
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [rateLimited, setRateLimited] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Flatten all results for keyboard navigation
  const flatResults = results?.groups.flatMap((g) => g.results) || []

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      setIsOpen(false)
      setRateLimited(false)
      return
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`)
      if (res.status === 429) {
        setRateLimited(true)
        setIsOpen(true)
        return
      }
      setRateLimited(false)
      const data: SearchResponse = await res.json()
      setResults(data)
      setIsOpen(data.total > 0)
      setActiveIdx(-1)
    } catch {
      setResults(null)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(value), 200)
  }

  const navigateTo = (url: string) => {
    setIsOpen(false)
    setQuery('')
    onNavigate?.()
    router.push(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && flatResults[activeIdx]) {
        navigateTo(flatResults[activeIdx].url)
      } else if (query.trim()) {
        navigateTo(`/search?q=${encodeURIComponent(query)}`)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((prev) => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  let flatIdx = 0

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-iw-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && results.total > 0) setIsOpen(true) }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-iw-border bg-iw-surface py-3 pr-4 pl-11 text-sm text-white placeholder-iw-text-muted outline-none transition-colors focus:border-iw-accent/50 focus:ring-1 focus:ring-iw-accent/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults(null); setIsOpen(false); inputRef.current?.focus() }}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-iw-text-muted transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Rate limit message */}
      {rateLimited && (
        <div className="absolute top-full right-0 left-0 z-50 mt-0 rounded-b-xl border border-t-0 border-iw-border bg-[#0a1f10] px-4 py-3 shadow-2xl">
          <p className="text-sm text-amber-400">Search limit reached. Please wait a moment before searching again.</p>
        </div>
      )}

      {/* Dropdown preview */}
      {!rateLimited && isOpen && results && results.groups.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-0 min-h-[50vh] max-h-[70vh] overflow-y-auto rounded-b-xl border border-t-0 border-iw-border bg-[#0a1f10] shadow-2xl">
          {results.groups.map((group) => (
            <div key={group.type}>
              {/* Group header */}
              <div className="sticky top-0 z-10 border-b border-iw-border/50 bg-[#0a1f10]/95 px-4 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] font-bold tracking-wider text-iw-accent uppercase">
                  {group.label}
                </span>
                {group.total > group.results.length && (
                  <span className="ml-2 text-[10px] text-iw-text-muted">
                    {group.total} results
                  </span>
                )}
              </div>

              {/* Results */}
              {group.results.map((result) => {
                const thisIdx = flatIdx++
                const isActive = thisIdx === activeIdx
                return (
                  <Link
                    key={result.url}
                    href={result.url}
                    onClick={() => { setIsOpen(false); setQuery(''); onNavigate?.() }}
                    className={`block border-b border-iw-border/30 px-4 py-2.5 transition-colors ${
                      isActive ? 'bg-iw-accent/10' : 'hover:bg-iw-surface/80'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      {result.meta && (
                        <span className="shrink-0 text-[10px] text-iw-text-muted">{result.meta}</span>
                      )}
                      <span className="text-sm font-medium text-white">
                        {highlightMatch(result.title, query)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-iw-text-muted">
                      {highlightMatch(result.snippet, query)}
                    </p>
                  </Link>
                )
              })}

              {/* "More" link */}
              {group.total > group.results.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=${group.type}`}
                  onClick={() => { setIsOpen(false); setQuery(''); onNavigate?.() }}
                  className="block px-4 py-2 text-xs text-iw-accent transition-colors hover:text-iw-accent-light"
                >
                  ...{group.total - group.results.length} more {group.label.toLowerCase()} results
                </Link>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="border-t border-iw-border/50 px-4 py-2 text-center">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => { setIsOpen(false); setQuery(''); onNavigate?.() }}
              className="text-xs font-medium text-iw-accent transition-colors hover:text-iw-accent/80"
            >
              View all {results.total} results
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
