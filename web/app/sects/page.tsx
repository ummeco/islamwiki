import type { Metadata } from 'next'
import { getSects } from '@/lib/data/sects'
import { SectTree } from '@/components/sects/sect-tree'

export const metadata: Metadata = {
  title: 'Sects — Islamic Groups & Movements',
  description:
    'Chronological overview of Islamic sects and movements: historical context, key beliefs, and scholarly evaluations. Tree view of group relationships.',
}

const STATUS_COLORS: Record<string, string> = {
  mainstream: 'bg-emerald-500/20 text-emerald-300',
  accepted: 'bg-blue-500/20 text-blue-300',
  deviant: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
}

export default function SectsIndexPage() {
  const sects = getSects()

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
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={`badge ${cls} capitalize`}>
            {status}
          </span>
        ))}
      </div>

      <SectTree sects={sects} />
    </div>
  )
}
