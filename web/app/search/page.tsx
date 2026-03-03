import Link from 'next/link'
import { searchGrouped, type GroupedResults } from '@/lib/search'
import { SearchInput } from '@/components/search/search-input'

const TYPE_ICONS: Record<string, string> = {
  quran: '/quran',
  hadith: '/hadith',
  seerah: '/seerah',
  person: '/people',
  book: '/books',
  article: '/articles',
  video: '/videos',
  audio: '/audio',
  wiki: '/wiki',
  sect: '/sects',
}

function highlightText(text: string, query: string) {
  if (!query) return [{ text, highlight: false }]
  const lower = text.toLowerCase()
  const qLower = query.toLowerCase()
  const parts: { text: string; highlight: boolean }[] = []
  let lastIndex = 0
  let idx = lower.indexOf(qLower)
  while (idx !== -1) {
    if (idx > lastIndex) parts.push({ text: text.slice(lastIndex, idx), highlight: false })
    parts.push({ text: text.slice(idx, idx + query.length), highlight: true })
    lastIndex = idx + query.length
    idx = lower.indexOf(qLower, lastIndex)
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), highlight: false })
  if (parts.length === 0) parts.push({ text, highlight: false })
  return parts
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const typeFilter = params.type || ''

  let data: GroupedResults = { groups: [], total: 0 }
  if (query) {
    data = searchGrouped(query, 0)
    if (typeFilter) {
      data = {
        groups: data.groups.filter((g) => g.type === typeFilter),
        total: data.groups.filter((g) => g.type === typeFilter).reduce((sum, g) => sum + g.total, 0),
      }
    }
  }

  return (
    <div className="py-8">
      <div className="section-container">
        {/* Search bar */}
        <div className="mx-auto max-w-2xl">
          <SearchInput
            placeholder="Search Quran, Hadith, scholars, topics..."
            autoFocus
          />
        </div>

        {/* Results for server-rendered query */}
        {query && (
          <div className="mt-8">
            <div className="mb-6 flex items-baseline gap-3">
              <h1 className="text-lg font-semibold text-white">
                {data.total} result{data.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
              </h1>
              {typeFilter && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="text-xs text-iw-accent hover:underline"
                >
                  Clear filter
                </Link>
              )}
            </div>

            {!typeFilter && data.groups.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {data.groups.map((group) => (
                  <Link
                    key={group.type}
                    href={`/search?q=${encodeURIComponent(query)}&type=${group.type}`}
                    className="rounded-full border border-iw-border px-3 py-1 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-white"
                  >
                    {group.label} ({group.total})
                  </Link>
                ))}
              </div>
            )}

            <div className="space-y-8">
              {data.groups.map((group) => (
                <section key={group.type}>
                  <div className="mb-3 flex items-center gap-3">
                    <Link
                      href={TYPE_ICONS[group.type] || '#'}
                      className="text-xs font-bold tracking-wider text-iw-accent uppercase"
                    >
                      {group.label}
                    </Link>
                    <span className="text-xs text-iw-text-muted">{group.total} result{group.total !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-1">
                    {group.results.map((result) => {
                      const titleParts = highlightText(result.title, query)
                      const snippetParts = highlightText(result.snippet, query)
                      return (
                        <Link
                          key={result.url}
                          href={result.url}
                          className="block rounded-lg border border-iw-border/50 bg-iw-surface/40 px-4 py-3 transition-colors hover:border-iw-accent/30 hover:bg-iw-surface/80"
                        >
                          <div className="flex items-baseline gap-2">
                            {result.meta && (
                              <span className="shrink-0 text-[10px] text-iw-text-muted">{result.meta}</span>
                            )}
                            <span className="text-sm font-medium text-white">
                              {titleParts.map((p, i) =>
                                p.highlight ? (
                                  <mark key={i} className="rounded-sm bg-iw-accent/20 text-iw-accent">{p.text}</mark>
                                ) : (
                                  <span key={i}>{p.text}</span>
                                )
                              )}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-iw-text-muted">
                            {snippetParts.map((p, i) =>
                              p.highlight ? (
                                <mark key={i} className="rounded-sm bg-iw-accent/20 text-iw-accent">{p.text}</mark>
                              ) : (
                                <span key={i}>{p.text}</span>
                              )
                            )}
                          </p>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            {data.total === 0 && (
              <div className="py-16 text-center">
                <p className="text-iw-text-muted">No results found for &ldquo;{query}&rdquo;</p>
                <p className="mt-2 text-xs text-iw-text-muted">Try different keywords or check the spelling</p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="py-16 text-center">
            <p className="text-iw-text-muted">Type to search across Quran, Hadith, scholars, books, and more</p>
          </div>
        )}
      </div>
    </div>
  )
}
