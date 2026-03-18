import Link from 'next/link'
import { getSurahByNumber } from '@/lib/data/quran'
import { getPeople } from '@/lib/data/people'

interface CrossReferencesProps {
  quranRefs?: string[]    // "surah_number:ayah" e.g. "2:43"
  hadithRefs?: string[]   // "collection_slug" or "collection_slug:n" e.g. "bukhari", "muslim:456"
  scholarRefs?: string[]  // scholar slugs e.g. "ibn-taymiyyah"
  /** Fallback: tags array for legacy tag-based cross-refs (used when no parsed refs exist) */
  tags?: string[]
  category?: string
}

/** Canonical collection slug → display name */
const COLLECTION_NAMES: Record<string, string> = {
  'bukhari':        'Sahih al-Bukhari',
  'muslim':         'Sahih Muslim',
  'abu-dawud':      'Sunan Abi Dawud',
  'tirmidhi':       'Jami at-Tirmidhi',
  'nasai':          "Sunan al-Nasa'i",
  'ibn-majah':      'Sunan Ibn Majah',
  'musnad-ahmad':   'Musnad Ahmad',
  'riyadh-salihin': 'Riyadh as-Salihin',
  'muwatta':        "Muwatta' Imam Malik",
  'adab-al-mufrad': 'Al-Adab al-Mufrad',
  'bulugh-maram':   'Bulugh al-Maram',
  'darimi':         'Sunan al-Darimi',
  'shamail':        'Shamail al-Muhammadiyya',
}

export function CrossReferences({
  quranRefs,
  hadithRefs,
  scholarRefs,
}: CrossReferencesProps) {
  // ── Quran refs: resolve surah_number:ayah → { slug, name_en, ayah } ─────
  interface QuranRef { slug: string; name: string; ayah: number; label: string }
  const resolvedQuran: QuranRef[] = []
  if (quranRefs && quranRefs.length > 0) {
    const seen = new Set<string>()
    for (const ref of quranRefs) {
      const [surahStr, ayahStr] = ref.split(':')
      const surahNum = parseInt(surahStr, 10)
      const ayah = parseInt(ayahStr, 10)
      if (isNaN(surahNum) || isNaN(ayah)) continue
      const surah = getSurahByNumber(surahNum)
      if (!surah) continue
      const key = `${surah.slug}:${ayah}`
      if (seen.has(key)) continue
      seen.add(key)
      resolvedQuran.push({
        slug: surah.slug,
        name: surah.name_transliteration || surah.name_en,
        ayah,
        label: `${surah.name_transliteration || surah.name_en} ${surahNum}:${ayah}`,
      })
    }
  }

  // ── Hadith refs: deduplicate by collection slug ──────────────────────────
  interface HadithRef { slug: string; name: string; n?: number; href: string }
  const resolvedHadith: HadithRef[] = []
  if (hadithRefs && hadithRefs.length > 0) {
    const seenSlugs = new Set<string>()
    for (const ref of hadithRefs) {
      const colonIdx = ref.indexOf(':')
      const slug = colonIdx === -1 ? ref : ref.slice(0, colonIdx)
      const numStr = colonIdx === -1 ? undefined : ref.slice(colonIdx + 1)
      const n = numStr ? parseInt(numStr, 10) : undefined
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)
      const name = COLLECTION_NAMES[slug] ?? slug
      const href = `/hadith/${slug}`
      resolvedHadith.push({ slug, name, n: n && !isNaN(n) ? n : undefined, href })
    }
  }

  // ── Scholar refs: look up name + slug → people page ─────────────────────
  interface ScholarRef { slug: string; name: string }
  const resolvedScholars: ScholarRef[] = []
  if (scholarRefs && scholarRefs.length > 0) {
    try {
      const people = getPeople()
      const slugMap = new Map(people.map((s) => [s.slug, s]))
      for (const slug of scholarRefs.slice(0, 8)) {
        const person = slugMap.get(slug)
        if (person) {
          resolvedScholars.push({ slug, name: person.name_en })
        }
      }
    } catch {
      // silently skip if people data fails to load
    }
  }

  if (resolvedQuran.length === 0 && resolvedHadith.length === 0 && resolvedScholars.length === 0) {
    return null
  }

  return (
    <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface/50 p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">References in This Article</h2>
      <div className="space-y-4">
        {resolvedQuran.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Quran</p>
            <div className="flex flex-wrap gap-1.5">
              {resolvedQuran.map((ref) => (
                <Link
                  key={`${ref.slug}:${ref.ayah}`}
                  href={`/quran/${ref.slug}#${ref.ayah}`}
                  className="rounded-md bg-iw-accent/10 px-2 py-0.5 text-xs text-iw-accent transition-colors hover:bg-iw-accent/20"
                >
                  {ref.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {resolvedHadith.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Hadith Collections</p>
            <div className="flex flex-wrap gap-1.5">
              {resolvedHadith.map((ref) => (
                <Link
                  key={ref.slug}
                  href={ref.href}
                  className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  {ref.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {resolvedScholars.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Scholars</p>
            <div className="flex flex-wrap gap-1.5">
              {resolvedScholars.map((ref) => (
                <Link
                  key={ref.slug}
                  href={`/people/${ref.slug}`}
                  className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 transition-colors hover:bg-blue-500/20"
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
