import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBooks, getBookBySlug, getBookIndex } from '@/lib/data/books'
import { BookIndexClient } from '@/components/books/BookIndexClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  // Only generate for books that have an index.json
  return getBooks()
    .filter((b) => b.canonical !== false && getBookIndex(b.slug) !== null)
    .map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) return {}
  return {
    title: `Index — ${book.title_en}`,
    description: `Subject index for ${book.title_en} by ${book.author_name_en}.`,
  }
}

export default async function BookIndexPage({ params }: Props) {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()

  const entries = getBookIndex(slug)
  if (!entries) notFound()

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/books" className="hover:text-iw-text">Books</Link>
        <span className="mx-2">/</span>
        <Link href={`/books/${slug}`} className="hover:text-iw-text">{book.title_en}</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">Index</span>
      </nav>

      <h1 className="mb-2 text-2xl font-bold text-white">Subject Index</h1>
      <p className="mb-8 text-sm text-iw-text-muted">
        {entries.length} terms · {book.title_en}
      </p>

      <BookIndexClient slug={slug} entries={entries} />
    </div>
  )
}
