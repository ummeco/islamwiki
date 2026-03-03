'use client'

import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'

// ── Types ──

interface TimelinePerson {
  id: number
  slug: string
  name_en: string
  name_ar?: string
  birth_year_ce?: number
  death_year_ce?: number
  era: string
  category: string
}

interface PeopleTimelineProps {
  people: TimelinePerson[]
}

// ── Era colors and labels ──

const ERA_COLORS: Record<string, string> = {
  prophet: '#C9F27A',
  sahabi: '#79C24C',
  tabii: '#5AAB3A',
  tabi_tabii: '#3D8E2E',
  classical: '#2E7A25',
  medieval: '#1E5E2F',
  ottoman: '#175225',
  modern: '#0D2F17',
}

const ERA_LABELS: Record<string, string> = {
  prophet: 'Prophets',
  sahabi: 'Sahabah',
  tabii: "Tabi'in",
  tabi_tabii: "Tabi' at-Tabi'in",
  classical: 'Classical',
  medieval: 'Medieval',
  ottoman: 'Ottoman',
  modern: 'Modern',
}

// ── Constants ──

const TIMELINE_START = 500
const TIMELINE_END = 2100
const YEAR_SPAN = TIMELINE_END - TIMELINE_START
const PX_PER_YEAR = 5
const TIMELINE_WIDTH = YEAR_SPAN * PX_PER_YEAR
const ROW_HEIGHT = 28
const ROW_GAP = 4
const RULER_HEIGHT = 48
const CENTURY_MARKS = Array.from(
  { length: Math.floor((TIMELINE_END - TIMELINE_START) / 100) + 1 },
  (_, i) => TIMELINE_START + i * 100
)

// ── Helpers ──

function yearToX(year: number): number {
  return (year - TIMELINE_START) * PX_PER_YEAR
}

function getEraColor(era: string): string {
  return ERA_COLORS[era] ?? '#2E7A25'
}

// ── Component ──

export function PeopleTimeline({ people }: PeopleTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    person: TimelinePerson
    x: number
    y: number
  } | null>(null)

  // Sort by birth year, filter to those with at least one year
  const sorted = useMemo(() => {
    return people
      .filter((p) => p.birth_year_ce != null || p.death_year_ce != null)
      .sort((a, b) => {
        const aYear = a.birth_year_ce ?? a.death_year_ce ?? 0
        const bYear = b.birth_year_ce ?? b.death_year_ce ?? 0
        return aYear - bYear
      })
  }, [people])

  // Collect active eras for the legend
  const activeEras = useMemo(() => {
    const set = new Set<string>()
    for (const p of sorted) set.add(p.era)
    const order = Object.keys(ERA_COLORS)
    return order.filter((e) => set.has(e))
  }, [sorted])

  const totalHeight = RULER_HEIGHT + sorted.length * (ROW_HEIGHT + ROW_GAP) + 32

  function handleBarMouseEnter(
    e: React.MouseEvent,
    person: TimelinePerson
  ) {
    const rect = scrollRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      person,
      x: e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0),
      y: e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0),
    })
  }

  function handleBarMouseLeave() {
    setTooltip(null)
  }

  // Callback ref for the timeline canvas (sets dynamic dimensions)
  const canvasRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        el.style.setProperty('width', `${TIMELINE_WIDTH}px`)
        el.style.setProperty('height', `${totalHeight}px`)
      }
    },
    [totalHeight]
  )

  // Callback ref for the ruler
  const rulerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      el.style.setProperty('height', `${RULER_HEIGHT}px`)
      el.style.setProperty('width', `${TIMELINE_WIDTH}px`)
    }
  }, [])

  // Callback ref for the tooltip
  const tooltipRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && tooltip) {
        el.style.setProperty('left', `${tooltip.x + 12}px`)
        el.style.setProperty('top', `${tooltip.y - 8}px`)
      }
    },
    [tooltip]
  )

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {activeEras.map((era) => (
          <div key={era} className="flex items-center gap-1.5">
            <span
              ref={(el) => {
                if (el) el.style.setProperty('background-color', getEraColor(era))
              }}
              className="inline-block h-3 w-3 rounded-sm"
            />
            <span className="text-xs text-iw-text-secondary">
              {ERA_LABELS[era] ?? era}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline container */}
      <div
        ref={scrollRef}
        className="relative min-h-[500px] max-h-[80vh] overflow-x-auto overflow-y-auto rounded-xl border border-iw-border bg-iw-surface"
      >
        <div ref={canvasRef} className="relative">
          {/* Ruler */}
          <div
            ref={rulerRef}
            className="sticky top-0 z-20 border-b border-iw-border bg-iw-bg/90 backdrop-blur-sm"
          >
            {CENTURY_MARKS.map((year) => {
              const x = yearToX(year)
              return (
                <div
                  key={year}
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('left', `${x}px`)
                      el.style.setProperty('height', `${RULER_HEIGHT}px`)
                    }
                  }}
                  className="absolute top-0 flex flex-col items-center"
                >
                  <span className="mt-2 text-xs font-medium text-iw-text-secondary">
                    {year}
                  </span>
                  <div className="mt-1 h-3 w-px bg-iw-border" />
                </div>
              )
            })}
          </div>

          {/* Century gridlines */}
          {CENTURY_MARKS.map((year) => {
            const x = yearToX(year)
            return (
              <div
                key={`grid-${year}`}
                ref={(el) => {
                  if (el) {
                    el.style.setProperty('left', `${x}px`)
                    el.style.setProperty('background-color', 'rgba(121, 194, 76, 0.07)')
                  }
                }}
                className="pointer-events-none absolute top-0 h-full w-px"
              />
            )
          })}

          {/* Person bars */}
          {sorted.map((person, index) => {
            const birth = person.birth_year_ce
            const death = person.death_year_ce

            // Determine bar start/end
            let barStart: number
            let barEnd: number
            let isEstimate = false

            if (birth != null && death != null) {
              barStart = birth
              barEnd = death
            } else if (birth != null) {
              barStart = birth
              barEnd = Math.min(birth + 70, TIMELINE_END)
              isEstimate = true
            } else if (death != null) {
              barStart = Math.max(death - 70, TIMELINE_START)
              barEnd = death
              isEstimate = true
            } else {
              return null
            }

            const x = yearToX(barStart)
            const width = Math.max((barEnd - barStart) * PX_PER_YEAR, 24)
            const y = RULER_HEIGHT + index * (ROW_HEIGHT + ROW_GAP) + 8
            const color = getEraColor(person.era)

            return (
              <Link
                key={person.id}
                href={`/people/${person.slug}`}
                ref={(el) => {
                  if (el) {
                    el.style.setProperty('left', `${x}px`)
                    el.style.setProperty('top', `${y}px`)
                    el.style.setProperty('width', `${width}px`)
                    el.style.setProperty('height', `${ROW_HEIGHT}px`)
                  }
                }}
                className="group absolute flex items-center rounded"
                onMouseEnter={(e) => handleBarMouseEnter(e, person)}
                onMouseLeave={handleBarMouseLeave}
              >
                {/* Lifespan bar */}
                <div
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('background-color', color)
                      el.style.setProperty('opacity', isEstimate ? '0.4' : '0.7')
                      el.style.setProperty('border', `1px solid ${color}`)
                    }
                  }}
                  className="absolute inset-0 rounded transition-opacity group-hover:opacity-100"
                />
                {/* Name label */}
                <span
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('max-width', `${width}px`)
                    }
                  }}
                  className="relative z-10 truncate px-2 text-xs font-medium text-[#f0fce8] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
                >
                  {person.name_en}
                </span>
              </Link>
            )
          })}

          {/* Tooltip */}
          {tooltip && (
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-30 rounded-lg border border-iw-border bg-iw-bg/95 px-3 py-2 shadow-xl backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-white">
                {tooltip.person.name_en}
              </p>
              {tooltip.person.name_ar && (
                <p className="arabic-text text-sm text-white/70">
                  {tooltip.person.name_ar}
                </p>
              )}
              <p className="mt-1 text-xs text-iw-text-secondary">
                {tooltip.person.birth_year_ce != null && (
                  <span>b. {tooltip.person.birth_year_ce} CE</span>
                )}
                {tooltip.person.birth_year_ce != null &&
                  tooltip.person.death_year_ce != null && (
                    <span> &mdash; </span>
                  )}
                {tooltip.person.death_year_ce != null && (
                  <span>d. {tooltip.person.death_year_ce} CE</span>
                )}
              </p>
              <p className="mt-0.5 text-xs capitalize text-iw-accent">
                {ERA_LABELS[tooltip.person.era] ?? tooltip.person.era}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-iw-text-secondary">
        Showing {sorted.length} of {people.length} people with known dates.
        Scroll horizontally to explore the full timeline ({TIMELINE_START}&ndash;
        {TIMELINE_END} CE). Faded bars indicate estimated lifespans.
      </p>
    </div>
  )
}
