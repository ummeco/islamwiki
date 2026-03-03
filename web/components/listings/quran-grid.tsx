'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

interface SurahItem {
  number: number
  name_ar: string
  name_en: string
  name_transliteration: string
  slug: string
  revelation_type: 'meccan' | 'medinan'
  verses_count: number
}

export function QuranGrid({ surahs }: { surahs: SurahItem[] }) {
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = surahs
    if (filter !== 'all') {
      result = result.filter((s) => s.revelation_type === filter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name_en.toLowerCase().includes(q) ||
          s.name_transliteration.toLowerCase().includes(q) ||
          s.name_ar.includes(q) ||
          s.number.toString() === q
      )
    }
    return result
  }, [surahs, filter, search])

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iw-text-muted"
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surahs by name or number..."
            className="w-full rounded-lg border border-iw-border bg-iw-surface py-2 pl-10 pr-4 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5">
          {(['all', 'meccan', 'medinan'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-iw-accent/15 text-iw-accent'
                  : 'text-iw-text-secondary hover:bg-iw-surface hover:text-iw-text'
              }`}
            >
              {type === 'all' ? 'All' : type === 'meccan' ? 'Meccan' : 'Medinan'}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-iw-text-muted">
        {filtered.length} of 114 surahs
      </p>

      {/* Surahs grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((surah) => (
          <Link
            key={surah.number}
            href={`/quran/${surah.slug}`}
            className="card flex items-center gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iw-accent/10 text-sm font-bold text-iw-accent">
              {surah.number}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="truncate font-semibold text-iw-text">
                  {surah.name_en}
                </h2>
                <span className="arabic-text shrink-0 text-lg text-white">
                  {surah.name_ar}
                </span>
              </div>
              <p className="text-xs text-iw-text-secondary">
                {surah.name_transliteration} \u00B7 {surah.verses_count} verses \u00B7{' '}
                {surah.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
