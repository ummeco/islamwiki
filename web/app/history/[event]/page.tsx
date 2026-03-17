import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHistoryEventBySlug, getAllHistoryEvents } from '@/lib/data/history'
import { getHistoryContent } from '@/lib/data/seerah-content'
import { formatIslamicDate } from '@/lib/dates/hijri'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'
import { HistoryEventJsonLd } from '@/components/seo/json-ld'
import { renderContent, extractHeadings, type Heading } from '@/lib/render-content'
import { getLocale } from '@/lib/i18n/get-locale'

interface Props {
  params: Promise<{ event: string }>
}

const SEVERITY_LABEL: Record<number, string> = { 1: 'Minor', 2: 'Moderate', 3: 'Major' }
const SEVERITY_STYLE: Record<number, string> = {
  1: 'bg-iw-surface text-iw-text-secondary',
  2: 'bg-iw-accent/10 text-iw-accent',
  3: 'bg-amber-500/15 text-amber-400',
}

export async function generateStaticParams() {
  return getAllHistoryEvents().map((e) => ({ event: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { event: slug } = await params
  const event = getHistoryEventBySlug(slug)
  if (!event) return {}
  const { primary, secondary } = formatIslamicDate(event)
  const dateLabel = secondary ? `${primary} (${secondary})` : primary
  return {
    title: `${event.title_en} — Islamic History`,
    description: `${event.title_en}${dateLabel ? ` — ${dateLabel}` : ''}. ${event.description_en.slice(0, 160)}`,
    alternates: { languages: getHreflangAlternates(`/history/${slug}`) },
    openGraph: {
      images: [{ url: ogImageUrl({ title: event.title_en, section: 'History', arabic: event.title_ar, subtitle: `${event.period} — ${dateLabel}` }) }],
    },
  }
}

export default async function HistoryEventPage({ params }: Props) {
  const { event: slug } = await params
  const [event, locale] = [getHistoryEventBySlug(slug), await getLocale()]
  if (!event) notFound()

  const fullContent = getHistoryContent(slug, locale)
  const headings = fullContent ? extractHeadings(fullContent) : []

  const allEvents = getAllHistoryEvents()
  const sectionEvents = allEvents.filter((e) => e.section === event.section)
  const idx = sectionEvents.findIndex((e) => e.slug === slug)
  const prevEvent = idx > 0 ? sectionEvents[idx - 1] : null
  const nextEvent = idx < sectionEvents.length - 1 ? sectionEvents[idx + 1] : null

  const { primary, secondary } = formatIslamicDate(event)

  return (
    <>
      <HistoryEventJsonLd
        name={event.title_en}
        nameAr={event.title_ar}
        description={event.description_en.slice(0, 200)}
        url={`/history/${slug}`}
        startDate={event.date_ce ?? (event.year_ce ? String(event.year_ce) : undefined)}
        locationName={event.place_name}
      />
    <div className="section-container py-12">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-iw-text-secondary">
        <Link href="/history" className="hover:text-iw-text">History</Link>
        <span className="mx-2">/</span>
        <span className="text-iw-text-muted">{event.period}</span>
        <span className="mx-2">/</span>
        <span className="text-iw-text">{event.title_en}</span>
      </nav>

      {/* Prev/next */}
      <div className="mb-6 flex items-center justify-between">
        {prevEvent ? (
          <Link href={`/history/${prevEvent.slug}`} className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="max-w-[200px] truncate">{prevEvent.title_en}</span>
          </Link>
        ) : <div />}
        <span className="text-xs text-iw-text-muted">Event {idx + 1} of {sectionEvents.length}</span>
        {nextEvent ? (
          <Link href={`/history/${nextEvent.slug}`} className="flex items-center gap-1.5 text-sm text-iw-text-secondary hover:text-iw-accent">
            <span className="max-w-[200px] truncate">{nextEvent.title_en}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-10 xl:gap-16">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-iw-accent/10 px-3 py-0.5 text-xs font-medium text-iw-accent">
                {event.period}
              </span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${SEVERITY_STYLE[event.severity]}`}>
                {SEVERITY_LABEL[event.severity]}
              </span>
              {primary && (
                <span className="text-sm text-iw-text-muted">
                  {primary}
                  {secondary && <span className="ml-1 text-iw-text-muted/60">({secondary})</span>}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white">
              {locale === 'ar' && event.title_ar ? event.title_ar : locale === 'id' && event.title_id ? event.title_id : event.title_en}
            </h1>
            {locale !== 'ar' && event.title_ar && (
              <p className="arabic-text mt-2 text-xl text-white/80">{event.title_ar}</p>
            )}
          </div>

          {/* Location */}
          {event.place_name && (
            <div className="mb-6 flex items-center gap-2 text-sm text-iw-text-secondary">
              <svg className="h-4 w-4 text-iw-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.place_name}
            </div>
          )}

          {/* People cross-link */}
          {event.people_slug && (
            <div className="mb-6">
              <Link
                href={`/people/${event.people_slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-iw-border bg-iw-surface px-3 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-accent/40 hover:text-iw-accent"
              >
                <svg className="h-4 w-4 text-iw-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View biography →
              </Link>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none leading-relaxed text-iw-text-secondary">
            {fullContent
              ? renderContent(fullContent)
              : <p>{event.description_en}</p>
            }
          </div>

          {/* Cross-ref to seerah — only for islamic-history / modern events that share slugs */}
          {(event.section === 'islamic-history' || event.section === 'modern') && (
            <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface/50 p-4">
              <p className="text-sm text-iw-text-secondary">
                For the Prophetic era, see the{' '}
                <Link href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
                  Seerah timeline
                </Link>.
              </p>
            </div>
          )}

          {/* Bottom prev/next */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-iw-border pt-6">
            {prevEvent ? (
              <Link href={`/history/${prevEvent.slug}`} className="group rounded-lg border border-iw-border p-4 transition-colors hover:border-iw-text-muted/20">
                <span className="text-xs text-iw-text-muted">Previous</span>
                <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">{prevEvent.title_en}</p>
              </Link>
            ) : <div />}
            {nextEvent ? (
              <Link href={`/history/${nextEvent.slug}`} className="group rounded-lg border border-iw-border p-4 text-right transition-colors hover:border-iw-text-muted/20">
                <span className="text-xs text-iw-text-muted">Next</span>
                <p className="mt-1 text-sm font-medium text-iw-text-secondary group-hover:text-iw-accent">{nextEvent.title_en}</p>
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Sticky TOC sidebar */}
        {headings.length > 2 && (
          <aside className="hidden w-52 flex-shrink-0 xl:block">
            <div className="sticky top-28">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-iw-text-muted">
                On this page
              </p>
              <nav className="space-y-1 border-l border-iw-border/60 pl-3">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={[
                      'block py-0.5 text-[13px] leading-snug text-iw-text-muted transition-colors hover:text-iw-accent',
                      h.level === 3 ? 'pl-3 text-[12px]' : '',
                    ].join(' ')}
                  >
                    {h.text}
                  </a>
                ))}
                <a
                  href="#"
                  className="mt-4 block py-0.5 text-[11px] text-iw-text-muted/40 transition-colors hover:text-iw-text-muted"
                >
                  ↑ Back to top
                </a>
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
    </>
  )
}
