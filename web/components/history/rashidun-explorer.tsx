'use client'

import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import dynamic from 'next/dynamic'
import type { RashidunMapEvent } from './rashidun-map'

export type { RashidunMapEvent }

const RashidunMap = dynamic(
  () => import('./rashidun-map').then((m) => ({ default: m.RashidunMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0f0a00]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#3a2a00] border-t-[#D4AF37]" />
          <p className="text-xs text-[#8a7030]">Loading map…</p>
        </div>
      </div>
    ),
  }
)

interface RashidunExplorerProps {
  events: RashidunMapEvent[]
}

type CaliphateFilter = 'all' | 'abu-bakr' | 'umar' | 'uthman' | 'ali'
type SectionFilter = 'all' | 'riddah' | 'conquest' | 'fitna'

// ── Caliphate label + colour helpers ─────────────────────────────────────────

const CALIPHATE_META: Record<
  Exclude<CaliphateFilter, 'all'>,
  { label: string; years: string; color: string; bg: string }
> = {
  'abu-bakr': {
    label: 'Abu Bakr',
    years: '11–13 AH',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.12)',
  },
  umar: {
    label: 'Umar',
    years: '13–23 AH',
    color: '#C8950A',
    bg: 'rgba(200,149,10,0.12)',
  },
  uthman: {
    label: 'Uthman',
    years: '23–35 AH',
    color: '#9A6E1A',
    bg: 'rgba(154,110,26,0.12)',
  },
  ali: {
    label: 'Ali',
    years: '35–40 AH',
    color: '#C87020',
    bg: 'rgba(200,112,32,0.12)',
  },
}

const SECTION_META: Record<
  Exclude<SectionFilter, 'all'>,
  { label: string; color: string }
> = {
  riddah:   { label: 'Riddah Wars',  color: '#c94040' },
  conquest: { label: 'Conquests',    color: '#D4AF37' },
  fitna:    { label: 'First Fitna',  color: '#e07b30' },
}

function getEventDotColor(event: RashidunMapEvent): string {
  if (event.section === 'fitna')   return '#e07b30'
  if (event.section === 'riddah')  return '#c94040'
  switch (event.caliphate) {
    case 'abu-bakr': return '#D4AF37'
    case 'umar':     return '#C8950A'
    case 'uthman':   return '#9A6E1A'
    case 'ali':      return '#C87020'
    default:         return '#D4AF37'
  }
}

function getOutcomeLabel(outcome: string | null | undefined): string {
  switch (outcome) {
    case 'muslim_victory':  return 'Muslim Victory'
    case 'muslim_defeat':   return 'Muslim Defeat'
    case 'ali_victory':     return 'Ali Victory'
    case 'inconclusive':    return 'Inconclusive'
    case 'martyrdom':       return 'Martyrdom'
    case 'treaty':          return 'Treaty'
    case 'administrative':  return 'Administrative'
    default:                return ''
  }
}

function getOutcomeStyle(outcome: string | null | undefined): string {
  switch (outcome) {
    case 'muslim_victory':  return 'bg-amber-500/15 text-amber-400'
    case 'ali_victory':     return 'bg-amber-500/15 text-amber-400'
    case 'muslim_defeat':   return 'bg-red-500/15 text-red-400'
    case 'inconclusive':    return 'bg-zinc-500/15 text-zinc-400'
    case 'martyrdom':       return 'bg-purple-500/15 text-purple-400'
    case 'treaty':          return 'bg-blue-500/15 text-blue-400'
    case 'administrative':  return 'bg-teal-500/15 text-teal-400'
    default:                return 'bg-zinc-500/15 text-zinc-400'
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export { RashidunExplorer as default }

export function RashidunExplorer({ events }: RashidunExplorerProps) {
  const [caliphateFilter, setCaliphateFilter] = useState<CaliphateFilter>('all')
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set())
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const activeRowRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const explorerRef = useRef<HTMLDivElement>(null)

  const filteredEvents = events.filter((e) => {
    if (caliphateFilter !== 'all' && e.caliphate !== caliphateFilter) return false
    if (sectionFilter !== 'all' && e.section !== sectionFilter) return false
    return true
  })

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(filteredEvents.length - 1, index)))
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

  const dismissIntro = useCallback(() => {
    startTransition(() => setShowIntro(false))
    try { localStorage.setItem('iw_rashidun_intro_seen', '1') } catch { /* noop */ }
  }, [])

  useEffect(() => {
    try {
      if (!localStorage.getItem('iw_rashidun_intro_seen')) {
        startTransition(() => setShowIntro(true))
      }
    } catch { /* localStorage unavailable */ }
  }, [])

  useEffect(() => {
    if (!showIntro) return
    const id = setTimeout(dismissIntro, 9000)
    return () => clearTimeout(id)
  }, [showIntro, dismissIntro])

  // Reset to first event + refocus when filters change
  useEffect(() => {
    startTransition(() => setActiveIndex(0))
    listRef.current?.focus({ preventScroll: true })
  }, [caliphateFilter, sectionFilter])

  // Auto-scroll active row into view
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, caliphateFilter, sectionFilter])

  // Auto-focus list on mount + periodic refocus
  useEffect(() => {
    listRef.current?.focus({ preventScroll: true })

    const id = setInterval(() => {
      if (explorerRef.current && !explorerRef.current.contains(document.activeElement)) {
        listRef.current?.focus({ preventScroll: true })
      }
    }, 2000)

    return () => clearInterval(id)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        if (overlayOpen) { setOverlayOpen(false); return }
        if (showIntro) { dismissIntro(); return }
      }
      if (showIntro) { dismissIntro(); return }
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
  }, [filteredEvents.length, overlayOpen, showIntro, dismissIntro])

  const active = filteredEvents[activeIndex]

  // Group events by caliphate for display
  const caliphateGroups = ['abu-bakr', 'umar', 'uthman', 'ali'] as const

  return (
    <div ref={explorerRef} className="flex h-full w-full overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="flex min-h-0 w-80 flex-shrink-0 flex-col overflow-hidden border-r border-[#3a2a00] bg-[#0f0a00] lg:w-[360px]">

        {/* Panel header */}
        <div className="flex-shrink-0 border-b border-[#3a2a00] bg-[#0f0a00] px-4 pb-3 pt-3.5">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
              Rashidun Caliphate
            </h2>
            <p className="mt-0.5 text-[10px] text-[#8a7030]">
              11–41 AH / 632–661 CE — The Four Rightly-Guided Caliphs
            </p>
          </div>

          {/* Caliphate filter pills */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setCaliphateFilter('all')}
              className={[
                'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                caliphateFilter === 'all'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-[#8a7030] hover:text-[#c49a20]',
              ].join(' ')}
            >
              All Caliphs
            </button>
            {caliphateGroups.map((c) => {
              const meta = CALIPHATE_META[c]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCaliphateFilter(c)}
                  className={[
                    'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                    caliphateFilter === c
                      ? 'ring-1'
                      : 'text-[#8a7030] hover:text-[#c49a20]',
                  ].join(' ')}
                  style={
                    caliphateFilter === c
                      ? { color: meta.color, backgroundColor: meta.bg, outline: `1px solid ${meta.color}55` }
                      : {}
                  }
                >
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Section filter pills */}
          <div className="mt-1.5 flex gap-1">
            <button
              type="button"
              onClick={() => setSectionFilter('all')}
              className={[
                'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                sectionFilter === 'all'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-[#8a7030] hover:text-[#c49a20]',
              ].join(' ')}
            >
              All Sections
            </button>
            {(Object.entries(SECTION_META) as [Exclude<SectionFilter, 'all'>, typeof SECTION_META[keyof typeof SECTION_META]][]).map(
              ([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSectionFilter(key)}
                  className={[
                    'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors',
                    sectionFilter === key
                      ? 'ring-1'
                      : 'text-[#8a7030] hover:text-[#c49a20]',
                  ].join(' ')}
                  style={
                    sectionFilter === key
                      ? { color: meta.color, backgroundColor: `${meta.color}22`, outline: `1px solid ${meta.color}55` }
                      : {}
                  }
                >
                  {meta.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex-shrink-0 border-b border-[#3a2a00] bg-[#0f0a00] px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="flex flex-1 items-center justify-center rounded-lg border border-[#3a2a00] py-1.5 text-[12px] font-medium text-[#8a7030] transition-colors hover:border-[#5a4010] hover:text-[#c49a20] disabled:pointer-events-none disabled:opacity-30"
            >
              ← Prev
            </button>

            <span className="min-w-[44px] text-center text-[11px] tabular-nums text-[#6a5020]">
              {activeIndex + 1}
              <span className="text-[#3a2a00]/70"> / </span>
              {filteredEvents.length}
            </span>

            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === filteredEvents.length - 1}
              className="flex flex-1 items-center justify-center rounded-lg bg-[#D4AF37] py-1.5 text-[12px] font-semibold text-[#1a0f00] transition-colors hover:bg-[#e8c84a] disabled:pointer-events-none disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-[#3a2a00]">
            <div
              className="h-full rounded-full bg-[#D4AF37] transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / filteredEvents.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable event list */}
        <div
          ref={listRef}
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto outline-none"
        >
          {filteredEvents.map((event, i) => {
            const isPast = i < activeIndex
            const isActive = i === activeIndex
            const isExpanded = isActive || expandedSlugs.has(event.slug)
            const dotColor = getEventDotColor(event)
            const outcomeLabel = getOutcomeLabel(event.outcome)
            const outcomeStyle = getOutcomeStyle(event.outcome)

            return (
              <div
                key={event.id}
                ref={isActive ? activeRowRef : undefined}
                tabIndex={0}
                onClick={() => goTo(i)}
                onKeyDown={(e) => e.key === 'Enter' && goTo(i)}
                className={[
                  'cursor-pointer border-b border-[#3a2a00]/40 px-3 py-2.5 outline-none',
                  'transition-colors duration-150',
                  'focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50',
                  isActive
                    ? 'border-l-2 border-[#D4AF37] bg-[#1a1000]'
                    : isPast
                      ? 'hover:bg-[#0f0a00]/80'
                      : 'hover:bg-[#120d00]',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  {/* Event number */}
                  <span
                    className={[
                      'mt-0.5 min-w-[24px] text-right text-[10px] tabular-nums transition-colors duration-150',
                      isActive
                        ? 'font-semibold text-[#D4AF37]'
                        : isPast
                          ? 'text-[#4a3510]/60'
                          : 'text-[#6a5020]',
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
                              ? 'text-[#6a5020]/70'
                              : 'text-[#b89840]',
                        ].join(' ')}
                      >
                        {event.title_en}
                      </p>
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={(e) => toggleExpand(event.slug, e)}
                        className={[
                          'mt-0.5 flex-shrink-0 rounded p-0.5 text-[10px] leading-none transition-colors',
                          isExpanded
                            ? 'text-[#D4AF37]'
                            : 'text-[#6a5020]/50 hover:text-[#8a7030]',
                        ].join(' ')}
                      >
                        {isExpanded ? '▾' : '▸'}
                      </button>
                    </div>

                    {/* Date + caliphate badge */}
                    <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <p className="text-[11px] text-[#6a5020]/70">
                        {event.date_display}
                        {event.place_name && (
                          <span> · {event.place_name}</span>
                        )}
                      </p>
                    </div>

                    {/* Expandable detail */}
                    <div
                      className="grid transition-all duration-200 ease-in-out"
                      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-2.5 space-y-2">
                          {isActive && event.title_ar && (
                            <p
                              className="text-right font-[Amiri,serif] text-base leading-relaxed text-[#b89840]"
                              dir="rtl"
                            >
                              {event.title_ar}
                            </p>
                          )}

                          {/* Caliphate + outcome badges */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {event.caliphate !== 'ali' || event.section !== 'fitna' ? (
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  color: CALIPHATE_META[event.caliphate].color,
                                  backgroundColor: CALIPHATE_META[event.caliphate].bg,
                                }}
                              >
                                {CALIPHATE_META[event.caliphate].label}
                              </span>
                            ) : null}
                            {event.section !== 'conquest' && (
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  color: SECTION_META[event.section].color,
                                  backgroundColor: `${SECTION_META[event.section].color}22`,
                                }}
                              >
                                {SECTION_META[event.section].label}
                              </span>
                            )}
                            {outcomeLabel && (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${outcomeStyle}`}>
                                {outcomeLabel}
                              </span>
                            )}
                          </div>

                          {event.description_en && (
                            <p
                              className={[
                                'text-[12px] leading-relaxed text-[#8a7030]',
                                isActive ? 'line-clamp-5' : 'line-clamp-4',
                              ].join(' ')}
                            >
                              {event.description_en}
                            </p>
                          )}

                          {event.muslim_commander && (
                            <p className="text-[11px] text-[#6a5020]">
                              <span className="text-[#8a7030]">Commander:</span>{' '}
                              {event.muslim_commander}
                            </p>
                          )}
                          {event.opponent && (
                            <p className="text-[11px] text-[#6a5020]">
                              <span className="text-[#8a7030]">Opponent:</span>{' '}
                              {event.opponent}
                            </p>
                          )}

                          <div className="flex items-center justify-end pb-0.5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D4AF37] transition-colors hover:text-white"
                              onClick={(e) => { e.stopPropagation(); goTo(i); setOverlayOpen(true) }}
                            >
                              Expand →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Significance dot — only on collapsed, non-active rows */}
                  {!isExpanded && (
                    <div
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor, opacity: 0.6 }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: Map ── */}
      <div className="relative min-w-0 flex-1 overflow-hidden bg-[#0f0a00]">
        {active && (
          <RashidunMap
            events={filteredEvents}
            activeIndex={activeIndex}
            onEventClick={goTo}
          />
        )}

        {/* Floating event badge */}
        {active && !overlayOpen && (
          <div className="pointer-events-none absolute left-3 top-3 z-[800]">
            <div className="rounded-xl border border-[#3a2a00]/60 bg-[rgba(26,16,0,0.88)] px-3 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-[12px] font-bold text-white">{active.title_en}</p>
              <p className="text-[10px] text-[#8a7030]">
                {active.date_display}
                {active.place_name && ` · ${active.place_name}`}
              </p>
            </div>
          </div>
        )}

        {/* Caliphate legend */}
        {!overlayOpen && (
          <div className="pointer-events-none absolute bottom-6 right-3 z-[800] space-y-1">
            <div className="rounded-lg border border-[#3a2a00]/40 bg-[rgba(26,16,0,0.75)] px-2.5 py-2 backdrop-blur-sm">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#6a5020]/70">
                Caliphate
              </p>
              <div className="space-y-1">
                {caliphateGroups.map((c) => {
                  const meta = CALIPHATE_META[c]
                  return (
                    <div key={c} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-[10px] text-[#8a7030]/80">
                        {meta.label} <span className="text-[#5a4010]">({meta.years})</span>
                      </span>
                    </div>
                  )
                })}
                <div className="mt-1 border-t border-[#3a2a00]/50 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#c94040]" />
                    <span className="text-[10px] text-[#8a7030]/80">Riddah Wars</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#e07b30]" />
                    <span className="text-[10px] text-[#8a7030]/80">First Fitna</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-px w-4 bg-[#7aeaff] opacity-70" />
                    <span className="text-[10px] text-[#8a7030]/80">Naval route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intro bubble */}
        {showIntro && (
          <div
            className="absolute inset-x-4 bottom-16 z-[850] mx-auto max-w-sm cursor-pointer"
            onClick={dismissIntro}
          >
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[rgba(26,16,0,0.96)] px-5 py-4 shadow-xl backdrop-blur-sm">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
                Rashidun Explorer
              </p>
              <p className="text-[13px] leading-relaxed text-white/90">
                Explore the Rashidun Caliphate (11–41 AH) — the Riddah Wars, the great conquests of Persia, Iraq, Syria, Egypt, and the First Fitna. Filter by caliph or section.
              </p>
              <div className="mt-3 flex items-center gap-3 border-t border-[#D4AF37]/20 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8a7030]">
                  <kbd className="rounded border border-[#3a2a00] bg-[#1a1000] px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]">←</kbd>
                  <kbd className="rounded border border-[#3a2a00] bg-[#1a1000] px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]">↑</kbd>
                  <span>Previous</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8a7030]">
                  <kbd className="rounded border border-[#3a2a00] bg-[#1a1000] px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]">→</kbd>
                  <kbd className="rounded border border-[#3a2a00] bg-[#1a1000] px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]">↓</kbd>
                  <span>Next</span>
                </div>
                <span className="ml-auto text-[10px] text-[#6a5020]/70">click or any key to dismiss</span>
              </div>
            </div>
          </div>
        )}

        {/* Expand overlay */}
        {overlayOpen && active && (
          <div className="absolute inset-0 z-[900] overflow-y-auto bg-[#0f0a00]">
            <div className="sticky top-3 z-10 float-right mr-3 flex items-center gap-1.5">
              <kbd className="rounded border border-[#D4AF37]/40 bg-[#1a1000] px-1.5 py-0.5 font-mono text-[10px] text-[#D4AF37]/70">ESC</kbd>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOverlayOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-[#1a0f00]"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Date + caliphate + outcome badges */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[#D4AF37]">
                  {active.date_display}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    color: CALIPHATE_META[active.caliphate].color,
                    backgroundColor: CALIPHATE_META[active.caliphate].bg,
                  }}
                >
                  {CALIPHATE_META[active.caliphate].label} ibn al-Khattab era
                </span>
                {active.outcome && (
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${getOutcomeStyle(active.outcome)}`}>
                    {getOutcomeLabel(active.outcome)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold leading-snug text-white">
                {active.title_en}
              </h2>
              {active.title_ar && (
                <p
                  className="mt-2 font-[Amiri,serif] text-xl leading-relaxed text-[#b89840]/80"
                  dir="rtl"
                >
                  {active.title_ar}
                </p>
              )}

              {/* Place */}
              {active.place_name && (
                <div className="mt-4 flex items-center gap-1.5 text-sm text-[#8a7030]">
                  <svg className="h-4 w-4 flex-shrink-0 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {active.place_name}
                </div>
              )}

              {/* Combat details */}
              {(active.muslim_commander || active.opponent) && (
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-[#3a2a00] bg-[#120d00] p-4">
                  {active.muslim_commander && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6a5020]">Muslim Commander</p>
                      <p className="mt-1 text-sm text-[#c49a20]">{active.muslim_commander}</p>
                    </div>
                  )}
                  {active.opponent && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6a5020]">Opponent</p>
                      <p className="mt-1 text-sm text-[#c49a20]">{active.opponent}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {active.description_en && (
                <div className="mt-6">
                  <p className="leading-relaxed text-sm text-[#8a7030]">{active.description_en}</p>
                </div>
              )}

              {/* Sources */}
              {active.sources && active.sources.length > 0 && (
                <div className="mt-8 rounded-xl border border-[#3a2a00] bg-[#120d00]/50 p-5">
                  <h3 className="mb-3 text-sm font-semibold text-white">Sources</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#8a7030]">
                    {active.sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
