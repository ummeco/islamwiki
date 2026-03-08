import Link from 'next/link'

interface CrossReferencesProps {
  tags: string[]
  category: string
}

/** Maps common article tags/categories to relevant Quran surahs */
const TAG_TO_QURAN: Record<string, { slug: string; name: string }[]> = {
  'pillars': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }],
  'prayer': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }, { slug: 'al-muminun', name: "Al-Mu'minun" }],
  'salah': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }, { slug: 'al-muminun', name: "Al-Mu'minun" }],
  'fasting': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }],
  'sawm': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }],
  'ramadan': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }, { slug: 'al-qadr', name: 'Al-Qadr' }],
  'hajj': [{ slug: 'al-baqarah', name: 'Al-Baqarah' }, { slug: 'al-hajj', name: 'Al-Hajj' }],
  'zakat': [{ slug: 'at-tawbah', name: 'At-Tawbah' }],
  'charity': [{ slug: 'at-tawbah', name: 'At-Tawbah' }, { slug: 'al-baqarah', name: 'Al-Baqarah' }],
  'tawhid': [{ slug: 'al-ikhlas', name: 'Al-Ikhlas' }, { slug: 'al-baqarah', name: 'Al-Baqarah' }],
  'monotheism': [{ slug: 'al-ikhlas', name: 'Al-Ikhlas' }],
  'marriage': [{ slug: 'an-nisa', name: "An-Nisa'" }, { slug: 'ar-rum', name: 'Ar-Rum' }],
  'women': [{ slug: 'an-nisa', name: "An-Nisa'" }, { slug: 'al-ahzab', name: 'Al-Ahzab' }],
  'family': [{ slug: 'an-nisa', name: "An-Nisa'" }],
  'inheritance': [{ slug: 'an-nisa', name: "An-Nisa'" }],
  'prophets': [{ slug: 'al-anbiya', name: "Al-Anbiya'" }],
  'afterlife': [{ slug: 'al-waqi-ah', name: "Al-Waqi'ah" }, { slug: 'al-mulk', name: 'Al-Mulk' }],
  'paradise': [{ slug: 'ar-rahman', name: 'Ar-Rahman' }],
  'ethics': [{ slug: 'al-hujurat', name: 'Al-Hujurat' }, { slug: 'luqman', name: 'Luqman' }],
  'jihad': [{ slug: 'al-anfal', name: 'Al-Anfal' }, { slug: 'at-tawbah', name: 'At-Tawbah' }],
}

/** Maps categories to relevant hadith collections */
const CATEGORY_TO_HADITH: Record<string, { slug: string; name: string }[]> = {
  'Aqeedah': [{ slug: 'bukhari', name: 'Sahih al-Bukhari' }, { slug: 'muslim', name: 'Sahih Muslim' }],
  'Fiqh': [{ slug: 'abu-dawud', name: 'Sunan Abu Dawud' }, { slug: 'tirmidhi', name: 'Jami at-Tirmidhi' }],
  'Seerah': [{ slug: 'bukhari', name: 'Sahih al-Bukhari' }],
  'Ethics': [{ slug: 'riyadh-salihin', name: 'Riyadh as-Salihin' }],
  'Spirituality': [{ slug: 'riyadh-salihin', name: 'Riyadh as-Salihin' }],
  'Hadith Sciences': [{ slug: 'bukhari', name: 'Sahih al-Bukhari' }, { slug: 'muslim', name: 'Sahih Muslim' }],
}

export function CrossReferences({ tags, category }: CrossReferencesProps) {
  // Collect unique Quran refs from tags
  const quranRefs = new Map<string, { slug: string; name: string }>()
  for (const tag of tags) {
    const refs = TAG_TO_QURAN[tag.toLowerCase()]
    if (refs) {
      for (const ref of refs) {
        quranRefs.set(ref.slug, ref)
      }
    }
  }

  // Collect hadith refs from category
  const hadithRefs = CATEGORY_TO_HADITH[category] ?? []

  if (quranRefs.size === 0 && hadithRefs.length === 0) return null

  return (
    <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface/50 p-5">
      <h2 className="mb-3 text-sm font-semibold text-white">Related References</h2>
      <div className="flex flex-wrap gap-4">
        {quranRefs.size > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-iw-text-muted">Quran</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(quranRefs.values()).map((ref) => (
                <Link
                  key={ref.slug}
                  href={`/quran/${ref.slug}`}
                  className="rounded-md bg-iw-accent/10 px-2 py-0.5 text-xs text-iw-accent transition-colors hover:bg-iw-accent/20"
                >
                  {ref.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {hadithRefs.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-iw-text-muted">Hadith</p>
            <div className="flex flex-wrap gap-1.5">
              {hadithRefs.map((ref) => (
                <Link
                  key={ref.slug}
                  href={`/hadith/${ref.slug}`}
                  className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  {ref.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
