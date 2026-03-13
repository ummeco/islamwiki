import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  getCanonicalBook,
  getBooks,
  getChaptersByBook,
  getBooksByAuthor,
  getBookBySlug,
  getBookIndex,
} from '@/lib/data/books'
import { formatIslamicYear } from '@/lib/dates/hijri'

interface Props {
  params: Promise<{ slug: string }>
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

export async function generateStaticParams() {
  return getBooks().map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = getCanonicalBook(slug)
  if (!result) return {}
  const { book } = result
  return {
    title: book.title_en,
    description: `Read ${book.title_en} by ${book.author_name_en}. ${book.description_en || 'Classical Islamic text available online.'}`,
  }
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const result = getCanonicalBook(slug)
  if (!result) notFound()

  // 301 redirect for non-canonical alias slugs
  if (result.redirectTo) redirect(result.redirectTo)

  const { book } = result

  const chapters = getChaptersByBook(slug)
  const otherBooksByAuthor = book.author_slug
    ? getBooksByAuthor(book.author_slug).filter((b) => b.id !== book.id)
    : []
  const relatedBooks = (book.related_slugs ?? [])
    .map((s) => getBookBySlug(s))
    .filter(Boolean)
  const hasIndex = getBookIndex(slug) !== null

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
            {(book.year_written_ah || book.year_written_ce) && (
              <span className="before:mr-3 before:content-['\u00B7']">
                {formatIslamicYear(book.year_written_ah, book.year_written_ce)}
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
              {book.category_primary && (
                <div>
                  <dt className="text-iw-text-muted">Category</dt>
                  <dd className="text-iw-text">
                    {CATEGORY_LABELS[book.category_primary] ?? book.category_primary}
                    {book.category_secondary && (
                      <span className="text-iw-text-muted">
                        {' / '}
                        {CATEGORY_LABELS[book.category_secondary] ?? book.category_secondary}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {book.madhab && (
                <div>
                  <dt className="text-iw-text-muted">Madhab</dt>
                  <dd>
                    <span className="inline-block rounded-full bg-iw-accent/10 px-2 py-0.5 text-xs font-medium capitalize text-iw-accent">
                      {book.madhab}
                    </span>
                  </dd>
                </div>
              )}
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
                <dd className="flex flex-wrap gap-1 pt-0.5">
                  {book.available_languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded bg-iw-surface px-1.5 py-0.5 text-[11px] uppercase text-iw-text-muted"
                    >
                      {lang}
                    </span>
                  ))}
                </dd>
              </div>
              {(book.year_written_ah || book.year_written_ce) && (
                <div>
                  <dt className="text-iw-text-muted">Written</dt>
                  <dd className="text-iw-text">
                    {formatIslamicYear(book.year_written_ah, book.year_written_ce)}
                  </dd>
                </div>
              )}
              {book.died_ah && (
                <div>
                  <dt className="text-iw-text-muted">Author Died</dt>
                  <dd className="text-iw-text">AH {book.died_ah}</dd>
                </div>
              )}
              {book.volumes && (
                <div>
                  <dt className="text-iw-text-muted">Volumes</dt>
                  <dd className="text-iw-text">{book.volumes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* External source link */}
          {book.source_url_primary && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Original Text
              </h3>
              <a
                href={book.source_url_primary}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-iw-accent hover:text-iw-accent-light"
              >
                Read on{' '}
                {book.source_url_primary.includes('al-maktaba.org')
                  ? 'Al-Maktaba Al-Shamela'
                  : book.source_url_primary.includes('shamela.ws')
                    ? 'Shamela'
                    : book.source_url_primary.includes('archive.org')
                      ? 'Archive.org'
                      : 'External source'}{' '}
                ↗
              </a>
              <p className="mt-1 text-xs text-iw-text-muted capitalize">
                {book.source_type === 'html' ? 'HTML (readable online)' : 'PDF'}
              </p>
            </div>
          )}

          {/* Book index link */}
          {hasIndex && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">Index</h3>
              <Link
                href={`/books/${slug}/index`}
                className="text-sm text-iw-accent hover:text-white"
              >
                Browse subject index →
              </Link>
            </div>
          )}

          {/* See also: related books */}
          {relatedBooks.length > 0 && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-white">See Also</h3>
              <ul className="space-y-2">
                {relatedBooks.map((b) => b && (
                  <li key={b.id}>
                    <Link
                      href={`/books/${b.slug}`}
                      className="text-sm text-iw-text-secondary hover:text-iw-accent"
                    >
                      {b.title_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
