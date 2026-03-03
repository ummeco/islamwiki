import Link from 'next/link'
import type { Metadata } from 'next'
import { getSects } from '@/lib/data/sects'

export const metadata: Metadata = {
  title: 'Sects — Islamic Groups & Movements',
  description:
    'Chronological overview of Islamic sects and movements: historical context, key beliefs, and scholarly evaluations. Tree view of group relationships.',
}

export default function SectsIndexPage() {
  const sects = getSects()

  const statusColors = {
    mainstream: 'bg-emerald-500/20 text-emerald-300',
    accepted: 'bg-blue-500/20 text-blue-300',
    deviant: 'bg-yellow-500/20 text-yellow-300',
    rejected: 'bg-red-500/20 text-red-300',
  }

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Islamic Groups &amp; Sects
        </h1>
        <p className="mt-2 text-iw-text-secondary">
          A chronological overview of groups and movements in Islamic history.
          Scholarly evaluations based on classical sources. Presented for education, not division.
        </p>
      </div>

      {/* Status legend */}
      <div className="mb-8 flex flex-wrap gap-3">
        {Object.entries(statusColors).map(([status, cls]) => (
          <span key={status} className={`badge ${cls} capitalize`}>
            {status}
          </span>
        ))}
      </div>

      {/* Tree view */}
      <div className="space-y-4">
        {sects
          .filter((s) => !s.parent_sect_id)
          .map((sect) => {
            const children = sects.filter((s) => s.parent_sect_id === sect.id)
            return (
              <div key={sect.id}>
                <Link
                  href={`/sects/${sect.slug}`}
                  className="card group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-iw-text group-hover:text-white">
                        {sect.name_en}
                      </h2>
                      <span className={`badge ${statusColors[sect.status]}`}>
                        {sect.status}
                      </span>
                    </div>
                    {sect.name_ar && (
                      <p className="arabic-text text-sm text-white/70">{sect.name_ar}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-iw-text-secondary">
                      {sect.description_en}
                    </p>
                  </div>
                </Link>

                {/* Children */}
                {children.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2 border-l border-iw-border pl-4">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/sects/${child.slug}`}
                        className="block rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-iw-text">
                            {child.name_en}
                          </span>
                          <span className={`badge text-xs ${statusColors[child.status]}`}>
                            {child.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
