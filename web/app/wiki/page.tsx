import type { Metadata } from 'next'
import { getWikiPages } from '@/lib/data/wiki'
import { WikiGrid } from '@/components/listings/wiki-grid'

export const metadata: Metadata = {
  title: 'Wiki — Islamic Encyclopedia',
  description:
    'Community-edited encyclopedia of Islamic concepts, terminology, and topics. Scholar-verified and open for contributions.',
}

export default function WikiIndexPage() {
  const pages = getWikiPages()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Wiki</h1>
        <p className="mt-2 text-iw-text-secondary">
          Community-edited encyclopedia of Islamic concepts, terminology, and topics.
        </p>
      </div>

      <WikiGrid pages={pages} />
    </div>
  )
}
