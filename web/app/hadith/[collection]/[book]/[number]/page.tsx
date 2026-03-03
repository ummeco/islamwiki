import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getCollectionBySlug,
  getBookBySlug,
  getHadithByNumber,
  getBooksByCollection,
} from '@/lib/data/hadith'

interface Props {
  params: Promise<{ collection: string; book: string; number: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: colSlug, book: bookSlug, number } = await params
  const col = getCollectionBySlug(colSlug)
  const book = col ? getBookBySlug(col.id, bookSlug) : null
  if (!col || !book) return {}
  return {
    title: `Hadith #${number} — ${book.name_en} — ${col.name_en}`,
    description: `${col.name_en}, ${book.name_en}, Hadith ${number}. Full Arabic text, English translation, and grading.`,
  }
}

export default async function HadithPage({ params }: Props) {
  const { collection: colSlug, book: bookSlug, number } = await params
  const col = getCollectionBySlug(colSlug)
  if (!col) notFound()
  const book = getBookBySlug(col.id, bookSlug)
  if (!book) notFound()

  const num = parseInt(number, 10)
  const hadith = getHadithByNumber(book.id, num)
  if (!hadith) notFound()

  const prevHadith = num > 1 ? getHadithByNumber(book.id, num - 1) : null
  const nextHadith =
    num < book.hadith_count ? getHadithByNumber(book.id, num + 1) : null

  // Get adjacent books for navigation when at first/last hadith
  const booksInCollection = getBooksByCollection(col.id)
  const currentBookIdx = booksInCollection.findIndex((b) => b.id === book.id)
  const prevBook =
    currentBookIdx > 0 ? booksInCollection[currentBookIdx - 1] : null
  const nextBook =
    currentBookIdx < booksInCollection.length - 1
      ? booksInCollection[currentBookIdx + 1]
      : null

  return (
    <div className="section-container py-12">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/hadith" className="hover:text-iw-text">
          Hadith
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/hadith/${colSlug}`} className="hover:text-iw-text">
          {col.name_en}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/hadith/${colSlug}/${bookSlug}`}
          className="hover:text-iw-text"
        >
          {book.name_en}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">#{number}</span>
      </nav>

      {/* Top prev/next navigation */}
      <div className="mb-6 flex items-center justify-between">
        {prevHadith ? (
          <Link
            href={`/hadith/${colSlug}/${bookSlug}/${num - 1}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Hadith #{num - 1}
          </Link>
        ) : prevBook ? (
          <Link
            href={`/hadith/${colSlug}/${prevBook.slug}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevBook.name_en}
          </Link>
        ) : (
          <div />
        )}

        <span className="text-xs text-iw-text-muted">
          {num} of {book.hadith_count}
        </span>

        {nextHadith ? (
          <Link
            href={`/hadith/${colSlug}/${bookSlug}/${num + 1}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            Hadith #{num + 1}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : nextBook ? (
          <Link
            href={`/hadith/${colSlug}/${nextBook.slug}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            {nextBook.name_en}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Hadith #{hadith.number_in_book}
          </h1>
          <span
            className={
              hadith.grade === 'sahih'
                ? 'badge-sahih'
                : hadith.grade === 'hasan'
                  ? 'badge-hasan'
                  : hadith.grade === 'daif'
                    ? 'badge-daif'
                    : 'badge bg-gray-500/20 text-gray-300'
            }
          >
            {hadith.grade}
            {hadith.graded_by && ` (${hadith.graded_by})`}
          </span>
        </div>

        {/* Arabic text */}
        {hadith.text_ar && (
          <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-6">
            <h2 className="mb-3 text-sm font-medium text-iw-accent">Arabic</h2>
            <p className="arabic-text text-lg leading-loose">{hadith.text_ar}</p>
          </div>
        )}

        {/* English translation */}
        {hadith.text_en && (
          <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface p-6">
            <h2 className="mb-3 text-sm font-medium text-iw-accent">
              English Translation
            </h2>
            <p className="leading-relaxed text-iw-text">{hadith.text_en}</p>
          </div>
        )}

        {/* Chapter reference */}
        {hadith.chapter_en && (
          <div className="mb-6">
            <p className="text-sm text-iw-text-secondary">
              <span className="font-medium text-iw-accent">Chapter:</span>{' '}
              {hadith.chapter_en}
            </p>
          </div>
        )}

        {/* Reference */}
        <div className="rounded-xl border border-iw-border bg-iw-surface/50 p-4 text-xs text-iw-text-secondary">
          <p>
            <span className="font-medium text-iw-text">Reference:</span>{' '}
            {col.name_en}, {book.name_en}, Hadith {hadith.number_in_book}
          </p>
          {hadith.number_global && (
            <p className="mt-1">
              <span className="font-medium text-iw-text">
                In-collection number:
              </span>{' '}
              {hadith.number_global}
            </p>
          )}
        </div>

        {/* Bottom prev/next navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-iw-border pt-6">
          {prevHadith ? (
            <Link
              href={`/hadith/${colSlug}/${bookSlug}/${num - 1}`}
              className="group flex flex-col items-start"
            >
              <span className="text-xs text-iw-text-muted">Previous</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">
                Hadith #{num - 1}
              </span>
            </Link>
          ) : (
            <div />
          )}
          <Link
            href={`/hadith/${colSlug}/${bookSlug}`}
            className="text-xs text-iw-text-muted hover:text-iw-accent"
          >
            Back to {book.name_en}
          </Link>
          {nextHadith ? (
            <Link
              href={`/hadith/${colSlug}/${bookSlug}/${num + 1}`}
              className="group flex flex-col items-end"
            >
              <span className="text-xs text-iw-text-muted">Next</span>
              <span className="text-sm text-iw-text-secondary group-hover:text-iw-accent">
                Hadith #{num + 1}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}
