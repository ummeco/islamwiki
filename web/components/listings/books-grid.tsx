'use client'

import Link from 'next/link'
import { PaginatedGrid } from '@/components/ui/paginated-grid'
import { formatIslamicYear } from '@/lib/dates/hijri'

interface BookItem {
  id: number
  slug: string
  title_en: string
  title_ar: string
  author_name_en: string
  year_written_ah?: number
  year_written_ce?: number
  subject: string
  available_languages: string[]
  category_primary?: string | null
  canonical?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  fiqh: 'Fiqh',
  sharh: 'Sharh',
  'ethics-spirituality': 'Ethics & Spirituality',
  'hadith-sciences': 'Hadith Sciences',
  aqeedah: 'Aqeedah',
  biography: 'Biography',
  'usul-al-fiqh': 'Usul al-Fiqh',
  tafsir: 'Tafsir',
  history: 'History',
  seerah: 'Seerah',
  'quran-sciences': 'Quran Sciences',
  general: 'General',
  'arabic-language': 'Arabic Language',
  'comparative-religion': 'Comparative Religion',
}

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Fiqh', value: 'fiqh' },
  { label: 'Sharh', value: 'sharh' },
  { label: 'Ethics & Spirituality', value: 'ethics-spirituality' },
  { label: 'Hadith Sciences', value: 'hadith-sciences' },
  { label: 'Aqeedah', value: 'aqeedah' },
  { label: 'Biography', value: 'biography' },
  { label: 'Usul al-Fiqh', value: 'usul-al-fiqh' },
  { label: 'Tafsir', value: 'tafsir' },
  { label: 'History', value: 'history' },
  { label: 'Seerah', value: 'seerah' },
  { label: 'Quran Sciences', value: 'quran-sciences' },
  { label: 'Arabic Language', value: 'arabic-language' },
  { label: 'Comparative Religion', value: 'comparative-religion' },
  { label: 'General', value: 'general' },
]

export function BooksGrid({ books }: { books: BookItem[] }) {
  // Exclude non-canonical alias entries from the listing
  const canonical = books.filter((b) => b.canonical !== false)

  return (
    <PaginatedGrid<BookItem>
      items={canonical}
      pageSize={24}
      searchPlaceholder="Search books by title or author..."
      filterFn={(book, query) =>
        book.title_en.toLowerCase().includes(query) ||
        book.title_ar?.includes(query) ||
        book.author_name_en.toLowerCase().includes(query)
      }
      tabs={categories}
      tabFilterFn={(book, tab) =>
        tab === 'all' || book.category_primary === tab
      }
      renderItem={(book) => {
        const catLabel = book.category_primary
          ? (CATEGORY_LABELS[book.category_primary] ?? book.category_primary)
          : book.subject.replace(/_/g, ' ')

        return (
          <Link href={`/books/${book.slug}`} className="card group h-full">
            <h2 className="font-semibold text-iw-text group-hover:text-white">
              {book.title_en}
            </h2>
            {book.title_ar && (
              <p className="arabic-text mt-1 text-sm text-white/70">
                {book.title_ar}
              </p>
            )}
            <p className="mt-2 text-xs text-iw-text-secondary">
              By{' '}
              <span className="text-iw-accent">{book.author_name_en}</span>
              {(book.year_written_ah || book.year_written_ce) &&
                ` \u00B7 ${formatIslamicYear(book.year_written_ah, book.year_written_ce)}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="badge bg-iw-accent/10 text-iw-accent capitalize">
                {catLabel}
              </span>
            </div>
            <span className="mt-auto self-end pt-3 text-xs font-medium text-iw-accent group-hover:text-iw-accent-light">
              Read →
            </span>
          </Link>
        )
      }}
      emptyMessage="No books found matching your search."
    />
  )
}
