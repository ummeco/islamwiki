import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  getAllHistoryEvents,
  getHistoryPeriods,
  getSectionCounts,
  type HistorySection,
} from '@/lib/data/history'
import { HistoryTimeline } from '@/components/history/history-timeline'
import { ProphetCards } from '@/components/history/prophet-cards'
import { formatIslamicDate } from '@/lib/dates/hijri'
import rashidunEventsRaw from '@/data/history/rashidun-events.json'
import type { RashidunMapEvent } from '@/components/history/rashidun-map'

const RashidunExplorer = dynamic(
  () => import('@/components/history/rashidun-explorer').then((m) => ({ default: m.RashidunExplorer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-[#3a2a00] bg-[#0f0a00]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#3a2a00] border-t-[#D4AF37]" />
          <p className="text-xs text-[#8a7030]">Loading Rashidun explorer…</p>
        </div>
      </div>
    ),
  }
)

const rashidunEvents = rashidunEventsRaw as RashidunMapEvent[]

export const metadata: Metadata = {
  title: 'Islamic History',
  description:
    'The complete history of Islam — from the 25 Quranic prophets through the life of the Prophet ﷺ to the modern era. Interactive timelines, battles, and the story of the corruption of previous scriptures.',
}

const SECTION_TABS: { id: HistorySection | 'all' | 'rashidun'; label: string; description: string }[] = [
  {
    id: 'prophets',
    label: 'Major Prophets',
    description: 'The 25 prophets mentioned by name in the Quran, in chronological order.',
  },
  {
    id: 'post-jesus',
    label: 'After Jesus',
    description:
      'The corruption of the message of Isa AS until the arrival of the final Prophet ﷺ — including the story of Salman al-Farisi.',
  },
  {
    id: 'rashidun',
    label: 'Rashidun Caliphate',
    description:
      'The Four Rightly-Guided Caliphs (11–41 AH / 632–661 CE) — the Riddah Wars, the great conquests of Persia, Iraq, Syria, and Egypt, and the First Fitna. Interactive map.',
  },
  {
    id: 'islamic-history',
    label: 'Islamic History',
    description:
      'From the Umayyad Caliphate through the Abbasid, Mamluk, and Ottoman empires.',
  },
  {
    id: 'modern',
    label: 'Modern Times',
    description: 'The Muslim world from the 20th century to the present day.',
  },
  {
    id: 'battles',
    label: 'Battles',
    description: 'All major battles in Islamic history, from Badr to the fall of Constantinople.',
  },
]

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function HistoryPage({ searchParams }: Props) {
  const { tab: tabParam } = await searchParams
  const activeTab =
    SECTION_TABS.find((t) => t.id === tabParam)?.id ?? 'prophets'

  const allEvents = getAllHistoryEvents()
  const periods = getHistoryPeriods()
  const counts = getSectionCounts()

  const sectionEvents = (activeTab === 'all' || activeTab === 'rashidun')
    ? allEvents
    : allEvents.filter((e) => e.section === activeTab)

  const serialized = sectionEvents.map((e) => {
    const { primary, secondary } = formatIslamicDate(e)
    return {
      id: e.id,
      slug: e.slug,
      title_en: e.title_en,
      title_ar: e.title_ar,
      description_en: e.description_en,
      period: e.period,
      section: e.section,
      severity: e.severity,
      place_name: e.place_name,
      datePrimary: primary,
      dateSecondary: secondary,
      outcome: e.outcome,
      muslim_commander: e.muslim_commander,
      opponent: e.opponent,
      people_slug: e.people_slug,
    }
  })

  const activeTabInfo = SECTION_TABS.find((t) => t.id === activeTab) ?? SECTION_TABS[0]

  return (
    <div className={activeTab === 'rashidun' ? 'flex h-[calc(100vh-64px)] flex-col' : 'section-container py-12'}>
      {/* ── Rashidun map tab — full-height, no outer padding ── */}
      {activeTab === 'rashidun' ? (
        <>
          {/* Compact tab bar */}
          <div className="flex-shrink-0 border-b border-iw-border bg-iw-bg px-4">
            <nav className="-mb-px flex flex-wrap gap-1">
              {SECTION_TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <Link
                    key={tab.id}
                    href={`/history?tab=${tab.id}`}
                    className={[
                      'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-[#D4AF37] text-[#D4AF37]'
                        : 'border-transparent text-iw-text-secondary hover:text-white hover:border-iw-border',
                    ].join(' ')}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Full-height explorer */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <RashidunExplorer events={rashidunEvents} />
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Islamic History</h1>
            <p className="mt-2 text-iw-text-secondary">
              From the first prophet Adam AS to the present day. For the life of the Prophet{' '}
              <span className="font-arabic">ﷺ</span>, see{' '}
              <Link href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
                Seerah
              </Link>.
            </p>
          </div>

          {/* Section Tabs */}
          <div className="mb-8 border-b border-iw-border">
            <nav className="-mb-px flex flex-wrap gap-1">
              {SECTION_TABS.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? allEvents.length
                    : tab.id === 'rashidun'
                      ? rashidunEvents.length
                      : (counts[tab.id as HistorySection] ?? 0)
                const isActive = activeTab === tab.id
                return (
                  <Link
                    key={tab.id}
                    href={`/history?tab=${tab.id}`}
                    className={[
                      'flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-iw-accent text-iw-accent'
                        : 'border-transparent text-iw-text-secondary hover:text-white hover:border-iw-border',
                    ].join(' ')}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={[
                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          isActive
                            ? 'bg-iw-accent/20 text-iw-accent'
                            : 'bg-iw-surface text-iw-text-muted',
                        ].join(' ')}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Active tab description */}
          <p className="mb-6 text-sm text-iw-text-muted">{activeTabInfo.description}</p>

          {/* Seerah callout */}
          {activeTab === 'islamic-history' && (
            <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface/50 p-4 text-sm text-iw-text-secondary">
              The Prophetic era (0–11 AH) is documented in detail on the{' '}
              <Link href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
                Seerah page
              </Link>.
              This section covers from the death of the Prophet ﷺ (11 AH) onwards.
            </div>
          )}

          {/* Prophets section — card layout */}
          {activeTab === 'prophets' ? (
            <ProphetCards events={serialized} />
          ) : (
            <HistoryTimeline events={serialized} periods={periods} showOutcome={activeTab === 'battles'} />
          )}
        </>
      )}
    </div>
  )
}
