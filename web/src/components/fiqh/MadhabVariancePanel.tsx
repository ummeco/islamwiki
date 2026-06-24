/**
 * MadhabVariancePanel.tsx — Astro island port of components/fiqh/MadhabVariancePanel.tsx
 *
 * PURPOSE: Display madhab-level variance for a fiqh ruling on an article/hadith/ayah.
 *   Data is fetched SERVER-SIDE in the .astro page via lib/fiqh/madhab-rulings
 *   (Hasura admin, server-only) and passed in as the `rulings` prop. This island
 *   is pure presentational — no data fetching, no admin secret.
 * INVARIANTS (preserved from original):
 *   - Renders nothing when rulings is empty.
 *   - Arabic ruling text (ruling_ar) is passed through verbatim — tashkeel intact.
 * CONVERSION: copied verbatim (original had no next/* imports). Type imported
 *   locally to avoid a cross-tree import from the old components/ tree.
 * REF: ports components/fiqh/MadhabVariancePanel.tsx (articles-wiki migration group)
 */

export interface MadhabRuling {
  id: string
  madhab: string
  ruling: string
  ruling_ar: string | null
  evidence: string | null
  scholar_source: string | null
}

interface MadhabVariancePanelProps {
  rulings: MadhabRuling[]
}

const MADHAB_DISPLAY: Record<string, { label: string; label_ar: string; color: string }> = {
  hanafi: { label: 'Hanafi', label_ar: 'حنفي', color: 'bg-blue-900/30 border-blue-700/40 text-blue-200' },
  maliki: { label: 'Maliki', label_ar: 'مالكي', color: 'bg-emerald-900/30 border-emerald-700/40 text-emerald-200' },
  shafii: { label: "Shafi'i", label_ar: 'شافعي', color: 'bg-amber-900/30 border-amber-700/40 text-amber-200' },
  hanbali: { label: 'Hanbali', label_ar: 'حنبلي', color: 'bg-purple-900/30 border-purple-700/40 text-purple-200' },
  dhahiri: { label: 'Dhahiri', label_ar: 'ظاهري', color: 'bg-gray-800/40 border-gray-600/40 text-gray-300' },
  general: { label: 'Consensus', label_ar: 'إجماع', color: 'bg-teal-900/30 border-teal-700/40 text-teal-200' },
  multi: { label: 'Multiple', label_ar: 'متعدد', color: 'bg-gray-800/40 border-gray-600/40 text-gray-300' },
}

export function MadhabVariancePanel({ rulings }: MadhabVariancePanelProps) {
  if (!rulings || rulings.length === 0) return null

  return (
    <section
      aria-labelledby="madhab-variance-heading"
      className="mt-8 rounded-2xl border border-iw-border bg-iw-surface p-6"
    >
      <h2 id="madhab-variance-heading" className="mb-4 text-sm font-semibold text-iw-text">
        Madhab Variance <span className="text-iw-text-muted">({rulings.length})</span>
      </h2>

      <div className="space-y-3">
        {rulings.map((ruling) => {
          const meta = MADHAB_DISPLAY[ruling.madhab] ?? {
            label: ruling.madhab,
            label_ar: '',
            color: 'bg-gray-800/40 border-gray-600/40 text-gray-300',
          }

          return (
            <article
              key={ruling.id}
              className={`rounded-xl border p-4 ${meta.color}`}
              aria-label={`${meta.label} ruling`}
            >
              <header className="mb-2 flex items-center gap-3">
                <span className="text-xs font-semibold">{meta.label}</span>
                {meta.label_ar && (
                  <span dir="rtl" lang="ar" className="font-amiri text-xs">
                    {meta.label_ar}
                  </span>
                )}
              </header>

              <p className="text-[13px] leading-relaxed text-iw-text-secondary">
                {ruling.ruling}
              </p>

              {ruling.ruling_ar && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-2 font-amiri text-[14px] leading-relaxed text-iw-text-secondary"
                >
                  {ruling.ruling_ar}
                </p>
              )}

              {ruling.evidence && (
                <p className="mt-2 text-[12px] text-iw-text-muted">
                  <span className="font-medium">Evidence: </span>
                  {ruling.evidence}
                </p>
              )}

              {ruling.scholar_source && (
                <p className="mt-1 text-[11px] text-iw-text-muted">
                  Source: {ruling.scholar_source}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
