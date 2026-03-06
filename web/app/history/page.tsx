import type { Metadata } from 'next'
import { getHistoryEvents } from '@/lib/data/seerah'
import { formatIslamicDate } from '@/lib/dates/hijri'

export const metadata: Metadata = {
  title: 'Islamic History',
  description:
    'Major events in Islamic history — from the rightly-guided caliphs to the Crusades, the Ottoman Empire, and the modern era. Chronological timeline with maps.',
}

export default function HistoryPage() {
  const events = getHistoryEvents()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Islamic History</h1>
        <p className="mt-2 text-iw-text-secondary">
          Major events in Islamic history from the era of the Rightly-Guided Caliphs onward —
          conquests, dynasties, scholars, battles, and the modern Muslim world.
          For the life of the Prophet ﷺ, see{' '}
          <a href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
            Seerah
          </a>
          .
        </p>
      </div>

      {/* Timeline list */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-4 rounded-xl border border-iw-border bg-iw-surface p-4 transition-colors hover:border-iw-text-muted/30"
          >
            <div className="w-24 flex-shrink-0 text-xs text-iw-text-muted">
              {(() => {
                const { primary, secondary } = formatIslamicDate(event)
                return primary ? (
                  <>
                    <span className="font-medium text-iw-text-secondary">{primary}</span>
                    {secondary && (
                      <span className="mt-0.5 block text-iw-text-muted/60">{secondary}</span>
                    )}
                  </>
                ) : (
                  <span className="opacity-40">—</span>
                )
              })()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white">{event.title_en}</p>
              {event.place_name && (
                <p className="mt-0.5 text-xs text-iw-text-muted">{event.place_name}</p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-iw-text-secondary">
                {event.description_en}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
