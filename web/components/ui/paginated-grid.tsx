'use client'

import { useState, useMemo } from 'react'

interface PaginatedGridProps<T> {
  items: T[]
  pageSize?: number
  renderItem: (item: T) => React.ReactNode
  filterFn?: (item: T, query: string) => boolean
  searchPlaceholder?: string
  gridCols?: string
  emptyMessage?: string
  tabs?: { label: string; value: string }[]
  tabFilterFn?: (item: T, tabValue: string) => boolean
}

export function PaginatedGrid<T>({
  items,
  pageSize = 24,
  renderItem,
  filterFn,
  searchPlaceholder = 'Search...',
  gridCols = 'sm:grid-cols-2 lg:grid-cols-3',
  emptyMessage = 'No items found.',
  tabs,
  tabFilterFn,
}: PaginatedGridProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value ?? '')

  const filtered = useMemo(() => {
    let result = items
    if (search && filterFn) {
      result = result.filter((item) => filterFn(item, search.toLowerCase()))
    }
    if (activeTab && activeTab !== 'all' && tabFilterFn) {
      result = result.filter((item) => tabFilterFn(item, activeTab))
    }
    return result
  }, [items, search, filterFn, activeTab, tabFilterFn])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Reset to page 1 when search or tab changes
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleTab = (val: string) => {
    setActiveTab(val)
    setPage(1)
  }

  return (
    <div>
      {/* Search + Tabs row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {filterFn && (
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
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-iw-border bg-iw-surface py-2 pl-10 pr-4 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
            />
          </div>
        )}

        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTab(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-iw-accent/15 text-iw-accent'
                    : 'text-iw-text-secondary hover:bg-iw-surface hover:text-iw-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="mb-4 text-xs text-iw-text-muted">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {search && ` for "${search}"`}
        {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
      </p>

      {/* Grid */}
      {paged.length > 0 ? (
        <div className={`grid gap-4 ${gridCols}`}>
          {paged.map((item, i) => (
            <div key={i}>{renderItem(item)}</div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-iw-border bg-iw-surface p-8 text-center">
          <p className="text-sm text-iw-text-secondary">{emptyMessage}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-iw-border px-3 py-1.5 text-xs text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>

          {generatePageNumbers(page, totalPages).map((num, i) =>
            num === -1 ? (
              <span key={`ellipsis-${i}`} className="px-2 text-xs text-iw-text-muted">
                ...
              </span>
            ) : (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                  page === num
                    ? 'bg-iw-accent/15 text-iw-accent'
                    : 'text-iw-text-secondary hover:bg-iw-surface hover:text-iw-text'
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-iw-border px-3 py-1.5 text-xs text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: number[] = [1]

  if (current > 3) pages.push(-1) // ellipsis

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push(-1) // ellipsis

  pages.push(total)
  return pages
}
