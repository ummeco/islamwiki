import type { Metadata } from 'next'
import Link from 'next/link'
import { getSects, getSectsByCategory, type SectData } from '@/lib/data/sects'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

export const metadata: Metadata = {
  title: 'Islamic Sects & Groups',
  description:
    'Comprehensive overview of Islamic sects from the Ahl us-Sunnah perspective — the saved sect, deviant groups within Islam, and groups outside the fold.',
  alternates: { languages: getHreflangAlternates('/sects') },
  openGraph: {
    images: [
      {
        url: ogImageUrl({
          title: 'Islamic Sects & Groups',
          section: 'Sects',
          subtitle: 'The 73 Sects — An Ahl us-Sunnah Overview',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
}

const STATUS_COLORS: Record<SectData['status'], string> = {
  mainstream: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  deviant: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const STATUS_LABELS: Record<SectData['status'], string> = {
  mainstream: 'Mainstream',
  accepted: 'Accepted',
  deviant: 'Deviant',
  rejected: 'Outside the Fold',
}

function SectCard({ sect }: { sect: SectData }) {
  const colorCls = STATUS_COLORS[sect.status]
  return (
    <Link
      href={`/sects/${sect.slug}`}
      className="block rounded-xl border border-iw-border bg-iw-surface/40 p-4 transition-colors hover:border-iw-text-muted/30 hover:bg-iw-surface"
    >
      <div className="mb-1 flex items-start gap-2">
        <div className="flex-1">
          <span className="font-semibold text-white">{sect.name_en}</span>
          {sect.name_ar && (
            <span className="arabic-text ml-2 text-sm text-white/60">{sect.name_ar}</span>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${colorCls}`}>
          {STATUS_LABELS[sect.status]}
        </span>
      </div>
      {sect.founded_year_ce && (
        <p className="mb-1 text-xs text-iw-text-muted">
          Est. {sect.founded_year_ah ? `${sect.founded_year_ah}h` : `${sect.founded_year_ce} CE`}{sect.founded_year_ah && sect.founded_year_ce ? ` (${sect.founded_year_ce} CE)` : ''}
        </p>
      )}
      <p className="line-clamp-2 text-sm text-iw-text-secondary">{sect.description_en}</p>
    </Link>
  )
}

function SectionHeader({
  icon,
  title,
  subtitle,
  variant,
}: {
  icon: string
  title: string
  subtitle: string
  variant: 'green' | 'amber' | 'red'
}) {
  const borderCls =
    variant === 'green'
      ? 'border-emerald-500/40 bg-emerald-500/5'
      : variant === 'amber'
        ? 'border-amber-500/40 bg-amber-500/5'
        : 'border-red-500/40 bg-red-500/5'
  const titleCls =
    variant === 'green'
      ? 'text-emerald-300'
      : variant === 'amber'
        ? 'text-amber-300'
        : 'text-red-300'

  return (
    <div className={`mb-6 rounded-xl border p-5 ${borderCls}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className={`text-xl font-bold ${titleCls}`}>{title}</h2>
          <p className="mt-0.5 text-sm text-iw-text-secondary">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default function SectsIndexPage() {
  const ahlussunnah = getSectsByCategory('ahlussunnah')
  const madhabs = getSectsByCategory('madhab')
  const classicalDeviant = getSectsByCategory('classical-deviant').sort(
    (a, b) => (a.founded_year_ce ?? 9999) - (b.founded_year_ce ?? 9999),
  )
  const shia = getSectsByCategory('shia')
  const sufi = getSectsByCategory('sufi')
  const contemporary = getSectsByCategory('contemporary')
  const outsideFold = getSectsByCategory('outside-fold')

  // Split Shia: parent entry + Zaydi + Twelver = deviant; Rafidah + Ismaili = rejected
  const shiaDeviant = shia.filter((s) => s.status === 'deviant')
  const shiaRejected = shia.filter((s) => s.status === 'rejected')

  // Split contemporary: mainstream within Ahl us-Sunnah vs deviant
  const contemporaryMainstream = contemporary.filter((s) => s.status === 'mainstream')
  const contemporaryDeviant = contemporary.filter((s) => s.status === 'deviant')
  const contemporaryRejected = contemporary.filter((s) => s.status === 'rejected')

  return (
    <div className="section-container py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Islamic Sects &amp; Groups</h1>
        <p className="mt-2 max-w-2xl text-iw-text-secondary">
          Presented from the Ahl us-Sunnah wal-Jama&apos;ah perspective based on classical
          scholarly sources. This is an educational reference — the goal is accuracy, not division.
        </p>
      </div>

      {/* Hadith banner */}
      <div className="mb-10 rounded-xl border border-iw-border bg-iw-surface/30 p-6">
        <blockquote className="italic text-iw-text-secondary">
          &ldquo;My Ummah will divide into 73 sects. All will be in the Fire except one.&rdquo;
          They asked: &ldquo;Which one, O Messenger of Allah?&rdquo; He said: &ldquo;Those upon
          what I and my companions are upon today.&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-iw-text-muted">
          Sunan al-Tirmidhi 2641, authenticated by Imam al-Albani
        </p>
      </div>

      {/* Status legend */}
      <div className="mb-10 flex flex-wrap gap-3">
        {(Object.keys(STATUS_COLORS) as SectData['status'][]).map((status) => (
          <span
            key={status}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        ))}
      </div>

      <div className="space-y-16">
        {/* ═══════════════════════════════════════════════════════════
            SECTION A — Ahl us-Sunnah wal-Jama'ah (The Saved Sect)
        ════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon="🟢"
            title="Section A — The Saved Sect: Ahl us-Sunnah wal-Jama'ah"
            subtitle="The mainstream body of Muslims following the Quran, Sunnah, and understanding of the Companions."
            variant="green"
          />

          <p className="mb-6 text-sm text-iw-text-secondary">
            Ahl us-Sunnah wal-Jama&apos;ah is not defined by a label — it is defined by
            methodology: following the Quran and Sunnah upon the understanding of the Companions
            (Sahabah) and their successors (Tabi&apos;un). It encompasses three accepted schools of
            aqeedah (Athari, Ash&apos;ari, Maturidi) and the four major schools of fiqh. The four
            madhabs are not sects — they are different scholarly approaches to deriving rulings from
            the same sources.
          </p>

          {/* Aqeedah schools */}
          <h3 className="mb-3 text-base font-semibold text-white">Aqeedah Schools</h3>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ahlussunnah.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>

          {/* Fiqh schools */}
          <h3 className="mb-3 text-base font-semibold text-white">
            Schools of Jurisprudence (Fiqh)
          </h3>
          <p className="mb-4 text-sm text-iw-text-secondary">
            The four major madhabs — and two historical schools — all represent legitimate
            approaches to Islamic law within Ahl us-Sunnah. Following any of the four living madhabs
            is sound.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {madhabs.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION B — The 72 Deviant Sects (Within the Fold)
        ════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon="🟡"
            title="Section B — The 72 Sects: Deviant But Within the Fold of Islam"
            subtitle="These groups are Muslim but have departed from the correct methodology in aqeedah or practice."
            variant="amber"
          />

          <div className="mb-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-iw-text-secondary">
            <strong className="text-amber-300">Important distinction:</strong> These groups are the
            &ldquo;sects in the Fire&rdquo; referenced in the hadith. Being deviant does not
            automatically place an individual outside Islam — scholars distinguish between the
            doctrinal positions of a group and the status of individual Muslims who may hold those
            positions out of ignorance or family tradition. The group positions are evaluated here,
            not individual hearts.
          </div>

          {/* B1 — Classical Deviant Sects */}
          <h3 className="mb-2 text-base font-semibold text-white">
            B1 — Classical Deviant Sects (Chronological)
          </h3>
          <p className="mb-4 text-xs text-iw-text-muted">
            The earliest departures from Ahl us-Sunnah methodology, beginning with the Khawarij in
            657 CE.
          </p>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classicalDeviant.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>

          {/* B2 — Shia Groups */}
          <h3 className="mb-2 text-base font-semibold text-white">B2 — Shia Groups</h3>
          <div className="mb-4 rounded-lg border border-iw-border bg-iw-surface/30 p-4 text-sm text-iw-text-secondary">
            <strong className="text-white">Scholarly nuance on Shia:</strong> Ahl us-Sunnah
            scholars distinguish carefully within the Shia umbrella. Ordinary Shia laymen who simply
            believe Ali had a stronger right to the caliphate, without cursing the Companions or
            invoking dead Imams, are not declared kafir by most scholars. The key lines are: (1)
            cursing the Sahabah, (2) claiming the Quran was corrupted, and (3) invoking dead Imams
            in du&apos;a. The Zaydi Shia are closest to Ahl us-Sunnah. The Rafidah — who cross all
            three lines — are treated separately under Section C.
          </div>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shiaDeviant.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>

          {/* B3 — Sufi Orders */}
          <h3 className="mb-2 text-base font-semibold text-white">B3 — Sufi Orders (Tariqahs)</h3>
          <div className="mb-4 rounded-lg border border-iw-border bg-iw-surface/30 p-4 text-sm text-iw-text-secondary">
            <strong className="text-white">Position on Sufi orders:</strong> The institution of
            organized tariqahs — with bay&apos;ah to a shaykh, secret dhikr formulas, and
            hierarchical spiritual progression — has no basis in the Quran, Sunnah, or practice of
            the Salaf. It is bid&apos;ah (innovation). Individual Sufi practices vary widely. The
            critical line is invoking deceased saints (istighatha) in du&apos;a — which is shirk
            regardless of the order. Individual Muslims within tariqahs who avoid this specific
            practice are not declared kafir.
          </div>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sufi.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>

          {/* B4 — Contemporary Movements */}
          <h3 className="mb-2 text-base font-semibold text-white">B4 — Contemporary Movements</h3>
          <p className="mb-4 text-xs text-iw-text-muted">
            Modern Islamic movements with varying relationships to Ahl us-Sunnah methodology.
          </p>

          {contemporaryMainstream.length > 0 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-400">
                Within Ahl us-Sunnah
              </p>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contemporaryMainstream.map((sect) => (
                  <SectCard key={sect.id} sect={sect} />
                ))}
              </div>
            </>
          )}

          {contemporaryDeviant.length > 0 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-amber-400">
                Deviant — within the fold
              </p>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contemporaryDeviant.map((sect) => (
                  <SectCard key={sect.id} sect={sect} />
                ))}
              </div>
            </>
          )}

          {contemporaryRejected.length > 0 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-red-400">
                Outside the fold
              </p>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contemporaryRejected.map((sect) => (
                  <SectCard key={sect.id} sect={sect} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION C — Outside the Fold of Islam
        ════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon="🔴"
            title="Section C — Outside the Fold of Islam"
            subtitle="Groups NOT considered Muslim by unanimous or near-unanimous scholarly consensus."
            variant="red"
          />

          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-iw-text-secondary">
            <strong className="text-red-300">Scholarly consensus on these groups:</strong> The
            following groups use Islamic terminology but have departed from the foundational beliefs
            of Islam — whether by claiming prophethood after Muhammad ﷺ (violating Khatam
            al-Nubuwwah), deifying human beings (violating Tawhid), claiming the Quran was corrupted
            (contradicting Quran 15:9), or abandoning the Five Pillars and core Islamic practice.
            Calling them &ldquo;Muslim sects&rdquo; would be inaccurate. This is not an editorial
            judgment — it reflects the unanimous position of classical and contemporary Islamic
            scholarship across all schools.
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Rafidah first (from shia category but rejected) */}
            {shiaRejected.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
            {/* Then all outside-fold entries */}
            {outsideFold.map((sect) => (
              <SectCard key={sect.id} sect={sect} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer note */}
      <div className="mt-16 border-t border-iw-border pt-8 text-xs text-iw-text-muted">
        <p>
          This page presents the positions of classical Ahl us-Sunnah scholarship based on primary
          sources. Academic tone is maintained throughout. The goal is clarity and accuracy, not
          incitement. Individual Muslims are not judged here — only documented group positions and
          doctrines are evaluated. For individual rulings, consult a qualified scholar.
        </p>
      </div>
    </div>
  )
}
