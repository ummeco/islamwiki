'use client'
import { useState } from 'react'

interface SurahIntroButtonProps {
  surahNumber: number
  surahName: string
  surahNameAr: string
  surahTranslitName: string
  verseCount: number
  revelationType: 'meccan' | 'medinan'
  juzStart: number
  pageStart?: number
  wordCount?: number
  description?: string
}

type Tab = 'overview' | 'revelation' | 'structure'

// Meccan surahs in approximate revelation order (traditional numbering)
// Used to determine Seerah phase context. Source: Ibn Abbas / classical tafsir ordering.
const MECCAN_LATE_START = 85   // approx surah numbers where late Meccan begins (by revelation order)
const MECCAN_MID_START = 40

function getMeccanPhase(surahNumber: number): 'early' | 'middle' | 'late' {
  if (surahNumber >= MECCAN_LATE_START) return 'late'
  if (surahNumber >= MECCAN_MID_START) return 'middle'
  return 'early'
}

function getMeccanPhaseLabel(surahNumber: number): string {
  const phase = getMeccanPhase(surahNumber)
  if (phase === 'early') return 'Early Meccan Period (610–615 CE)'
  if (phase === 'middle') return 'Middle Meccan Period (615–619 CE)'
  return 'Late Meccan Period (619–622 CE)'
}

function getMeccanContext(surahNumber: number): string {
  const phase = getMeccanPhase(surahNumber)
  if (phase === 'early') {
    return 'This surah was revealed during the earliest years of the Prophetic mission in Makkah. The first revelations began around 610 CE when the Prophet ﷺ received the first verses of the Quran in the Cave of Hira. This period was marked by a small circle of believers, quiet but determined preaching, and the foundational call to tawhid (the oneness of Allah). The Quraysh initially dismissed the message, but growing concern led to increasing hostility.'
  }
  if (phase === 'middle') {
    return 'Revealed during the middle Meccan years, a period of intensifying persecution of the Muslim community. Some believers emigrated to Abyssinia (Ethiopia) under King Negus, seeking refuge from Qurayshi oppression. The Prophet ﷺ continued preaching, and notable events of this period include the conversion of Hamza ibn Abd al-Muttalib and Umar ibn al-Khattab. The boycott of the Banu Hashim clan (617–619 CE) put severe economic and social pressure on the early Muslims.'
  }
  return 'Revealed in the final years before the Hijra to Madinah. This period witnessed the "Year of Sorrow" (619 CE) when both Khadijah (the Prophet\'s wife) and Abu Talib (his uncle and protector) passed away within weeks of each other. The Prophet ﷺ then made the miraculous night journey (Isra\' wal-Mi\'raj), during which the five daily prayers were prescribed. The Pledge of Aqaba brought new supporters from Madinah, paving the way for the migration.'
}

function getMedinanContext(surahNumber: number): string {
  // Approximate: early Medinan (surahs 2-9 area), later Medinan toward surah 110
  if (surahNumber <= 5) {
    return 'Revealed in the early years of the Medinan period (622–627 CE), following the Prophet\'s migration (Hijra) from Makkah. The Muslim community was newly established in Madinah, navigating relationships with the Ansar (helpers), the Muhajirun (emigrants), and the Jewish tribes of Madinah under the Constitution of Madinah. Key events of this era include the battles of Badr (624 CE) and Uhud (625 CE), the change of qibla direction from Jerusalem to the Ka\'bah, and the prescription of fasting Ramadan.'
  }
  return 'Revealed during the later Medinan period (627–632 CE), a time when the Islamic state was expanding and consolidating. Events of this era include the Battle of the Trench (627 CE), the Treaty of Hudaybiyyah (628 CE), the conquest of Makkah (630 CE), and the Farewell Pilgrimage (632 CE). Legislation was maturing, covering inheritance, trade, international relations, and the rights of various members of society.'
}

function getThematicContext(revelationType: 'meccan' | 'medinan'): string {
  if (revelationType === 'meccan') {
    return 'Meccan surahs primarily address the foundations of faith: the absolute oneness of Allah (tawhid), the reality of the afterlife and resurrection, the truthfulness of the Prophet\'s mission, and accounts of previous prophets and their communities. They speak directly to the human heart and conscience, often through vivid imagery, oaths, and short powerful verses. They build the spiritual and theological foundation upon which Medinan legislation later rests.'
  }
  return 'Medinan surahs tend to be longer and more legislative in character, addressing the newly formed Muslim community as a collective. They cover Islamic law (fiqh) in depth — marriage, divorce, inheritance, contracts, criminal law, warfare, and governance. They also engage substantively with the People of the Book (Jews and Christians), clarifying theological agreements and disagreements with care and clarity.'
}

export function SurahIntroButton({
  surahNumber,
  surahName,
  surahNameAr,
  surahTranslitName,
  verseCount,
  revelationType,
  juzStart,
  pageStart,
  wordCount,
  description,
}: SurahIntroButtonProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  const isMeccan = revelationType === 'meccan'
  const placeLabel = isMeccan ? 'Makkah' : 'Madinah'
  const placeColor = isMeccan ? 'text-amber-400' : 'text-sky-400'
  const placeBg = isMeccan ? 'bg-amber-400/10 border-amber-400/30' : 'bg-sky-400/10 border-sky-400/30'

  const seerahPeriod = isMeccan
    ? getMeccanPhaseLabel(surahNumber)
    : surahNumber <= 5 ? 'Early Medinan Period (622–627 CE)' : 'Later Medinan Period (627–632 CE)'

  const historicalContext = isMeccan
    ? getMeccanContext(surahNumber)
    : getMedinanContext(surahNumber)

  const thematicContext = getThematicContext(revelationType)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'revelation', label: 'Revelation' },
    { id: 'structure', label: 'Structure' },
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setTab('overview') }}
        title="About this surah"
        className="flex items-center gap-1.5 rounded-lg border border-iw-accent/40 bg-iw-accent/10 px-3 py-1.5 text-[12px] font-semibold text-iw-accent transition-colors hover:bg-iw-accent/20"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Surah Intro
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 flex w-full max-w-xl flex-col rounded-2xl border border-iw-border bg-iw-bg shadow-2xl shadow-black/60 max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — fixed, does not scroll */}
            <div className="shrink-0 border-b border-iw-border px-6 pt-5 pb-0">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-iw-accent">
                    Surah {surahNumber}
                  </p>
                  <h2 className="mt-0.5 text-2xl font-bold text-white">{surahName}</h2>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="arabic-text text-lg text-iw-text-secondary">{surahNameAr}</p>
                    <span className="text-iw-border">·</span>
                    <p className="text-[13px] text-iw-text-muted">{surahTranslitName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="ml-4 shrink-0 text-iw-text-muted transition-colors hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Revelation badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${placeBg} ${placeColor}`}>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Revealed in {placeLabel}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-t-lg px-4 py-2 text-[12px] font-semibold transition-colors ${
                      tab === t.id
                        ? 'border border-b-0 border-iw-border bg-iw-surface text-white'
                        : 'text-iw-text-muted hover:text-iw-text-secondary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto">

              {/* ── OVERVIEW TAB ── */}
              {tab === 'overview' && (
                <div className="p-6 space-y-5">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-iw-border bg-iw-surface p-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-iw-text-muted">Verses</p>
                      <p className="mt-1 text-xl font-bold text-white">{verseCount}</p>
                    </div>
                    {wordCount && (
                      <div className="rounded-xl border border-iw-border bg-iw-surface p-3 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-iw-text-muted">Words</p>
                        <p className="mt-1 text-xl font-bold text-white">{wordCount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="rounded-xl border border-iw-border bg-iw-surface p-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-iw-text-muted">Starts Juz</p>
                      <p className="mt-1 text-xl font-bold text-white">{juzStart}</p>
                    </div>
                    {pageStart && (
                      <div className="rounded-xl border border-iw-border bg-iw-surface p-3 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-iw-text-muted">Mushaf Page</p>
                        <p className="mt-1 text-xl font-bold text-white">{pageStart}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">About</h3>
                    {description ? (
                      <p className="text-[14px] leading-relaxed text-iw-text-secondary">{description}</p>
                    ) : (
                      <p className="text-[14px] italic leading-relaxed text-iw-text-muted">
                        {surahName} contains {verseCount} verses and was revealed in {placeLabel}.
                        Detailed commentary coming in a future update.
                      </p>
                    )}
                  </div>

                  {/* Thematic character */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">
                      {isMeccan ? 'Meccan Surahs' : 'Medinan Surahs'} — Character
                    </h3>
                    <p className="text-[13px] leading-relaxed text-iw-text-muted">{thematicContext}</p>
                  </div>
                </div>
              )}

              {/* ── REVELATION TAB ── */}
              {tab === 'revelation' && (
                <div className="p-6 space-y-5">
                  {/* Period badge */}
                  <div className={`rounded-xl border p-4 ${placeBg}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-iw-text-muted">Seerah Period</p>
                    <p className={`mt-1 text-[15px] font-bold ${placeColor}`}>{seerahPeriod}</p>
                  </div>

                  {/* Historical context */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">Historical Context</h3>
                    <p className="text-[13px] leading-relaxed text-iw-text-secondary">{historicalContext}</p>
                  </div>

                  {/* Meccan/Medinan distinction */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">What This Means for the Surah</h3>
                    <p className="text-[13px] leading-relaxed text-iw-text-secondary">{thematicContext}</p>
                  </div>

                  {/* Phase 2 notice */}
                  <div className="rounded-xl border border-iw-border bg-iw-surface/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">Coming in Phase 2</p>
                    <p className="mt-1 text-[12px] text-iw-text-muted">
                      Precise revelation date, which specific sections were revealed and when, the immediate
                      cause of revelation (asbab al-nuzul) for key verses, and scholar commentary on the
                      historical setting will be added when content review is complete.
                    </p>
                  </div>
                </div>
              )}

              {/* ── STRUCTURE TAB ── */}
              {tab === 'structure' && (
                <div className="p-6 space-y-5">
                  {/* Location in the Quran */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-iw-accent">Location in the Quran</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                        <span className="text-[12px] text-iw-text-muted">Surah Number</span>
                        <span className="text-[14px] font-bold text-white">{surahNumber} of 114</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                        <span className="text-[12px] text-iw-text-muted">Starts in Juz</span>
                        <span className="text-[14px] font-bold text-white">{juzStart} of 30</span>
                      </div>
                      {pageStart && (
                        <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                          <span className="text-[12px] text-iw-text-muted">Mushaf Page</span>
                          <span className="text-[14px] font-bold text-white">{pageStart} of 604</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                        <span className="text-[12px] text-iw-text-muted">Total Verses</span>
                        <span className="text-[14px] font-bold text-white">{verseCount}</span>
                      </div>
                      {wordCount && (
                        <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                          <span className="text-[12px] text-iw-text-muted">Total Words</span>
                          <span className="text-[14px] font-bold text-white">{wordCount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-lg border border-iw-border bg-iw-surface px-4 py-3">
                        <span className="text-[12px] text-iw-text-muted">Revelation</span>
                        <span className={`text-[14px] font-bold capitalize ${placeColor}`}>{revelationType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bismillah */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">Bismillah</h3>
                    <p className="text-[13px] leading-relaxed text-iw-text-secondary">
                      {surahNumber === 1
                        ? 'Surah al-Fatiha begins with the Bismillah as the first verse (verse 1:1).'
                        : surahNumber === 9
                        ? 'Surah at-Tawbah (Bara\'ah) is the only surah that does not begin with the Bismillah. Scholars differ on whether this is because it was originally continuous with al-Anfal (Surah 8) or because its severe tone warranted omitting the formula of mercy.'
                        : 'This surah begins with "Bismillah ir-Rahman ir-Raheem" (In the name of Allah, the Most Gracious, the Most Merciful). The Bismillah precedes every surah except at-Tawbah and is itself a complete verse in al-Fatiha.'}
                    </p>
                  </div>

                  {/* Naming */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-iw-accent">Name</h3>
                    <p className="text-[13px] leading-relaxed text-iw-text-secondary">
                      The surah is known in Arabic as <span className="arabic-text text-base text-white">{surahNameAr}</span> ({surahTranslitName}),
                      translated as &ldquo;{surahName}.&rdquo; Surah names are traditionally derived from a distinctive
                      word, theme, or story within the surah — they serve as reference labels, not titles that
                      summarize the surah&rsquo;s complete content.
                    </p>
                  </div>

                  {/* Phase 2 */}
                  <div className="rounded-xl border border-iw-border bg-iw-surface/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">Coming in Phase 2</p>
                    <p className="mt-1 text-[12px] text-iw-text-muted">
                      Section-by-section breakdown, rukus, sajda positions, makki/madani verses within the surah,
                      and recitation statistics (average reading time, letter count) will be added in the next content phase.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
