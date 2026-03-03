'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <svg
          className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-iw-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Quran, Hadith, scholars, books, articles..."
          className="w-full rounded-xl border border-iw-border bg-iw-surface py-4 pr-4 pl-12 text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
        />
      </div>
    </form>
  )
}
