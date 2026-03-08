import type { Metadata } from 'next'
import Link from 'next/link'
import { getHistoryEvents, getHistoryPeriods } from '@/lib/data/history'
import { HistoryTimeline } from '@/components/history/history-timeline'
import { formatIslamicDate } from '@/lib/dates/hijri'

export const metadata: Metadata = {
  title: 'Islamic History',
  description:
    'Major events in Islamic history from the Rashidun Caliphate to the modern era. Interactive timeline with period filters and severity levels.',
}

export default function HistoryPage() {
  const events = getHistoryEvents()
  const periods = getHistoryPeriods()

  const serialized = events.map((e) => {
    const { primary, secondary } = formatIslamicDate(e)
    return {
      id: e.id,
      slug: e.slug,
      title_en: e.title_en,
      title_ar: e.title_ar,
      description_en: e.description_en,
      period: e.period,
      severity: e.severity,
      place_name: e.place_name,
      datePrimary: primary,
      dateSecondary: secondary,
    }
  })

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Islamic History</h1>
        <p className="mt-2 text-iw-text-secondary">
          From the pre-Islamic prophets through the Rashidun Caliphate to the modern era.
          For the life of the Prophet &#xFDFA;, see{' '}
          <Link href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
            Seerah
          </Link>.
        </p>
      </div>

      <HistoryTimeline events={serialized} periods={periods} />
    </div>
  )
}
