'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface ArticleItem {
  id: number
  slug: string
  title: string
  excerpt?: string
  category: string
  tags: string[]
}

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Worship', value: 'Worship' },
  { label: 'Theology', value: 'Theology' },
  { label: 'Jurisprudence', value: 'Jurisprudence' },
  { label: 'History', value: 'History' },
  { label: 'Ethics', value: 'Ethics' },
  { label: 'Family', value: 'Family' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Science', value: 'Science' },
  { label: 'Interfaith', value: 'Interfaith' },
]

export function ArticlesGrid({ articles }: { articles: ArticleItem[] }) {
  return (
    <PaginatedGrid<ArticleItem>
      items={articles}
      pageSize={24}
      searchPlaceholder="Search articles..."
      filterFn={(article, query) =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt?.toLowerCase().includes(query) ?? false) ||
        article.tags.some((t) => t.toLowerCase().includes(query))
      }
      tabs={categories}
      tabFilterFn={(article, tab) =>
        tab === 'all' || article.category.toLowerCase() === tab.toLowerCase()
      }
      renderItem={(article) => (
        <Link
          href={`/articles/${article.slug}`}
          className="card group block h-full"
        >
          <span className="badge bg-iw-accent/10 text-iw-accent mb-2">{article.category}</span>
          <h2 className="font-semibold text-iw-text group-hover:text-white">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-iw-text-secondary">{article.excerpt}</p>
          )}
        </Link>
      )}
      emptyMessage="No articles found matching your search."
    />
  )
}
