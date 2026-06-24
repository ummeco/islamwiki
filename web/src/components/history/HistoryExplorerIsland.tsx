/**
 * HistoryExplorerIsland.tsx — Astro island consolidating the /history index interactivity.
 *
 * PURPOSE: Ports app/history/page.tsx's tab switcher. The Next page selected the active
 *   section via `searchParams.tab` (server-driven). In the Astro SSG build that server
 *   param is not available, so tab state moves client-side into this single island, which
 *   renders the matching sub-view: ProphetCards (prophets tab), the full-height Rashidun
 *   map explorer (rashidun tab), or the HistoryTimeline (every other section). All section
 *   copy, counts, and the Seerah cross-links are preserved verbatim.
 * INPUTS (serialized on the server page, framework-independent shapes):
 *   - sections: per-tab serialized event lists (already date-formatted on the server).
 *   - rashidunEvents: RashidunMapEvent[] for the map explorer.
 *   - periods: string[] for the timeline period filter.
 *   - counts: section → count map for the tab badges.
 * CONSTRAINTS: No next/* imports. Serializable props only.
 * REF: ports app/history/page.tsx · D-P2-STACK-CANON
 */
import { useState } from 'react'
import ProphetCardsIsland from './ProphetCardsIsland'
import { HistoryTimeline } from './HistoryTimelineIsland'
import { RashidunExplorer, type RashidunMapEvent } from './RashidunExplorerIsland'

type HistorySection = 'prophets' | 'post-jesus' | 'islamic-history' | 'modern' | 'battles'
type TabId = HistorySection | 'rashidun'

interface SerializedEvent {
  id: number
  slug: string
  title_en: string
  title_ar: string
  description_en: string
  period: string
  section: string
  severity: 1 | 2 | 3
  place_name?: string
  datePrimary: string
  dateSecondary?: string
  outcome?: 'muslim_victory' | 'muslim_defeat' | 'inconclusive'
  muslim_commander?: string
  opponent?: string
  people_slug?: string
}

const SECTION_TABS: { id: TabId; label: string; description: string }[] = [
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
  /** Events per section id, already serialized + date-formatted on the server. */
  sections: Record<HistorySection, SerializedEvent[]>
  rashidunEvents: RashidunMapEvent[]
  periods: string[]
  counts: Record<HistorySection, number>
}

export default function HistoryExplorerIsland({ sections, rashidunEvents, periods, counts }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('prophets')

  const activeTabInfo = SECTION_TABS.find((t) => t.id === activeTab) ?? SECTION_TABS[0]

  if (activeTab === 'rashidun') {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col">
        <div className="flex-shrink-0 border-b border-iw-border bg-iw-bg px-4">
          <nav className="-mb-px flex flex-wrap gap-1">
            {SECTION_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-iw-accent text-iw-accent'
                      : 'border-transparent text-iw-text-secondary hover:text-white hover:border-iw-border',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <RashidunExplorer events={rashidunEvents} />
        </div>
      </div>
    )
  }

  const sectionEvents = sections[activeTab as HistorySection] ?? []

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Islamic History</h1>
        <p className="mt-2 text-iw-text-secondary">
          From the first prophet Adam AS to the present day. For the life of the Prophet{' '}
          <span className="font-arabic">ﷺ</span>, see{' '}
          <a href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
            Seerah
          </a>.
        </p>
      </div>

      <div className="mb-8 border-b border-iw-border">
        <nav className="-mb-px flex flex-wrap gap-1">
          {SECTION_TABS.map((tab) => {
            const count =
              tab.id === 'rashidun'
                ? rashidunEvents.length
                : (counts[tab.id as HistorySection] ?? 0)
            const isActive = activeTab === tab.id
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              </button>
            )
          })}
        </nav>
      </div>

      <p className="mb-6 text-sm text-iw-text-muted">{activeTabInfo.description}</p>

      {activeTab === 'islamic-history' && (
        <div className="mb-6 rounded-xl border border-iw-border bg-iw-surface/50 p-4 text-sm text-iw-text-secondary">
          The Prophetic era (0–11 AH) is documented in detail on the{' '}
          <a href="/seerah" className="text-iw-accent hover:text-iw-accent-light transition-colors">
            Seerah page
          </a>.
          This section covers from the death of the Prophet ﷺ (11 AH) onwards.
        </div>
      )}

      {activeTab === 'prophets' ? (
        <ProphetCardsIsland events={sectionEvents} />
      ) : (
        <HistoryTimeline events={sectionEvents} periods={periods} showOutcome={activeTab === 'battles'} />
      )}
    </div>
  )
}
