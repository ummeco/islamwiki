/**
 * ProphetCardsIsland.tsx — Astro island port of components/history/prophet-cards.tsx.
 *
 * PURPOSE: Card grid of the prophets named in the Quran. Mechanical swap only:
 *   next/link <Link href> → native <a href>. Static markup; rendered as an island so
 *   the parent history tab switcher can mount it. All copy preserved verbatim.
 * INPUTS: events (TimelineEvent[]) serialized on the server page.
 * CONSTRAINTS: No next/* imports.
 * REF: ports components/history/prophet-cards.tsx · D-P2-STACK-CANON
 */
interface TimelineEvent {
  id: number
  slug: string
  title_en: string
  title_ar: string
  description_en: string
  period: string
  section: string
  severity: 1 | 2 | 3
  place_name?: string
  datePrimary?: string
  dateSecondary?: string
  people_slug?: string
}

export default function ProphetCardsIsland({ events }: { events: TimelineEvent[] }) {
  return (
    <div>
      <p className="mb-6 text-xs text-iw-text-muted">
        {events.length} prophet{events.length !== 1 ? 's' : ''} mentioned by name in the Quran
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((prophet, index) => (
          <a
            key={prophet.id}
            href={`/history/${prophet.slug}`}
            className="group relative rounded-xl border border-iw-border bg-iw-surface/60 p-5 transition-all hover:border-iw-accent/40 hover:bg-iw-surface"
          >
            <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-iw-accent/10 text-[11px] font-bold text-iw-accent">
              {index + 1}
            </span>

            <p className="arabic-text mb-1 text-xl text-white/70" lang="ar" dir="rtl">
              {prophet.title_ar}
            </p>

            <h3 className="text-base font-semibold text-white group-hover:text-iw-accent transition-colors">
              {prophet.title_en}
            </h3>

            <p className="mt-0.5 text-xs text-iw-text-muted">{prophet.period}</p>

            <p className="mt-2 line-clamp-3 text-sm text-iw-text-secondary leading-relaxed">
              {prophet.description_en}
            </p>

            {prophet.place_name && (
              <p className="mt-2 flex items-center gap-1 text-xs text-iw-text-muted">
                <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {prophet.place_name}
              </p>
            )}

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-iw-accent opacity-0 group-hover:opacity-100 transition-opacity">
              Read biography
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-iw-border/50 bg-iw-surface/30 p-4 text-sm text-iw-text-muted">
        <p>
          These are the 25 prophets and messengers mentioned by name in the Quran. Islamic tradition holds that
          Allah sent 124,000 prophets throughout history — these are those whose names are preserved in the
          final revelation. All were human beings sent to call their people to the worship of Allah alone.
        </p>
      </div>
    </div>
  )
}
