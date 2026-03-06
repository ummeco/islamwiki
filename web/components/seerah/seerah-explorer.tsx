'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { SeerahMapEvent } from './seerah-map'

const SeerahMap = dynamic(
  () => import('./seerah-map').then((m) => ({ default: m.SeerahMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#080f09]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-iw-border border-t-iw-accent" />
          <p className="text-xs text-iw-text-muted">Loading map…</p>
        </div>
      </div>
    ),
  }
)

interface SeerahExplorerProps {
  events: SeerahMapEvent[]
}

type Filter = 'all' | 'major'

// ── Date formatting — Hijri first, Gregorian as secondary ──────────────────

function formatDate(event: SeerahMapEvent): { primary: string; ce?: string } {
  let primary: string
  if (event.date_ah) {
    primary = event.date_ah
  } else if (event.year_ah != null) {
    if (event.year_ah < 0) primary = `${Math.abs(event.year_ah)} BH`
    else if (event.year_ah === 0) primary = 'Year of Hijra (1 AH)'
    else primary = `${event.year_ah} AH`
  } else {
    primary = event.date_ce ?? ''
  }
  const ce = event.date_ce ?? undefined
  return { primary, ce: event.year_ah != null ? ce : undefined }
}

// ── Significance styles ──────────────────────────────────────────────────────

const SIG_DOT: Record<SeerahMapEvent['significance'], string> = {
  major: 'bg-iw-accent',
  moderate: 'bg-iw-accent/55',
  minor: 'bg-iw-accent/25',
}

// ── Component ────────────────────────────────────────────────────────────────

export function SeerahExplorer({ events }: SeerahExplorerProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set())
  const activeRowRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const explorerRef = useRef<HTMLDivElement>(null)

  const filteredEvents =
    filter === 'major' ? events.filter((e) => e.significance === 'major') : events

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(filteredEvents.length - 1, index)))
      // Return focus to list after button/row clicks so arrow keys keep working
      setTimeout(() => listRef.current?.focus({ preventScroll: true }), 50)
    },
    [filteredEvents.length]
  )

  const toggleExpand = useCallback((slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  // Reset to first event + refocus when filter changes
  useEffect(() => {
    setActiveIndex(0)
    listRef.current?.focus({ preventScroll: true })
  }, [filter])

  // Auto-scroll active row into view
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, filter])

  // Auto-focus list on mount + periodic refocus so arrow keys always work
  useEffect(() => {
    listRef.current?.focus({ preventScroll: true })

    // Every 2s: if focus drifted outside the explorer, bring it back to the list
    const id = setInterval(() => {
      if (explorerRef.current && !explorerRef.current.contains(document.activeElement)) {
        listRef.current?.focus({ preventScroll: true })
      }
    }, 2000)

    return () => clearInterval(id)
  }, [])

  // Keyboard navigation — window listener fires regardless of focused element
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(filteredEvents.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filteredEvents.length])

  const active = filteredEvents[activeIndex]

  return (
    <div ref={explorerRef} className="flex h-full w-full overflow-hidden">
      {/* ── LEFT PANEL: Playlist ── */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-iw-border bg-iw-bg lg:w-[360px]">

        {/* Panel header */}
        <div className="flex-shrink-0 border-b border-iw-border bg-iw-bg px-4 pb-3 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-[11px] font-bold uppercase tracking-widest text-iw-accent">
                The Seerah
              </h1>
              <p className="mt-0.5 text-[10px] text-iw-text-muted">
                Life of Prophet Muhammad ﷺ
              </p>
            </div>

            {/* Filter toggle */}
            <div className="flex items-center rounded-lg border border-iw-border bg-iw-surface p-0.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={[
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                  filter === 'all'
                    ? 'bg-iw-accent/20 text-iw-accent'
                    : 'text-iw-text-muted hover:text-iw-text-secondary',
                ].join(' ')}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('major')}
                className={[
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                  filter === 'major'
                    ? 'bg-iw-accent/20 text-iw-accent'
                    : 'text-iw-text-muted hover:text-iw-text-secondary',
                ].join(' ')}
              >
                Major
              </button>
            </div>
          </div>
        </div>

        {/* Navigation controls — top position for easy access */}
        <div className="flex-shrink-0 border-b border-iw-border bg-iw-bg px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="flex flex-1 items-center justify-center rounded-lg border border-iw-border py-1.5 text-[12px] font-medium text-iw-text-secondary transition-colors hover:border-iw-border/80 hover:text-iw-text disabled:pointer-events-none disabled:opacity-30"
            >
              ← Prev
            </button>

            <span className="min-w-[44px] text-center text-[11px] tabular-nums text-iw-text-muted">
              {activeIndex + 1}
              <span className="text-iw-text-muted/50"> / </span>
              {filteredEvents.length}
            </span>

            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === filteredEvents.length - 1}
              className="flex flex-1 items-center justify-center rounded-lg bg-iw-accent py-1.5 text-[12px] font-semibold text-[#0D2F17] transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-iw-border">
            <div
              className="h-full rounded-full bg-iw-accent transition-all duration-300"
              // eslint-disable-next-line react/forbid-component-props
              style={{ width: `${((activeIndex + 1) / filteredEvents.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable event list — tabIndex={-1} so it can receive programmatic focus */}
        <div
          ref={listRef}
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto outline-none"
        >
          {filteredEvents.map((event, i) => {
            const isPast = i < activeIndex
            const isActive = i === activeIndex
            const isExpanded = isActive || expandedSlugs.has(event.slug)
            const { primary: dateStr, ce } = formatDate(event)

            return (
              <div
                key={event.id}
                ref={isActive ? activeRowRef : undefined}
                tabIndex={0}
                onClick={() => goTo(i)}
                onKeyDown={(e) => e.key === 'Enter' && goTo(i)}
                className={[
                  'cursor-pointer border-b border-iw-border/40 px-3 py-2.5 outline-none',
                  'transition-colors duration-150',
                  'focus-visible:ring-1 focus-visible:ring-iw-accent/50',
                  isActive
                    ? 'border-l-2 border-iw-accent bg-iw-elevated'
                    : isPast
                      ? 'hover:bg-iw-surface/60'
                      : 'hover:bg-iw-surface',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  {/* Event number */}
                  <span
                    className={[
                      'mt-0.5 min-w-[24px] text-right text-[10px] tabular-nums transition-colors duration-150',
                      isActive
                        ? 'font-semibold text-iw-accent'
                        : isPast
                          ? 'text-iw-text-muted/50'
                          : 'text-iw-text-muted',
                    ].join(' ')}
                  >
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Title row + expand toggle */}
                    <div className="flex items-start gap-1">
                      <p
                        className={[
                          'min-w-0 flex-1 text-[13px] leading-snug transition-colors duration-150',
                          isActive
                            ? 'font-semibold text-white'
                            : isPast
                              ? 'text-iw-text-muted/60'
                              : 'text-iw-text-secondary',
                        ].join(' ')}
                      >
                        {event.title_en}
                      </p>
                      {/* Expand / collapse toggle — independent of active state */}
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={(e) => toggleExpand(event.slug, e)}
                        className={[
                          'mt-0.5 flex-shrink-0 rounded p-0.5 text-[10px] leading-none transition-colors',
                          isExpanded
                            ? 'text-iw-accent'
                            : 'text-iw-text-muted/50 hover:text-iw-text-muted',
                        ].join(' ')}
                      >
                        {isExpanded ? '▾' : '▸'}
                      </button>
                    </div>

                    {/* Date (Hijri primary) + place */}
                    <p className="mt-0.5 text-[11px] text-iw-text-muted/65">
                      {dateStr}
                      {ce && (
                        <span className="text-iw-text-muted/40"> · {ce}</span>
                      )}
                      {event.place_name && (
                        <span> · {event.place_name}</span>
                      )}
                    </p>

                    {/* Expandable detail — CSS grid trick for smooth height animation */}
                    <div
                      className="grid transition-all duration-200 ease-in-out"
                      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-2.5 space-y-2">
                          {isActive && event.title_ar && (
                            <p
                              className="text-right font-[Amiri,serif] text-base leading-relaxed text-iw-text-secondary"
                              dir="rtl"
                            >
                              {event.title_ar}
                            </p>
                          )}
                          {event.description_en && (
                            <p
                              className={[
                                'text-[12px] leading-relaxed text-iw-text-secondary',
                                isActive ? 'line-clamp-5' : 'line-clamp-4',
                              ].join(' ')}
                            >
                              {event.description_en}
                            </p>
                          )}
                          <div className="flex items-center justify-between pb-0.5">
                            <Link
                              href={`/seerah/${event.slug}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-iw-accent transition-colors hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Full page →
                            </Link>
                            <span className="flex items-center gap-1 text-[10px] text-iw-text-muted">
                              <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${SIG_DOT[event.significance]}`}
                              />
                              {event.significance}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Significance dot — only on collapsed, non-active rows */}
                  {!isExpanded && (
                    <div
                      className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${SIG_DOT[event.significance]}`}
                    />
                  )}
                </div>
              </div>
            )
          })}

          {/* /history CTA — always at the bottom */}
          <div className="border-t border-iw-border/60 p-3">
            <div className="rounded-xl border border-iw-accent/15 bg-iw-surface/40 p-3">
              <p className="text-[11px] font-semibold text-white">The story continues…</p>
              <p className="mt-1 text-[10px] leading-relaxed text-iw-text-secondary">
                From the Rightly-Guided Caliphs to the present — conquests, dynasties, and the modern Muslim world.
              </p>
              <Link
                href="/history"
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-iw-accent transition-colors hover:text-white"
              >
                Continue to Islamic History →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Map ── */}
      <div className="relative min-w-0 flex-1 overflow-hidden bg-[#080f09]">
        {active && (
          <SeerahMap
            events={filteredEvents}
            activeIndex={activeIndex}
            onEventClick={goTo}
          />
        )}

        {/* Floating event badge */}
        {active && (
          <div className="pointer-events-none absolute left-3 top-3 z-[800]">
            <div className="rounded-xl border border-iw-border/60 bg-[rgba(13,47,23,0.88)] px-3 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-[12px] font-bold text-white">{active.title_en}</p>
              {(() => {
                const { primary, ce } = formatDate(active)
                return (
                  <p className="text-[10px] text-iw-text-muted">
                    {primary}
                    {ce && <span className="text-iw-text-muted/50"> · {ce}</span>}
                    {active.place_name && ` · ${active.place_name}`}
                  </p>
                )
              })()}
            </div>
          </div>
        )}

        {/* Route legend */}
        <div className="pointer-events-none absolute bottom-6 right-3 z-[800] space-y-1">
          <div className="rounded-lg border border-iw-border/40 bg-[rgba(13,47,23,0.75)] px-2.5 py-2 backdrop-blur-sm">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-iw-text-muted/70">
              Routes
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-px w-5 bg-iw-accent" />
                <span className="text-[10px] text-iw-text-muted/70">Prophet&apos;s journey</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-px w-5 bg-[#f5c842] opacity-80" />
                <span className="text-[10px] text-iw-text-muted/70">People to the Prophet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-px w-5 bg-[#7aeaff] opacity-75" />
                <span className="text-[10px] text-iw-text-muted/70">Sea route</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-px w-5 bg-[#d4d4ff] opacity-70" />
                <span className="text-[10px] text-iw-text-muted/70">Night Journey ✦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
