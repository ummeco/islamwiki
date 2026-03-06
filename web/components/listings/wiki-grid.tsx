'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface WikiItem {
  id: number
  slug: string
  title: string
  category?: string
}

export function WikiGrid({ pages }: { pages: WikiItem[] }) {
  const categories = Array.from(
    new Set(pages.map((p) => p.category).filter(Boolean))
  ).sort() as string[]

  const tabs = [
    { value: 'all', label: 'All' },
    ...categories.map((c) => ({
      value: c,
      label: c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
    })),
  ]

  return (
    <PaginatedGrid<WikiItem>
      items={pages}
      pageSize={30}
      searchPlaceholder="Search wiki pages..."
      emptyMessage="No wiki pages found."
      tabs={tabs}
      tabFilterFn={(item, tabKey) =>
        tabKey === 'all' || item.category === tabKey
      }
      filterFn={(item, query) => {
        const q = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q)
        )
      }}
      renderItem={(page) => (
        <Link
          key={page.id}
          href={`/wiki/${page.slug}`}
          className="card group"
        >
          <h2 className="font-semibold text-iw-text group-hover:text-white">
            {page.title}
          </h2>
          {page.category && (
            <p className="mt-1 text-xs text-iw-text-muted capitalize">
              {page.category.replace(/_/g, ' ')}
            </p>
          )}
          <span className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent group-hover:text-iw-accent-light">Read →</span>
        </Link>
      )}
    />
  )
}
