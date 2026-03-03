'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'

interface BookItem {
  id: number
  slug: string
  title_en: string
  title_ar: string
  author_name_en: string
  year_written_ce?: number
  subject: string
  available_languages: string[]
}

const subjects = [
  { label: 'All', value: 'all' },
  { label: 'Hadith', value: 'hadith' },
  { label: 'Fiqh', value: 'fiqh' },
  { label: 'Tafsir', value: 'tafsir' },
  { label: 'Aqeedah', value: 'aqeedah' },
  { label: 'Seerah', value: 'seerah' },
  { label: 'History', value: 'history' },
  { label: 'Usul al-Fiqh', value: 'usul_fiqh' },
  { label: 'Arabic Language', value: 'arabic_language' },
  { label: 'Biography', value: 'biography' },
  { label: 'Tasawwuf', value: 'tasawwuf' },
  { label: 'Ethics', value: 'ethics' },
]

export function BooksGrid({ books }: { books: BookItem[] }) {
  return (
    <PaginatedGrid<BookItem>
      items={books}
      pageSize={24}
      searchPlaceholder="Search books by title or author..."
      filterFn={(book, query) =>
        book.title_en.toLowerCase().includes(query) ||
        book.title_ar?.includes(query) ||
        book.author_name_en.toLowerCase().includes(query)
      }
      tabs={subjects}
      tabFilterFn={(book, tab) => tab === 'all' || book.subject === tab}
      renderItem={(book) => (
        <Link
          href={`/books/${book.slug}`}
          className="card group block h-full"
        >
          <h2 className="font-semibold text-iw-text group-hover:text-white">
            {book.title_en}
          </h2>
          {book.title_ar && (
            <p className="arabic-text mt-1 text-sm text-white/70">{book.title_ar}</p>
          )}
          <p className="mt-2 text-xs text-iw-text-secondary">
            By{' '}
            <span className="text-iw-accent">{book.author_name_en}</span>
            {book.year_written_ce && ` \u00B7 ${book.year_written_ce} CE`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="badge bg-iw-accent/10 text-iw-accent capitalize">
              {book.subject.replace(/_/g, ' ')}
            </span>
          </div>
        </Link>
      )}
      emptyMessage="No books found matching your search."
    />
  )
}
