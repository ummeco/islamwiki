import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeerahEventBySlug, getSeerahEvents } from '@/lib/data/seerah'
import { getSeerahContent } from '@/lib/data/seerah-content'
import { formatIslamicDate } from '@/lib/dates/hijri'

interface Props {
  params: Promise<{ event: string }>
}

export async function generateStaticParams() {
  return getSeerahEvents().map((e) => ({ event: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { event: slug } = await params
  const event = getSeerahEventBySlug(slug)
  if (!event) return {}
  const { primary, secondary } = formatIslamicDate(event)
  const dateLabel = secondary ? `${primary} (${secondary})` : primary
  return {
    title: event.title_en,
    description: `${event.title_en}${dateLabel ? ` — ${dateLabel}` : ''}. ${event.description_en.slice(0, 160)}`,
  }
}

export default async function SeerahEventPage({ params }: Props) {
  const { event: slug } = await params
  const event = getSeerahEventBySlug(slug)
  if (!event) notFound()

  // Load full markdown content if a content file exists
  const fullContent = getSeerahContent(slug)

  // Get sorted events for prev/next
  const allEvents = getSeerahEvents()
  const idx = allEvents.findIndex((e) => e.slug === slug)
  const prevEvent = idx > 0 ? allEvents[idx - 1] : null
  const nextEvent = idx < allEvents.length - 1 ? allEvents[idx + 1] : null

  return (
    <div className="section-container py-12">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/seerah" className="hover:text-iw-text">
          Seerah
        </Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{event.title_en}</span>
      </nav>

      {/* Top prev/next navigation */}
      <div className="mb-6 flex items-center justify-between">
        {prevEvent ? (
          <Link
            href={`/seerah/${prevEvent.slug}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="max-w-[200px] truncate">{prevEvent.title_en}</span>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-xs text-iw-text-muted">
          Event {idx + 1} of {allEvents.length}
        </span>

        {nextEvent ? (
          <Link
            href={`/seerah/${nextEvent.slug}`}
            className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent"
          >
            <span className="max-w-[200px] truncate">{nextEvent.title_en}</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            {(() => {
              const { primary, secondary } = formatIslamicDate(event)
              return primary ? (
                <span className="text-sm font-medium text-iw-accent">
                  {primary}
                  {secondary && (
                    <span className="ml-1 font-normal text-iw-text-muted/70">
                      ({secondary})
                    </span>
                  )}
                </span>
              ) : null
            })()}
            <span
              className={`badge ${
                event.significance === 'major'
                  ? 'bg-amber-500/15 text-amber-400'
                  : event.significance === 'moderate'
                    ? 'bg-iw-accent/10 text-iw-accent'
                    : 'bg-iw-surface text-iw-text-secondary'
              }`}
            >
              {event.significance}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{event.title_en}</h1>
          {event.title_ar && (
            <p className="arabic-text mt-2 text-xl text-white/80">
              {event.title_ar}
            </p>
          )}
        </div>

        {/* Location */}
        {event.place_name && (
          <div className="mb-6 flex items-center gap-2 text-sm text-iw-text-secondary">
            <svg
              className="h-4 w-4 text-iw-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {event.place_name}
          </div>
        )}

        {/* Content: full markdown (SC-1 through SC-15) or description_en fallback */}
        {fullContent ? (
          <div className="prose prose-invert max-w-none text-iw-text-secondary leading-relaxed">
            {(() => {
              const lines = fullContent.split('\n')
              const nodes: React.ReactNode[] = []
              let i = 0
              while (i < lines.length) {
                const line = lines[i]
                if (line.startsWith('## ')) {
                  nodes.push(
                    <h2 key={i} className="mt-8 text-xl font-bold text-white">
                      {line.slice(3)}
                    </h2>
                  )
                  i++
                } else if (line.startsWith('### ')) {
                  nodes.push(
                    <h3 key={i} className="mt-6 text-base font-semibold text-white/90">
                      {line.slice(4)}
                    </h3>
                  )
                  i++
                } else if (line.startsWith('- ')) {
                  const start = i
                  const texts: string[] = []
                  while (i < lines.length && lines[i].startsWith('- ')) {
                    texts.push(lines[i].slice(2))
                    i++
                  }
                  nodes.push(
                    <ul key={start} className="ml-4 list-disc space-y-1 text-iw-text-secondary">
                      {texts.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  )
                } else if (line.trim() === '') {
                  nodes.push(<br key={i} />)
                  i++
                } else {
                  nodes.push(
                    <p key={i} className="leading-relaxed text-iw-text-secondary">
                      {line}
                    </p>
                  )
                  i++
                }
              }
              return nodes
            })()}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-iw-text-secondary leading-relaxed">
            <p>{event.description_en}</p>
          </div>
        )}

        {/* Sources */}
        {event.sources && event.sources.length > 0 && (
          <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface/50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Sources</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-iw-text-secondary">
              {event.sources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom prev/next navigation */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-iw-border pt-6">
          {prevEvent ? (
            <Link
              href={`/seerah/${prevEvent.slug}`}
              className="group rounded-lg border border-iw-border p-4 transition-colors hover:border-iw-text-muted/20"
            >
              <span className="text-xs text-iw-text-muted">Previous Event</span>
              <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
                {prevEvent.title_en}
              </p>
              {(() => {
                const { primary } = formatIslamicDate(prevEvent)
                return primary ? (
                  <p className="mt-0.5 text-xs text-iw-text-muted">{primary}</p>
                ) : null
              })()}
            </Link>
          ) : (
            <div />
          )}
          {nextEvent ? (
            <Link
              href={`/seerah/${nextEvent.slug}`}
              className="group rounded-lg border border-iw-border p-4 text-right transition-colors hover:border-iw-text-muted/20"
            >
              <span className="text-xs text-iw-text-muted">Next Event</span>
              <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">
                {nextEvent.title_en}
              </p>
              {(() => {
                const { primary } = formatIslamicDate(nextEvent)
                return primary ? (
                  <p className="mt-0.5 text-xs text-iw-text-muted">{primary}</p>
                ) : null
              })()}
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}
