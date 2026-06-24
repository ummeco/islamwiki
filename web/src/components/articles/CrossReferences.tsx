/**
 * CrossReferences.tsx — Astro island port of components/articles/cross-references.tsx
 *
 * PURPOSE: Render Quran / Hadith / Scholar cross-reference chips for an article.
 * CONVERSION: The original resolved refs (getSurahByNumber / getPeople) inline in a
 *   server component. Here resolution happens SERVER-SIDE in the .astro page using
 *   the same framework-independent lib/data readers; this island is pure
 *   presentational and receives already-resolved arrays. next/link → <a>.
 * REF: ports components/articles/cross-references.tsx (articles-wiki migration group)
 */

export interface ResolvedQuranRef {
  slug: string
  ayah: number
  label: string
}

export interface ResolvedHadithRef {
  slug: string
  name: string
  href: string
}

export interface ResolvedScholarRef {
  slug: string
  name: string
}

interface CrossReferencesProps {
  quran: ResolvedQuranRef[]
  hadith: ResolvedHadithRef[]
  scholars: ResolvedScholarRef[]
}

export function CrossReferences({ quran, hadith, scholars }: CrossReferencesProps) {
  if (quran.length === 0 && hadith.length === 0 && scholars.length === 0) {
    return null
  }

  return (
    <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface/50 p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">References in This Article</h2>
      <div className="space-y-4">
        {quran.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Quran</p>
            <div className="flex flex-wrap gap-1.5">
              {quran.map((ref) => (
                <a
                  key={`${ref.slug}:${ref.ayah}`}
                  href={`/quran/${ref.slug}#${ref.ayah}`}
                  className="rounded-md bg-iw-accent/10 px-2 py-0.5 text-xs text-iw-accent transition-colors hover:bg-iw-accent/20"
                >
                  {ref.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {hadith.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Hadith Collections</p>
            <div className="flex flex-wrap gap-1.5">
              {hadith.map((ref) => (
                <a
                  key={ref.slug}
                  href={ref.href}
                  className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  {ref.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {scholars.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-iw-text-muted">Scholars</p>
            <div className="flex flex-wrap gap-1.5">
              {scholars.map((ref) => (
                <a
                  key={ref.slug}
                  href={`/people/${ref.slug}`}
                  className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 transition-colors hover:bg-blue-500/20"
                >
                  {ref.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Canonical collection slug → display name (shared with the .astro resolver). */
export const COLLECTION_NAMES: Record<string, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  'abu-dawud': 'Sunan Abi Dawud',
  tirmidhi: 'Jami at-Tirmidhi',
  nasai: "Sunan al-Nasa'i",
  'ibn-majah': 'Sunan Ibn Majah',
  'musnad-ahmad': 'Musnad Ahmad',
  'riyadh-salihin': 'Riyadh as-Salihin',
  muwatta: "Muwatta' Imam Malik",
  'adab-al-mufrad': 'Al-Adab al-Mufrad',
  'bulugh-maram': 'Bulugh al-Maram',
  darimi: 'Sunan al-Darimi',
  shamail: 'Shamail al-Muhammadiyya',
}
