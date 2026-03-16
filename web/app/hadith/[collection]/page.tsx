import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollectionBySlug, getCollections, getBooksByCollection } from '@/lib/data/hadith'
import { HadithCollectionJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ collection: string }>
}

export async function generateStaticParams() {
  return getCollections().map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params
  const col = getCollectionBySlug(slug)
  if (!col) return {}
  return {
    title: col.name_en,
    description: `Browse ${col.name_en} by ${col.author_name_en}. ${col.total_hadith.toLocaleString()} hadith in ${col.total_books} books. Arabic and English with grading.`,
    alternates: { languages: getHreflangAlternates(`/hadith/${slug}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: col.name_en, section: 'Hadith', arabic: col.name_ar, subtitle: `By ${col.author_name_en} · ${col.total_hadith.toLocaleString()} hadith` }) }],
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection: slug } = await params
  const col = getCollectionBySlug(slug)
  if (!col) notFound()

  const books = getBooksByCollection(col.id)
  const allCollections = getCollections()
  const colIdx = allCollections.findIndex((c) => c.slug === slug)
  const prevCol = colIdx > 0 ? allCollections[colIdx - 1] : null
  const nextCol =
    colIdx < allCollections.length - 1 ? allCollections[colIdx + 1] : null

  return (
    <div className="section-container py-12">
      <HadithCollectionJsonLd
        name={col.name_en}
        nameAr={col.name_ar}
        author={col.author_name_en}
        totalHadiths={col.total_hadith}
        slug={col.slug}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Hadith', url: '/hadith' },
        { name: col.name_en, url: `/hadith/${col.slug}` },
      ]} />
      {/* Header */}
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/hadith" className="hover:text-iw-text">Hadith</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{col.name_en}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{col.name_en}</h1>
        <p className="arabic-text mt-2 text-xl text-white/80">{col.name_ar}</p>
        <p className="mt-2 text-iw-text-secondary">
          By {col.author_name_en} · {col.total_hadith.toLocaleString()} hadith · {col.total_books} books
        </p>
        {col.description_en && (
          <p className="mt-4 max-w-2xl text-sm text-iw-text-secondary/80">{col.description_en}</p>
        )}
      </div>

      {/* Books list */}
      <div className="space-y-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/hadith/${slug}/${book.slug}`}
            className="flex items-center justify-between rounded-lg border border-iw-border p-4 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-iw-accent/10 text-xs font-bold text-iw-accent">
                {book.number}
              </span>
              <div>
                <h2 className="font-medium text-iw-text">{book.name_en}</h2>
                <p className="arabic-text text-sm text-iw-text-secondary">{book.name_ar}</p>
              </div>
            </div>
            <span className="text-xs text-iw-text-secondary">{book.hadith_count} hadith</span>
          </Link>
        ))}
      </div>

      {/* Collection prev/next */}
      <div className="mt-10 grid grid-cols-2 gap-4 border-t border-iw-border pt-6">
        {prevCol ? (
          <Link
            href={`/hadith/${prevCol.slug}`}
            className="group rounded-lg border border-iw-border p-4 transition-colors hover:border-iw-text-muted/20"
          >
            <span className="text-xs text-iw-text-muted">Previous Collection</span>
            <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
              {prevCol.name_en}
            </p>
          </Link>
        ) : (
          <div />
        )}
        {nextCol ? (
          <Link
            href={`/hadith/${nextCol.slug}`}
            className="group rounded-lg border border-iw-border p-4 text-right transition-colors hover:border-iw-text-muted/20"
          >
            <span className="text-xs text-iw-text-muted">Next Collection</span>
            <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
              {nextCol.name_en}
            </p>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
