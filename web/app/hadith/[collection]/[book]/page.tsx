import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollectionBySlug, getBookBySlug, getHadithsByBook } from '@/lib/data/hadith'

interface Props {
  params: Promise<{ collection: string; book: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: colSlug, book: bookSlug } = await params
  const col = getCollectionBySlug(colSlug)
  const book = col ? getBookBySlug(col.id, bookSlug) : null
  if (!col || !book) return {}
  return {
    title: `${book.name_en} — ${col.name_en}`,
    description: `${book.name_en} from ${col.name_en}. ${book.hadith_count} hadith with Arabic, English translation, and grading.`,
  }
}

export default async function BookPage({ params }: Props) {
  const { collection: colSlug, book: bookSlug } = await params
  const col = getCollectionBySlug(colSlug)
  if (!col) notFound()
  const book = getBookBySlug(col.id, bookSlug)
  if (!book) notFound()

  const hadiths = getHadithsByBook(book.id)

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/hadith" className="hover:text-iw-text">Hadith</Link>
        <span className="mx-2">/</span>
        <Link href={`/hadith/${colSlug}`} className="hover:text-iw-text">{col.name_en}</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{book.name_en}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{book.name_en}</h1>
        <p className="arabic-text mt-1 text-lg text-white/80">{book.name_ar}</p>
        <p className="mt-2 text-sm text-iw-text-secondary">{book.hadith_count} hadith</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {hadiths.map((h) => (
          <Link
            key={h.id}
            href={`/hadith/${colSlug}/${bookSlug}/${h.number_in_book}`}
            className="block rounded-xl border border-iw-border p-6 transition-colors hover:border-iw-border"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-iw-accent">
                Hadith #{h.number_in_book}
              </span>
              <span
                className={
                  h.grade === 'sahih'
                    ? 'badge-sahih'
                    : h.grade === 'hasan'
                      ? 'badge-hasan'
                      : h.grade === 'daif'
                        ? 'badge-daif'
                        : 'badge bg-gray-500/20 text-gray-300'
                }
              >
                {h.grade}
              </span>
            </div>
            <p className="line-clamp-3 text-sm text-iw-text-secondary">
              {h.text_en || ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
