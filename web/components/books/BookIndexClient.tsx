'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BookIndexEntry } from '@/lib/data/books'

interface BookIndexClientProps {
  slug: string
  entries: BookIndexEntry[]
}

export function BookIndexClient({ slug, entries }: BookIndexClientProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? entries.filter((e) =>
        e.term.toLowerCase().includes(query.toLowerCase())
      )
    : entries

  // Group by first letter
  const grouped = filtered.reduce<Record<string, BookIndexEntry[]>>((acc, entry) => {
    const letter = entry.term[0]?.toUpperCase() ?? '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(entry)
    return acc
  }, {})

  const letters = Object.keys(grouped).sort()

  return (
    <div>
      <input
        type="search"
        placeholder="Filter terms…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-8 w-full max-w-sm rounded-lg border border-iw-border bg-iw-surface px-4 py-2 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent focus:outline-none"
      />

      {filtered.length === 0 ? (
        <p className="text-sm italic text-iw-text-muted">No matching terms.</p>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <section key={letter}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-iw-text-muted">
                {letter}
              </h2>
              <div className="space-y-2">
                {grouped[letter].map((entry) => (
                  <div key={entry.term} className="flex items-baseline gap-4">
                    <span className="min-w-[200px] text-sm text-iw-text">{entry.term}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.chapters.map((ch) => (
                        <Link
                          key={ch}
                          href={`/books/${slug}/${ch}`}
                          className="rounded bg-iw-surface px-2 py-0.5 text-xs text-iw-accent hover:bg-iw-accent/10"
                        >
                          Ch. {ch}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
