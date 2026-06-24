/**
 * cross-refs-resolve.ts — server-side resolver for article cross-references.
 *
 * PURPOSE: Mirrors the resolution logic that lived inside the Next server component
 *   components/articles/cross-references.tsx, extracted so the Astro page can resolve
 *   refs in its frontmatter (server-side) and pass plain arrays to the presentational
 *   CrossReferences island.
 * INPUTS:  raw ref strings from article JSON (quran_refs / hadith_refs / scholar_refs)
 * OUTPUTS: resolved chip data ({ResolvedQuranRef|ResolvedHadithRef|ResolvedScholarRef}[])
 * CONSTRAINTS: pure data resolution using framework-independent lib/data readers; no
 *   client code, no admin secret, no next/* imports.
 * REF: articles-wiki migration group
 */
import { getSurahByNumber } from '../../lib/data/quran'
import { getPeople } from '../../lib/data/people'
import {
  COLLECTION_NAMES,
  type ResolvedQuranRef,
  type ResolvedHadithRef,
  type ResolvedScholarRef,
} from '../components/articles/CrossReferences'

export function resolveCrossRefs(opts: {
  quranRefs?: string[]
  hadithRefs?: string[]
  scholarRefs?: string[]
}): {
  quran: ResolvedQuranRef[]
  hadith: ResolvedHadithRef[]
  scholars: ResolvedScholarRef[]
} {
  const { quranRefs, hadithRefs, scholarRefs } = opts

  // ── Quran refs: resolve surah_number:ayah → resolved chip ──
  const quran: ResolvedQuranRef[] = []
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
      quran.push({
        slug: surah.slug,
        ayah,
        label: `${surah.name_transliteration || surah.name_en} ${surahNum}:${ayah}`,
      })
    }
  }

  // ── Hadith refs: deduplicate by collection slug ──
  const hadith: ResolvedHadithRef[] = []
  if (hadithRefs && hadithRefs.length > 0) {
    const seenSlugs = new Set<string>()
    for (const ref of hadithRefs) {
      const colonIdx = ref.indexOf(':')
      const slug = colonIdx === -1 ? ref : ref.slice(0, colonIdx)
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)
      const name = COLLECTION_NAMES[slug] ?? slug
      hadith.push({ slug, name, href: `/hadith/${slug}` })
    }
  }

  // ── Scholar refs: look up name + slug → people page ──
  const scholars: ResolvedScholarRef[] = []
  if (scholarRefs && scholarRefs.length > 0) {
    try {
      const people = getPeople()
      const slugMap = new Map(people.map((s) => [s.slug, s]))
      for (const slug of scholarRefs.slice(0, 8)) {
        const person = slugMap.get(slug)
        if (person) {
          scholars.push({ slug, name: person.name_en })
        }
      }
    } catch {
      // silently skip if people data fails to load
    }
  }

  return { quran, hadith, scholars }
}
