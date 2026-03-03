import type { Metadata } from 'next'
import { getSurahs } from '@/lib/data/quran'
import { QuranGrid } from '@/components/listings/quran-grid'

export const metadata: Metadata = {
  title: 'Quran',
  description:
    'Read the Holy Quran with Arabic text, translations, and tafsir. All 114 surahs with verse-by-verse commentary from Ibn Kathir, al-Jalalayn, and more.',
}

export default function QuranIndexPage() {
  const surahs = getSurahs()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">The Holy Quran</h1>
        <p className="mt-2 text-iw-text-secondary">
          114 surahs, 6,236 verses. Arabic text with translations and tafsir commentary.
        </p>
      </div>

      <QuranGrid surahs={surahs} />
    </div>
  )
}
