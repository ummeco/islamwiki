import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getBookBySlug,
  getBooks,
  getChaptersByBook,
  getBooksByAuthor,
} from '@/lib/data/books'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getBooks().map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) return {}
  return {
    title: book.title_en,
    description: `Read ${book.title_en} by ${book.author_name_en}. ${book.description_en || 'Classical Islamic text available online.'}`,
  }
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()

  const chapters = getChaptersByBook(book.id)
  const otherBooksByAuthor = getBooksByAuthor(book.author_slug).filter(
    (b) => b.id !== book.id
  )

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/books" className="hover:text-iw-text">
          Books
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{book.title_en}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-white">{book.title_en}</h1>
          {book.title_ar && (
            <p className="arabic-text mt-2 text-2xl text-white/80">
              {book.title_ar}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-iw-text-secondary">
            <span>
              By{' '}
              <Link
                href={`/people/${book.author_slug}`}
                className="text-iw-accent hover:text-white"
              >
                {book.author_name_en}
              </Link>
            </span>
            {book.year_written_ce && (
              <span className="before:mr-3 before:content-['\u00B7']">
                {book.year_written_ce} CE
              </span>
            )}
            {book.volumes && (
              <span className="before:mr-3 before:content-['\u00B7']">
                {book.volumes} volumes
              </span>
            )}
            {book.pages && (
              <span className="before:mr-3 before:content-['\u00B7']">
                {book.pages} pages
              </span>
            )}
          </div>

          {book.description_en && (
            <p className="mt-6 leading-relaxed text-iw-text-secondary">
              {book.description_en}
            </p>
          )}

          {/* Table of contents */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Table of Contents
            </h2>
            {chapters.length > 0 ? (
              <div className="space-y-2">
                {chapters.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/books/${slug}/${ch.number}`}
                    className="flex items-center gap-3 rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-iw-accent/10 text-xs font-bold text-iw-accent">
                      {ch.number}
                    </span>
                    <span className="text-sm text-iw-text">{ch.title_en}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-iw-text-muted">
                Chapter listings are being added.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-white">Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-iw-text-muted">Subject</dt>
                <dd className="text-iw-text capitalize">
                  {book.subject.replace(/_/g, ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-iw-text-muted">Original Language</dt>
                <dd className="text-iw-text uppercase">
                  {book.language_original}
                </dd>
              </div>
              <div>
                <dt className="text-iw-text-muted">Available In</dt>
                <dd className="text-iw-text uppercase">
                  {book.available_languages.join(', ')}
                </dd>
              </div>
              {book.year_written_ah && (
                <div>
                  <dt className="text-iw-text-muted">Written (AH)</dt>
                  <dd className="text-iw-text">{book.year_written_ah} AH</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Other books by this author */}
          {otherBooksByAuthor.length > 0 && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">
                More by {book.author_name_en}
              </h3>
              <ul className="space-y-2">
                {otherBooksByAuthor.slice(0, 8).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/books/${b.slug}`}
                      className="text-sm text-iw-text-secondary hover:text-iw-accent"
                    >
                      {b.title_en}
                    </Link>
                  </li>
                ))}
                {otherBooksByAuthor.length > 8 && (
                  <li className="text-xs text-iw-text-muted">
                    and {otherBooksByAuthor.length - 8} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
