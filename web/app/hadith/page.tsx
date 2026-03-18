import Link from 'next/link'
import type { Metadata } from 'next'
import { getCollections } from '@/lib/data/hadith'
import { getHreflangAlternates } from '@/components/seo/hreflang'

export const metadata: Metadata = {
  title: 'Hadith Collections',
  description:
    'Browse all major hadith collections: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta Malik, and Musnad Ahmad. Full isnad analysis and grading.',
  alternates: { languages: getHreflangAlternates('/hadith') },
}

export default function HadithIndexPage() {
  const collections = getCollections()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Hadith Collections</h1>
        <p className="mt-2 text-iw-text-secondary">
          Eight major collections with full Arabic and English text, hadith grading, and isnad chain analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/hadith/${col.slug}`}
            className="card group"
          >
            <h2 className="text-lg font-semibold text-iw-text group-hover:text-white">
              {col.name_en}
            </h2>
            <p className="arabic-text mt-1 text-white/80">{col.name_ar}</p>
            <p className="mt-2 text-sm text-iw-text-secondary">
              {col.author_name_en} · {col.total_hadith.toLocaleString()} hadith · {col.total_books} books
            </p>
            {col.description_en && (
              <p className="mt-2 text-xs text-iw-text-muted">
                {col.description_en}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
