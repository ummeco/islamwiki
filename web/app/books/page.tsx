import type { Metadata } from 'next'
import { getBooks } from '@/lib/data/books'
import { BooksGrid } from '@/components/listings/books-grid'
import { getHreflangAlternates } from '@/components/seo/hreflang'

export const metadata: Metadata = {
  title: 'Books — Classical Islamic Texts',
  description:
    'Browse classical Islamic books: hadith collections, fiqh manuals, tafsir works, aqeedah texts, and seerah. Read online in multiple languages.',
  alternates: { languages: getHreflangAlternates('/books') },
}

export default function BooksIndexPage() {
  const books = getBooks()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Books</h1>
        <p className="mt-2 text-iw-text-secondary">
          Classical Islamic texts spanning hadith, fiqh, tafsir, aqeedah, history, and more.
        </p>
      </div>

      <BooksGrid books={books} />
    </div>
  )
}
