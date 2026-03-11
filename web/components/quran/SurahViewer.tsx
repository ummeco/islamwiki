'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AudioPlayer, type AutoScrollMode } from './AudioPlayer'
import { PlayAyahButton } from './PlayAyahButton'
import { TafsirModal } from './TafsirModal'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { normalizeArabic, toArabicIndic } from '@/lib/quran-utils'

// ── Translation metadata ──────────────────────────────────────────────────────

const TRANSLATIONS: Record<string, string> = {
  iwq: 'Islam.wiki (IWQ)',
  'sahih-int': 'Sahih International',
  khattab: 'Dr. Mustafa Khattab',
  haleem: 'Abdul Haleem',
  asad: 'Muhammad Asad',
  'yusuf-ali': 'Yusuf Ali',
  pickthall: 'Pickthall',
  arberry: 'A.J. Arberry',
  'hilali-khan': 'Hilali & Khan',
  maariful: 'Maariful Quran',
  shakir: 'M.H. Shakir',
  itani: 'Talal Itani',
  mubarakpuri: 'Mubarakpuri',
  wahiduddin: 'Wahiduddin Khan',
}

const TRANSLATIONS_ID: Record<string, string> = {
  kemenag: 'Kemenag (Indonesian)',
  sabiq: 'As-Sabiq (Indonesian)',
}

const FEATURED = ['iwq', 'sahih-int', 'khattab', 'haleem', 'asad', 'yusuf-ali']
const FEATURED_ID = ['kemenag', 'sabiq']
const EXTRA = Object.keys(TRANSLATIONS).filter((k) => !FEATURED.includes(k))

/** Returns true if the translation key belongs to the Indonesian set */
const isIdTranslation = (key: string) => key in TRANSLATIONS_ID

const SHORT_LABELS: Record<string, string> = {
  iwq: 'IWQ ✦',
  'sahih-int': "Sahih Int'l",
  khattab: 'Khattab',
  haleem: 'Haleem',
  asad: 'Asad',
  'yusuf-ali': 'Yusuf Ali',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AyahData {
  number_in_surah: number
  text_ar: string
  ar_simple: string
  transliteration: string
  translations: Record<string, string>
  translations_id: Record<string, string>
  ruku: number
  section_id: number | null
}

interface SurahViewerProps {
  surahNumber: number
  surahName: string
  surahNameAr?: string
  totalAyahs: number
  ayahs: AyahData[]
  focusFrom?: number
  focusTo?: number
  locale?: string
}

type ReadMode = 'section' | 'verse'

type FontSize = 'sm' | 'md' | 'lg' | 'xl'

type ContentWidth = 'wide' | 'narrow'

type ReadingLang = 'en' | 'ar' | 'id'

interface Settings {
  mode: ReadMode
  showArabic: boolean
  showTranslit: boolean
  showEnglish: boolean
  translation: string
  fontSize: FontSize
  contentWidth: ContentWidth
  reading_lang: ReadingLang
}

// leading-[2] on all sizes: line gap = (2em - 1em) = 1em, half = 0.5em each side.
// Highlighted spans use py-[0.5em] + box-decoration-clone to fill the gap exactly.
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-[14px] leading-[2]',
  md: 'text-[16px] leading-[2]',
  lg: 'text-[18px] leading-[2]',
  xl: 'text-[20px] leading-[2]',
}

// ── Grouping helper ───────────────────────────────────────────────────────────

interface AyahGroup {
  ruku: number
  ayahs: AyahData[]
}

function groupByRuku(ayahs: AyahData[]): AyahGroup[] {
  const groups: AyahGroup[] = []
  for (const ayah of ayahs) {
    const last = groups[groups.length - 1]
    if (last && last.ruku === ayah.ruku) {
      last.ayahs.push(ayah)
    } else {
      groups.push({ ruku: ayah.ruku, ayahs: [ayah] })
    }
  }
  return groups
}

// ── Settings Gear Panel ───────────────────────────────────────────────────────

interface GearPanelProps {
  settings: Settings
  update: (p: Partial<Settings>) => void
  onClose: () => void
  locale?: string
}

function GearPanel({ settings, update, onClose, locale }: GearPanelProps) {
  const isId = locale === 'id'
  const featuredKeys = isId ? FEATURED_ID : FEATURED
  const extraKeys = isId ? [] : EXTRA
  const translationLabels = isId ? TRANSLATIONS_ID : TRANSLATIONS
  return (
    <div className="flex h-full w-full flex-col rounded-l-2xl border-y border-l border-iw-border bg-iw-bg shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-iw-border px-4 py-3">
        <span className="text-[12px] font-bold uppercase tracking-widest text-iw-text-muted">
          Reading Options
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-iw-text-muted transition-colors hover:text-white"
          aria-label="Close settings"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Reading Mode */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Reading Mode
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(['section', 'verse'] as ReadMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update({ mode: m })}
                  className={[
                    'rounded-lg border py-2 text-[12px] font-medium transition-colors',
                    settings.mode === m
                      ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                  ].join(' ')}
                >
                  {m === 'section' ? '¶ Sectional' : '# Verse by Verse'}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Language — pill group (IW-QN.4) */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Reading Language
            </p>
            <div className="grid grid-cols-3 gap-1">
              {([
                { id: 'en' as ReadingLang, label: 'English' },
                { id: 'ar' as ReadingLang, label: 'Arabic' },
                { id: 'id' as ReadingLang, label: 'Indonesian' },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const next: Partial<Settings> = { reading_lang: id }
                    if (id === 'ar') { next.showArabic = true; next.showEnglish = false; next.showTranslit = false }
                    else if (id === 'id') { next.showArabic = false; next.showEnglish = true; next.translation = settings.translation in TRANSLATIONS_ID ? settings.translation : 'kemenag' }
                    else { next.showEnglish = true }
                    update(next)
                  }}
                  className={[
                    'rounded-lg border py-2 text-[11px] font-medium transition-colors',
                    settings.reading_lang === id
                      ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Display toggles */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Show
            </p>
            <div className="space-y-2">
              {[
                { key: 'showArabic', label: 'Arabic text', emoji: 'ع' },
                { key: 'showTranslit', label: 'Transliteration', emoji: 'a' },
                { key: 'showEnglish', label: 'Translation', emoji: 'En' },
              ].map(({ key, label, emoji }) => {
                const isOn = settings[key as keyof Settings] === true
                return (
                  <label key={key} className="flex cursor-pointer items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] text-iw-text-secondary">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-iw-surface text-[10px] font-bold text-iw-text-muted">
                        {emoji}
                      </span>
                      {label}
                    </span>
                    <span className="relative inline-flex h-5 w-9 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => update({ [key]: !settings[key as keyof Settings] })}
                        className="peer sr-only"
                      />
                      <span className={[
                        'h-5 w-9 rounded-full border transition-colors',
                        isOn ? 'border-iw-accent bg-iw-accent/20' : 'border-iw-border bg-iw-surface',
                      ].join(' ')}>
                        <span className={[
                          'absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform',
                          isOn ? 'translate-x-[18px] bg-iw-accent' : 'translate-x-0.5 bg-iw-text-muted',
                        ].join(' ')} />
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Text Size */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Text Size
            </p>
            <div className="grid grid-cols-4 gap-1">
              {([
                { id: 'sm', label: 'A', size: 'text-[11px]' },
                { id: 'md', label: 'A', size: 'text-[13px]' },
                { id: 'lg', label: 'A', size: 'text-[15px]' },
                { id: 'xl', label: 'A', size: 'text-[18px]' },
              ] as { id: FontSize; label: string; size: string }[]).map(({ id, label, size }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ fontSize: id })}
                  className={[
                    'flex items-center justify-center rounded-lg border py-2 font-semibold transition-colors',
                    size,
                    settings.fontSize === id
                      ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Width */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Width
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { id: 'wide', label: '⟷ Full width' },
                { id: 'narrow', label: '⟵⟶ Narrow' },
              ] as { id: ContentWidth; label: string }[]).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ contentWidth: id })}
                  className={[
                    'rounded-lg border py-2 text-[12px] font-medium transition-colors',
                    settings.contentWidth === id
                      ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Translation */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
              Translation
            </p>
            <div className="flex flex-wrap gap-1">
              {featuredKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ translation: key })}
                  className={[
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                    settings.translation === key
                      ? 'border-iw-accent bg-iw-accent/15 text-iw-accent'
                      : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                  ].join(' ')}
                >
                  {SHORT_LABELS[key] ?? translationLabels[key] ?? key}
                </button>
              ))}
            </div>
            {extraKeys.length > 0 && (
              <select
                aria-label="More translations"
                value={extraKeys.includes(settings.translation) ? settings.translation : ''}
                onChange={(e) => e.target.value && update({ translation: e.target.value })}
                className="mt-2 w-full rounded-lg border border-iw-border bg-iw-surface px-3 py-1.5 text-[12px] text-iw-text-secondary"
              >
                <option value="">More translations…</option>
                {extraKeys.map((key) => (
                  <option key={key} value={key}>{TRANSLATIONS[key]}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Verse row (verse-by-verse mode) ───────────────────────────────────────────

interface VerseRowProps {
  ayah: AyahData
  settings: Settings
  isFocused: boolean
  isCurrentAudio: boolean
  isPlaying: boolean
  onPlay: (n: number) => void
  onClickVerse: (n: number) => void
  onTafsir: (n: number) => void
  focusRef?: React.RefObject<HTMLElement | null>
}

function VerseRow({
  ayah, settings, isFocused, isCurrentAudio, isPlaying, onPlay, onClickVerse, onTafsir, focusRef,
}: VerseRowProps) {
  const translationText = pickTranslation(ayah, settings.translation)

  return (
    <div
      ref={focusRef as React.RefObject<HTMLDivElement | null>}
      id={`v${ayah.number_in_surah}`}
      className={[
        'rounded-xl border p-5 transition-colors',
        isCurrentAudio
          ? 'border-iw-accent/40 bg-iw-surface ring-1 ring-iw-accent/20'
          : isFocused
            ? 'border-iw-accent/40 bg-iw-surface ring-1 ring-iw-accent/20'
            : 'border-iw-border bg-iw-surface',
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onClickVerse(ayah.number_in_surah)}
            title={`Verse ${ayah.number_in_surah}`}
            className={[
              'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-opacity hover:opacity-70',
              isCurrentAudio ? 'bg-iw-accent text-[#0D2F17]' : 'bg-iw-accent/10 text-iw-accent',
            ].join(' ')}
          >
            {toArabicIndic(ayah.number_in_surah)}
          </button>
          <PlayAyahButton
            ayahNumber={ayah.number_in_surah}
            isCurrentAyah={isCurrentAudio}
            isPlaying={isPlaying && isCurrentAudio}
            onPlay={onPlay}
          />
        </div>
        <button
          type="button"
          onClick={() => onTafsir(ayah.number_in_surah)}
          className="rounded-md border border-iw-border px-2 py-0.5 text-[11px] text-iw-text-muted transition-colors hover:border-iw-accent/40 hover:text-iw-accent"
        >
          Tafsir
        </button>
      </div>

      {settings.showArabic && (
        <p className="quran-text mb-4 text-justify text-2xl leading-loose" dir="rtl">
          {normalizeArabic(ayah.text_ar)}
        </p>
      )}

      {settings.showTranslit && ayah.transliteration && (
        <p className="mb-2 text-xs italic leading-relaxed text-iw-text-muted">
          {ayah.transliteration}
        </p>
      )}

      {settings.showEnglish && (
        <p className={`${FONT_SIZE_CLASSES[settings.fontSize]} text-justify text-iw-text-secondary`}>
          {translationText || <span className="italic text-iw-text-muted">Translation not available</span>}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function getStoredReadingLang(): ReadingLang | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem('iw_reading_lang')
    if (v === 'en' || v === 'ar' || v === 'id') return v
  } catch { /* ignore */ }
  return null
}

function getInitialSettings(locale?: string): Settings {
  // Locale-derived reading_lang (IW-QN.3): locale prop takes priority over stored pref on first load
  const localeLang: ReadingLang | null =
    locale === 'ar' ? 'ar' : locale === 'id' ? 'id' : null
  const reading_lang: ReadingLang = localeLang ?? getStoredReadingLang() ?? 'en'

  if (reading_lang === 'ar') {
    return { mode: 'section', showArabic: true, showTranslit: false, showEnglish: false, translation: 'iwq', fontSize: 'md', contentWidth: 'wide', reading_lang: 'ar' }
  }
  if (reading_lang === 'id') {
    return { mode: 'section', showArabic: false, showTranslit: false, showEnglish: true, translation: 'kemenag', fontSize: 'md', contentWidth: 'wide', reading_lang: 'id' }
  }
  return { mode: 'section', showArabic: false, showTranslit: false, showEnglish: true, translation: 'iwq', fontSize: 'md', contentWidth: 'wide', reading_lang: 'en' }
}

/** Pick translation text, using the Indonesian map when the key is an id-locale translation */
function pickTranslation(ayah: AyahData, key: string): string {
  if (isIdTranslation(key)) return ayah.translations_id?.[key] ?? ''
  return ayah.translations?.[key] ?? ayah.translations?.['iwq'] ?? ''
}

export function SurahViewer({
  surahNumber,
  surahName,
  surahNameAr,
  totalAyahs,
  ayahs,
  focusFrom,
  focusTo,
  locale,
}: SurahViewerProps) {
  const [settings, setSettings] = useState<Settings>(() => getInitialSettings(locale))
  // 'gear' | 'audio' | null — only one drawer open at a time
  const [activeDrawer, setActiveDrawer] = useState<'gear' | 'audio' | null>(null)
  const [autoScroll, setAutoScroll] = useState<AutoScrollMode>('section')
  const [showTip, setShowTip] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return !localStorage.getItem('iw:quran:gear-seen') } catch { return false }
  })
  const [tafsirVerse, setTafsirVerse] = useState<{ from: number; to: number } | null>(null)

  const focusRef = useRef<HTMLElement | null>(null)
  const groupsRef = useRef<AyahGroup[]>([])
  const lastScrolledSectionRef = useRef(-1)
  const autoScrollRef = useRef<AutoScrollMode>('section')

  // Refs for click-outside detection
  const gearTabRef = useRef<HTMLButtonElement | null>(null)
  const gearDrawerRef = useRef<HTMLDivElement | null>(null)
  const audioTabRef = useRef<HTMLButtonElement | null>(null)
  const audioDrawerRef = useRef<HTMLDivElement | null>(null)

  const groups = useMemo(() => groupByRuku(ayahs), [ayahs])
  useEffect(() => { groupsRef.current = groups }, [groups])
  useEffect(() => { autoScrollRef.current = autoScroll }, [autoScroll])

  const update = useCallback((partial: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...partial }))
    // Persist reading_lang to localStorage (IW-QN.1)
    if (partial.reading_lang !== undefined) {
      try { localStorage.setItem('iw_reading_lang', partial.reading_lang) } catch { /* ignore */ }
    }
  }, [])

  // First-visit tip is initialized via useState lazy initializer above

  const dismissTip = useCallback(() => {
    setShowTip(false)
    try { localStorage.setItem('iw:quran:gear-seen', '1') } catch { /* ignore */ }
  }, [])

  // Handle verse change from audio — respects autoScroll setting
  const handleAyahChange = useCallback((n: number) => {
    const mode = autoScrollRef.current
    if (mode === 'off') return

    if (mode === 'section') {
      const idx = groupsRef.current.findIndex((gr) => gr.ayahs.some((a) => a.number_in_surah === n))
      // Only scroll when entering a new section
      if (idx === -1 || idx === lastScrolledSectionRef.current) return
      lastScrolledSectionRef.current = idx
      const el = document.getElementById(`section-${idx}`)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    } else {
      // verse mode: scroll to the individual verse element
      const el = document.getElementById(`v${n}`)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }
  }, [])

  const audio = useAudioPlayer({ surahNumber, totalAyahs, onAyahChange: handleAyahChange })

  const handlePlayAyah = useCallback((n: number) => {
    lastScrolledSectionRef.current = -1
    audio.playAyah(n)
  }, [audio])

  const handlePlayRange = useCallback((from: number, to: number) => {
    lastScrolledSectionRef.current = -1
    audio.playRange(from, to)
  }, [audio])

  const handlePlayEntireSurah = useCallback(() => {
    lastScrolledSectionRef.current = -1
    const firstVerse = ayahs[0]?.number_in_surah ?? 1
    audio.playAyah(firstVerse)
    const el = document.getElementById('section-0')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }
  }, [audio, ayahs])

  // Click a verse number: scroll there, update URL silently, jump audio if active
  const handleClickVerse = useCallback((n: number) => {
    // Scroll to the verse
    const el = document.getElementById(`v${n}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    } else {
      // Fallback: scroll to section containing this verse
      const idx = groupsRef.current.findIndex((gr) => gr.ayahs.some((a) => a.number_in_surah === n))
      if (idx !== -1) {
        const sectionEl = document.getElementById(`section-${idx}`)
        if (sectionEl) {
          const top = sectionEl.getBoundingClientRect().top + window.scrollY - 96
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
        }
      }
    }
    // Update URL silently (no navigation)
    window.history.replaceState(null, '', `/quran/${surahNumber}/${n}`)
    // Jump audio if it's already active
    if (audio.state !== 'idle') {
      lastScrolledSectionRef.current = -1
      audio.playAyah(n)
    }
  }, [audio, surahNumber])

  const handleJumpToVerse = useCallback((n: number) => {
    const el = document.getElementById(`v${n}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      return
    }
    // Fallback to section containing this verse
    const idx = groupsRef.current.findIndex((gr) => gr.ayahs.some((a) => a.number_in_surah === n))
    if (idx === -1) return
    const sectionEl = document.getElementById(`section-${idx}`)
    if (!sectionEl) return
    const top = sectionEl.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [])

  const toggleGear = useCallback(() => {
    setActiveDrawer((d) => (d === 'gear' ? null : 'gear'))
    dismissTip()
  }, [dismissTip])

  const toggleAudio = useCallback(() => {
    setActiveDrawer((d) => (d === 'audio' ? null : 'audio'))
  }, [])

  // Close drawers on outside click
  useEffect(() => {
    if (!activeDrawer) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        gearTabRef.current?.contains(t) ||
        gearDrawerRef.current?.contains(t) ||
        audioTabRef.current?.contains(t) ||
        audioDrawerRef.current?.contains(t)
      ) return
      setActiveDrawer(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activeDrawer])

  // Scroll to URL-focused verse
  useEffect(() => {
    if (!focusFrom) return
    const timer = setTimeout(() => {
      focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
    return () => clearTimeout(timer)
  }, [focusFrom])

  const isFocused = (n: number) =>
    focusFrom !== undefined && focusTo !== undefined && n >= focusFrom && n <= focusTo

  const isAudioActive = audio.state !== 'idle'
  const isAudioPlaying = audio.state === 'playing'

  const showBismillah =
    surahNumber !== 1 && surahNumber !== 9 && (ayahs[0]?.number_in_surah ?? 1) === 1

  const isArabicMode = settings.reading_lang === 'ar'

  return (
    <>
      <div className="relative" dir={isArabicMode ? 'rtl' : undefined}>
        {/* Arabic surah name (when Arabic mode is on) */}
        {surahNameAr && settings.showArabic && (
          <p className="arabic-text mb-4 text-center text-2xl text-white/80">{surahNameAr}</p>
        )}

        {/* Bismillah */}
        {showBismillah && (
          <p className="arabic-text mb-6 text-center text-xl text-iw-text-secondary">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* Toolbar: Play Entire Surah only (Options gear is now a fixed right-edge tab) */}
        <div className={`mb-6 flex items-center ${settings.contentWidth === 'narrow' ? 'mx-auto max-w-3xl' : ''}`}>
          <button
            type="button"
            onClick={handlePlayEntireSurah}
            className={[
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              isAudioActive
                ? 'border-iw-accent/40 text-iw-accent'
                : 'border-iw-border text-iw-text-secondary hover:border-iw-accent hover:text-white',
            ].join(' ')}
          >
            <svg className={`h-4 w-4 ${isArabicMode ? 'scale-x-[-1]' : ''}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            {isAudioActive
              ? (isArabicMode ? 'يُشغَّل الآن' : 'Now playing')
              : (isArabicMode ? 'تشغيل السورة كاملةً' : 'Play Entire Surah')}
          </button>
        </div>

        {/* ── Section mode ── */}
        {settings.mode === 'section' && (
          <div className={`space-y-2 ${settings.contentWidth === 'narrow' ? 'mx-auto max-w-3xl' : ''}`}>
            {groups.map((group, gi) => {
              const isCurrentSection =
                isAudioActive && group.ayahs.some((a) => a.number_in_surah === audio.currentAyah)

              return (
                <div
                  key={gi}
                  id={`section-${gi}`}
                  className={[
                    'rounded-xl border p-6 transition-colors',
                    isCurrentSection
                      ? 'border-iw-accent/30 bg-iw-surface'
                      : 'border-iw-border bg-iw-surface',
                  ].join(' ')}
                >
                  {/* Section header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-iw-border/50" />
                    <span className={[
                      'text-[10px] font-bold uppercase tracking-widest',
                      isCurrentSection ? 'text-iw-accent' : 'text-iw-text-muted',
                    ].join(' ')}>
                      {isArabicMode
                        ? `المقطع ${toArabicIndic(gi + 1)} · الآيات ${toArabicIndic(group.ayahs[0].number_in_surah)}${group.ayahs.length > 1 ? `–${toArabicIndic(group.ayahs[group.ayahs.length - 1].number_in_surah)}` : ''}`
                        : `Section ${gi + 1} · Verses ${group.ayahs[0].number_in_surah}${group.ayahs.length > 1 ? `–${group.ayahs[group.ayahs.length - 1].number_in_surah}` : ''}`
                      }
                    </span>
                    <div className="h-px flex-1 bg-iw-border/50" />
                  </div>

                  {/* Arabic block */}
                  {settings.showArabic && (
                    <p className="quran-text mb-5 text-justify text-2xl leading-[2.2] text-white/90" dir="rtl">
                      {group.ayahs.map((a) => {
                        const focused = isFocused(a.number_in_surah)
                        const isCurrentVerse = isAudioActive && audio.currentAyah === a.number_in_surah
                        return (
                          <span
                            key={a.number_in_surah}
                            ref={
                              focused && a.number_in_surah === focusFrom
                                ? (el) => { focusRef.current = el }
                                : undefined
                            }
                            id={`v${a.number_in_surah}`}
                            className={[
                              'box-decoration-clone rounded-sm pt-[0.375em] pb-[0.3125em] transition-colors',
                              isCurrentVerse ? 'bg-iw-accent/50 text-white' : '',
                              focused && !isCurrentVerse ? 'bg-iw-accent/5 text-white' : '',
                            ].join(' ').trim()}
                          >
                            {normalizeArabic(a.text_ar)}
                            {' '}
                            <button
                              type="button"
                              onClick={() => handleClickVerse(a.number_in_surah)}
                              title={`Verse ${a.number_in_surah}`}
                              className={[
                                'mx-1 cursor-pointer text-base transition-colors',
                                isCurrentVerse ? 'text-iw-accent' : 'text-iw-accent/60 hover:text-iw-accent',
                              ].join(' ')}
                            >
                              ﴿{toArabicIndic(a.number_in_surah)}﴾
                            </button>
                            {' '}
                          </span>
                        )
                      })}
                    </p>
                  )}

                  {/* Transliteration block */}
                  {settings.showTranslit && (
                    <div className="mb-4 space-y-0.5">
                      {group.ayahs.map((a) => (
                        <p key={a.number_in_surah} className="text-xs italic leading-relaxed text-iw-text-muted">
                          <span className="mr-1.5 not-italic text-iw-accent/50">{isArabicMode ? toArabicIndic(a.number_in_surah) : a.number_in_surah}.</span>
                          {a.transliteration}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Translation — inline paragraph with per-verse highlighting */}
                  {settings.showEnglish && (
                    <p className={`${FONT_SIZE_CLASSES[settings.fontSize]} text-justify text-iw-text-secondary`}>
                      {group.ayahs.map((a) => {
                        const focused = isFocused(a.number_in_surah)
                        const isCurrentVerse = isAudioActive && audio.currentAyah === a.number_in_surah
                        const text = pickTranslation(a, settings.translation)
                        return (
                          <span
                            key={a.number_in_surah}
                            ref={
                              !settings.showArabic && focused && a.number_in_surah === focusFrom
                                ? (el) => { focusRef.current = el }
                                : undefined
                            }
                            id={!settings.showArabic ? `v${a.number_in_surah}` : undefined}
                            className={[
                              'box-decoration-clone rounded-sm pt-[0.375em] pb-[0.3125em] transition-colors',
                              isCurrentVerse ? 'bg-iw-accent/50 text-white' : '',
                              focused && !isCurrentVerse ? 'bg-iw-accent/5 text-white' : '',
                            ].join(' ').trim()}
                          >
                            <button
                              type="button"
                              onClick={() => handleClickVerse(a.number_in_surah)}
                              className="mr-1 cursor-pointer text-sm text-iw-accent hover:text-iw-accent/70"
                              title={`Verse ${a.number_in_surah}`}
                            >
                              ﴾{toArabicIndic(a.number_in_surah)}﴿{' '}
                            </button>
                            {text}{' '}
                          </span>
                        )
                      })}
                    </p>
                  )}

                  {!settings.showArabic && !settings.showTranslit && !settings.showEnglish && (
                    <p className="text-sm text-iw-text-muted">
                      {isArabicMode
                        ? 'فعِّل العربية أو التلاوة أو الترجمة من الخيارات'
                        : 'Enable Arabic, Transliteration, or English in Options →'}
                    </p>
                  )}

                  {/* Section footer: play + tafsir */}
                  <div className="mt-3 flex items-center gap-3 border-t border-iw-border/50 pt-3">
                    <button
                      type="button"
                      onClick={() => handlePlayRange(group.ayahs[0].number_in_surah, group.ayahs[group.ayahs.length - 1].number_in_surah)}
                      className={[
                        'flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] transition-colors',
                        isCurrentSection
                          ? 'border-iw-accent/40 text-iw-accent'
                          : 'border-iw-border text-iw-text-secondary hover:border-iw-accent hover:text-white',
                      ].join(' ')}
                    >
                      <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                      {isArabicMode
                        ? `تشغيل ${toArabicIndic(surahNumber)}:${toArabicIndic(group.ayahs[0].number_in_surah)}${group.ayahs.length > 1 ? `–${toArabicIndic(group.ayahs[group.ayahs.length - 1].number_in_surah)}` : ''}`
                        : `Play ${surahNumber}:${group.ayahs[0].number_in_surah}${group.ayahs.length > 1 ? `–${group.ayahs[group.ayahs.length - 1].number_in_surah}` : ''}`
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTafsirVerse({
                          from: group.ayahs[0].number_in_surah,
                          to: group.ayahs[group.ayahs.length - 1].number_in_surah,
                        })
                      }
                      className="ml-auto flex items-center gap-1.5 text-[11px] text-iw-text-muted transition-colors hover:text-iw-accent"
                    >
                      {isArabicMode ? 'تفسير' : 'Tafsir'}
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Verse-by-verse mode ── */}
        {settings.mode === 'verse' && (
          <div className={`space-y-3 ${settings.contentWidth === 'narrow' ? 'mx-auto max-w-3xl' : ''}`}>
            {ayahs.map((ayah) => (
              <VerseRow
                key={ayah.number_in_surah}
                ayah={ayah}
                settings={settings}
                isFocused={isFocused(ayah.number_in_surah)}
                isCurrentAudio={isAudioActive && audio.currentAyah === ayah.number_in_surah}
                isPlaying={isAudioPlaying && audio.currentAyah === ayah.number_in_surah}
                onPlay={handlePlayAyah}
                onClickVerse={handleClickVerse}
                onTafsir={(n) => setTafsirVerse({ from: n, to: n })}
                focusRef={
                  isFocused(ayah.number_in_surah) && ayah.number_in_surah === focusFrom
                    ? focusRef
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Fixed right-edge tab buttons ── */}

      {/* Gear tab (Options) — positioned above the audio tab */}
      <button
        ref={gearTabRef}
        type="button"
        onClick={toggleGear}
        aria-label={activeDrawer === 'gear' ? 'Close reading options' : 'Open reading options'}
        className={[
          'fixed right-0 top-[128px] z-50 flex h-14 w-9 items-center justify-center',
          'rounded-l-xl border-y border-l shadow-md transition-all duration-200',
          activeDrawer === 'gear'
            ? 'border-iw-accent bg-iw-accent text-[#0D2F17]'
            : 'border-iw-accent/50 bg-iw-accent/10 text-iw-accent hover:bg-iw-accent/20',
        ].join(' ')}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* First-visit tooltip — points to the gear tab */}
      {showTip && activeDrawer !== 'gear' && (
        <div className="fixed right-11 top-[128px] z-50 w-64 rounded-xl border border-iw-accent/40 bg-iw-surface px-4 py-3 shadow-xl shadow-black/40">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-iw-accent">Options</p>
          <p className="text-[12px] leading-relaxed text-iw-text-secondary">
            Click here to change translation, show Arabic, switch reading format, adjust text size, and more.
          </p>
          {/* Caret pointing right toward the tab */}
          <div className="absolute -right-1.5 top-4 h-3 w-3 rotate-45 border-r border-t border-iw-accent/40 bg-iw-surface" />
        </div>
      )}

      {/* Gear drawer */}
      <div
        ref={gearDrawerRef}
        className={`fixed right-0 top-20 z-50 h-[calc(100vh-5rem)] w-72 transform transition-transform duration-300 ease-in-out ${
          activeDrawer === 'gear' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <GearPanel settings={settings} update={update} onClose={() => setActiveDrawer(null)} locale={locale} />
      </div>

      {/* Audio player (tab + drawer) */}
      <AudioPlayer
        surahName={surahName}
        totalAyahs={totalAyahs}
        audioState={audio.state}
        currentAyah={audio.currentAyah}
        reciter={audio.reciter}
        speed={audio.speed}
        progress={audio.progress}
        audioError={audio.error}
        isOpen={activeDrawer === 'audio'}
        autoScroll={autoScroll}
        tabRef={audioTabRef}
        drawerRef={audioDrawerRef}
        onToggle={toggleAudio}
        onPlay={audio.play}
        onPause={audio.pause}
        onStop={audio.stop}
        onRetry={audio.retry}
        onChangeReciter={audio.changeReciter}
        onChangeSpeed={audio.changeSpeed}
        onAutoScrollChange={setAutoScroll}
        onJumpToVerse={handleJumpToVerse}
      />

      {/* ── Tafsir modal ── */}
      {tafsirVerse && (
        <TafsirModal
          surahNumber={surahNumber}
          surahName={surahName}
          from={tafsirVerse.from}
          to={tafsirVerse.to}
          onClose={() => setTafsirVerse(null)}
        />
      )}
    </>
  )
}
