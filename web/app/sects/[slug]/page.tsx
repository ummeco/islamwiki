import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSectBySlug, getSects } from '@/lib/data/sects'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getSects().map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const sect = getSectBySlug(slug)
  if (!sect) return {}
  return {
    title: `${sect.name_en} — Islamic Groups`,
    description: sect.description_en.slice(0, 160),
    alternates: { languages: getHreflangAlternates(`/sects/${slug}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: sect.name_en, section: 'Sects', subtitle: 'Islamic Groups & Movements' }), width: 1200, height: 630 }],
    },
  }
}

export default async function SectPage({ params }: Props) {
  const { slug } = await params
  const sect = getSectBySlug(slug)
  if (!sect) notFound()

  const allSects = getSects()
  const children = allSects.filter((s) => s.parent_sect_id === sect.id)
  const parent = sect.parent_sect_id
    ? allSects.find((s) => s.id === sect.parent_sect_id)
    : null

  const statusColors: Record<string, string> = {
    mainstream: 'bg-emerald-500/20 text-emerald-300',
    accepted: 'bg-blue-500/20 text-blue-300',
    deviant: 'bg-amber-500/20 text-amber-300',
    rejected: 'bg-red-500/20 text-red-300',
  }

  const statusLabels: Record<string, string> = {
    mainstream: 'Mainstream',
    accepted: 'Accepted',
    deviant: 'Deviant',
    rejected: 'Outside the Fold',
  }

  return (
    <div className="section-container py-12">
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/sects" className="hover:text-iw-text">Sects</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{sect.name_en}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{sect.name_en}</h1>
            <span className={`badge ${statusColors[sect.status] ?? 'bg-gray-500/20 text-gray-300'}`}>
              {statusLabels[sect.status] ?? sect.status}
            </span>
          </div>
          {sect.name_ar && (
            <p className="arabic-text mt-2 text-xl text-white/80">{sect.name_ar}</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Overview</h2>
            <p className="text-iw-text-secondary">{sect.description_en}</p>
          </div>

          {sect.key_beliefs && sect.key_beliefs.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Key Beliefs</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-iw-text-secondary">
                {sect.key_beliefs.map((belief, i) => (
                  <li key={i}>{belief}</li>
                ))}
              </ul>
            </div>
          )}

          {sect.scholarly_evaluation && (
            <div className="rounded-xl border border-iw-border bg-iw-surface/50 p-5">
              <h2 className="mb-3 text-lg font-semibold text-white">Scholarly Evaluation</h2>
              <p className="text-sm leading-relaxed text-iw-text-secondary">{sect.scholarly_evaluation}</p>
            </div>
          )}

          {sect.key_figures && sect.key_figures.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Key Figures</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-iw-text-secondary">
                {sect.key_figures.map((figure: string, i: number) => (
                  <li key={i}>{figure}</li>
                ))}
              </ul>
            </div>
          )}

          {sect.sources && sect.sources.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Sources</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-iw-text-secondary">
                {sect.sources.map((src: string, i: number) => (
                  <li key={i}>{src}</li>
                ))}
              </ul>
            </div>
          )}

          {parent && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Parent Group</h2>
              <Link
                href={`/sects/${parent.slug}`}
                className="text-iw-accent hover:text-white"
              >
                {parent.name_en}
              </Link>
            </div>
          )}

          {sect.founder_name && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Founder</h2>
              <p className="text-iw-text-secondary">{sect.founder_name}</p>
            </div>
          )}

          {sect.founded_year_ce && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Founded</h2>
              <p className="text-iw-text-secondary">
                {sect.founded_year_ah ? `${sect.founded_year_ah}h` : `${sect.founded_year_ce} CE`}
                {sect.founded_year_ah && sect.founded_year_ce ? ` (${sect.founded_year_ce} CE)` : ''}
              </p>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Sub-Groups</h2>
              <div className="space-y-2">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/sects/${child.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-iw-border p-3 text-sm transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                  >
                    <span className="text-iw-text">{child.name_en}</span>
                    <span className={`badge text-xs ${statusColors[child.status] ?? 'bg-gray-500/20 text-gray-300'}`}>
                      {statusLabels[child.status] ?? child.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
