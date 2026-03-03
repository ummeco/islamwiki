import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookBySlug, getChapter } from '@/lib/data/books'

interface Props {
  params: Promise<{ slug: string; chapter: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: chNum } = await params
  const book = getBookBySlug(slug)
  if (!book) return {}
  const ch = getChapter(book.id, parseInt(chNum, 10))
  return {
    title: ch ? `${ch.title_en} — ${book.title_en}` : book.title_en,
    description: `Chapter ${chNum} of ${book.title_en} by ${book.author_name_en}.`,
  }
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter: chNum } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()
  const ch = getChapter(book.id, parseInt(chNum, 10))
  if (!ch) notFound()

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/books" className="hover:text-iw-text">Books</Link>
        <span className="mx-2">/</span>
        <Link href={`/books/${slug}`} className="hover:text-iw-text">{book.title_en}</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">Chapter {chNum}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-white">{ch.title_en}</h1>
        {ch.title_ar && (
          <p className="arabic-text mt-2 text-xl text-white/80">{ch.title_ar}</p>
        )}

        <div className="mt-8 prose prose-invert max-w-none text-iw-text-secondary">
          {ch.content_en ? (
            <div dangerouslySetInnerHTML={{ __html: ch.content_en }} />
          ) : (
            <p className="italic text-iw-text-muted">
              Chapter text is being prepared.
            </p>
          )}
        </div>

        {/* Chapter navigation */}
        <div className="mt-12 flex items-center justify-between">
          {parseInt(chNum, 10) > 1 ? (
            <Link
              href={`/books/${slug}/${parseInt(chNum, 10) - 1}`}
              className="rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary hover:text-iw-text"
            >
              Previous Chapter
            </Link>
          ) : (
            <div />
          )}
          <Link
            href={`/books/${slug}/${parseInt(chNum, 10) + 1}`}
            className="rounded-lg border border-iw-border px-4 py-2 text-sm text-iw-text-secondary hover:text-iw-text"
          >
            Next Chapter
          </Link>
        </div>
      </div>
    </div>
  )
}
