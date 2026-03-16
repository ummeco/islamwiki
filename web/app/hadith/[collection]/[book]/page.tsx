import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollections, getCollectionBySlug, getBooksByCollection, getBookBySlug, getHadithsByBook } from '@/lib/data/hadith'
import { PaginatedHadithList } from '@/components/hadith/PaginatedHadithList'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ collection: string; book: string }>
}

export async function generateStaticParams() {
  const collections = getCollections()
  const params: Array<{ collection: string; book: string }> = []
  for (const col of collections) {
    const books = getBooksByCollection(col.id)
    for (const book of books) {
      params.push({ collection: col.slug, book: book.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: colSlug, book: bookSlug } = await params
  const col = getCollectionBySlug(colSlug)
  const book = col ? getBookBySlug(col.id, bookSlug) : null
  if (!col || !book) return {}
  return {
    title: `${book.name_en} — ${col.name_en}`,
    description: `${book.name_en} from ${col.name_en}. ${book.hadith_count} hadith with Arabic, English translation, and grading.`,
    alternates: { languages: getHreflangAlternates(`/hadith/${colSlug}/${bookSlug}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: book.name_en, section: 'Hadith', subtitle: col.name_en }), width: 1200, height: 630 }],
    },
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
        {book.name_ar && (
          <p className="arabic-text mt-1 text-lg text-white/80" lang="ar" dir="rtl">{book.name_ar}</p>
        )}
        <p className="mt-2 text-sm text-iw-text-secondary">
          {hadiths.length} hadith{hadiths.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <PaginatedHadithList
          hadiths={hadiths.map(h => ({
            n: h.n,
            ar: h.ar,
            text_en: h.text_en,
            grade: h.grade,
            chapter_en: h.chapter_en,
            chapter_ar: h.chapter_ar,
          }))}
          colSlug={colSlug}
          bookSlug={bookSlug}
        />
      </div>
    </div>
  )
}
