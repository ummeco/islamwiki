'use client'

import { useState, useMemo } from 'react'

interface TimelineEvent {
  id: number
  slug: string
  title_en: string
  title_ar: string
  description_en: string
  period: string
  severity: 1 | 2 | 3
  place_name?: string
  datePrimary: string
  dateSecondary?: string
}

const SEVERITY_LABELS: Record<number, string> = {
  3: 'Major',
  2: 'Moderate',
  1: 'Minor',
}

const SEVERITY_COLORS: Record<number, string> = {
  3: 'border-iw-accent/40 bg-iw-accent/5',
  2: 'border-iw-border bg-iw-surface',
  1: 'border-iw-border/50 bg-iw-surface/50',
}

const SEVERITY_DOT: Record<number, string> = {
  3: 'bg-iw-accent',
  2: 'bg-iw-text-secondary',
  1: 'bg-iw-text-muted/50',
}

export function HistoryTimeline({
  events,
  periods,
}: {
  events: TimelineEvent[]
  periods: string[]
}) {
  const [activePeriod, setActivePeriod] = useState<string>('all')
  const [minSeverity, setMinSeverity] = useState<number>(1)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (activePeriod !== 'all' && e.period !== activePeriod) return false
      if (e.severity < minSeverity) return false
      return true
    })
  }, [events, activePeriod, minSeverity])

  // Group by period for display
  const grouped = useMemo(() => {
    const groups: { period: string; events: TimelineEvent[] }[] = []
    let currentPeriod = ''
    for (const e of filtered) {
      if (e.period !== currentPeriod) {
        currentPeriod = e.period
        groups.push({ period: currentPeriod, events: [] })
      }
      groups[groups.length - 1].events.push(e)
    }
    return groups
  }, [filtered])

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Period filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActivePeriod('all')}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activePeriod === 'all'
                ? 'bg-iw-accent text-iw-bg font-medium'
                : 'bg-iw-surface text-iw-text-secondary hover:text-white'
            }`}
          >
            All Periods
          </button>
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePeriod(p)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activePeriod === p
                  ? 'bg-iw-accent text-iw-bg font-medium'
                  : 'bg-iw-surface text-iw-text-secondary hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-iw-text-muted">Show:</span>
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setMinSeverity(s)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                minSeverity === s
                  ? 'bg-iw-accent text-iw-bg font-medium'
                  : 'bg-iw-surface text-iw-text-secondary hover:text-white'
              }`}
            >
              {s === 1 ? 'All' : s === 2 ? 'Moderate+' : 'Major'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-xs text-iw-text-muted">
        {filtered.length} event{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <p className="py-12 text-center text-iw-text-muted">No events match the selected filters.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.period}>
              <h2 className="mb-3 text-lg font-semibold text-white">{group.period}</h2>
              <div className="relative ml-4 border-l border-iw-border/50 pl-6 space-y-3">
                {group.events.map((event) => (
                  <div
                    key={event.id}
                    className={`relative rounded-xl border p-4 transition-colors ${SEVERITY_COLORS[event.severity]}`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[31px] top-5 h-2.5 w-2.5 rounded-full ${SEVERITY_DOT[event.severity]}`}
                    />

                    <div className="flex items-start gap-3">
                      <div className="w-20 flex-shrink-0">
                        {event.datePrimary ? (
                          <div className="text-xs">
                            <span className="font-medium text-iw-text-secondary">{event.datePrimary}</span>
                            {event.dateSecondary && (
                              <span className="mt-0.5 block text-iw-text-muted/60">{event.dateSecondary}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-iw-text-muted/40">--</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{event.title_en}</p>
                        {event.title_ar && (
                          <p className="arabic-text mt-0.5 text-sm text-white/60" lang="ar" dir="rtl">
                            {event.title_ar}
                          </p>
                        )}
                        {event.place_name && (
                          <p className="mt-0.5 text-xs text-iw-text-muted">{event.place_name}</p>
                        )}
                        <p className="mt-1 line-clamp-2 text-sm text-iw-text-secondary">
                          {event.description_en}
                        </p>
                      </div>

                      <span className="flex-shrink-0 rounded-full bg-iw-surface px-2 py-0.5 text-[10px] text-iw-text-muted">
                        {SEVERITY_LABELS[event.severity]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
