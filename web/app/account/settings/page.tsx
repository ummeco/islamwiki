'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RECITERS, type ReciterKey } from '@/hooks/useAudioPlayer'

// ── Constants ─────────────────────────────────────────────────────────────────

type ReadingLang = 'en' | 'ar' | 'id'

const LANGUAGES: { id: ReadingLang; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ar', label: 'Arabic', native: 'العربية' },
  { id: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
]

const TRANSLATIONS_EN: Record<string, string> = {
  iwq: 'Islam.wiki (IWQ) ✦',
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

const TAFSIR_SOURCES: Record<string, string> = {
  'ibn-kathir-en': 'Tafsir Ibn Kathir (EN)',
  'maariful-en': 'Maariful Quran (EN)',
  'zilal-en': 'In the Shade of the Quran (EN)',
  'ibn-kathir-ar': 'Tafsir Ibn Kathir (AR)',
  'tabari-ar': 'Tafsir al-Tabari (AR)',
  'qurtubi-ar': 'Tafsir al-Qurtubi (AR)',
  'baghawi-ar': 'Tafsir al-Baghawi (AR)',
  'sadi-ar': "Tafsir al-Sa'di (AR)",
  'muyassar-ar': 'Tafsir al-Muyassar (AR)',
  'jalalayn-ar': 'Tafsir al-Jalalayn (AR)',
  'siraj-ar': 'Tafsir al-Siraj al-Munir (AR)',
  'wasit-ar': 'Tafsir al-Wasit (AR)',
  'jalalayn-id': 'Tafsir al-Jalalayn (ID)',
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [lang, setLang] = useState<ReadingLang>('en')
  const [reciter, setReciter] = useState<ReciterKey>('Alafasy_128kbps')
  const [translation, setTranslation] = useState<string>('iwq')
  const [tafsir, setTafsir] = useState<string>('ibn-kathir-en')
  const [saved, setSaved] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedLang = lsGet('iw_reading_lang')
    if (storedLang === 'en' || storedLang === 'ar' || storedLang === 'id') setLang(storedLang)
    const storedReciter = lsGet('iw_reciter')
    if (storedReciter && storedReciter in RECITERS) setReciter(storedReciter as ReciterKey)
    const storedTranslation = lsGet('iw_translation')
    if (storedTranslation) setTranslation(storedTranslation)
    const storedTafsir = lsGet('iw_tafsir')
    if (storedTafsir) setTafsir(storedTafsir)
  }, [])

  function save(updates: { lang?: ReadingLang; reciter?: ReciterKey; translation?: string; tafsir?: string }) {
    if (updates.lang) { setLang(updates.lang); lsSet('iw_reading_lang', updates.lang) }
    if (updates.reciter) { setReciter(updates.reciter); lsSet('iw_reciter', updates.reciter) }
    if (updates.translation) { setTranslation(updates.translation); lsSet('iw_translation', updates.translation) }
    if (updates.tafsir) { setTafsir(updates.tafsir); lsSet('iw_tafsir', updates.tafsir) }
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const translationMap = lang === 'id' ? TRANSLATIONS_ID : TRANSLATIONS_EN
  const defaultTranslation = lang === 'id' ? 'kemenag' : 'iwq'

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/account" className="text-iw-text-muted transition-colors hover:text-white" aria-label="Back to account">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">Preferences</h1>
          <p className="text-xs text-iw-text-muted">Saved locally in your browser</p>
        </div>
        {saved && (
          <span className="ml-auto text-xs font-medium text-iw-accent">Saved</span>
        )}
      </div>

      <div className="space-y-8">
        {/* Language */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
            Reading Language
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => save({ lang: l.id, translation: defaultTranslation })}
                className={[
                  'rounded-lg border py-3 text-center transition-colors',
                  lang === l.id
                    ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
                    : 'border-iw-border text-iw-text-muted hover:border-iw-text-muted hover:text-white',
                ].join(' ')}
              >
                <div className="text-[13px] font-semibold">{l.label}</div>
                <div className="mt-0.5 text-[11px] opacity-70">{l.native}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Translation */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
            Default Translation
          </h2>
          <div className="space-y-1">
            {Object.entries(translationMap).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => save({ translation: key })}
                className={[
                  'flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
                  translation === key
                    ? 'border-iw-accent bg-iw-accent/10 text-white'
                    : 'border-iw-border text-iw-text-secondary hover:border-iw-text-muted hover:text-white',
                ].join(' ')}
              >
                <span>{label}</span>
                {translation === key && (
                  <svg className="h-4 w-4 text-iw-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Reciter */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
            Default Quran Reciter
          </h2>
          <div className="space-y-1">
            {(Object.entries(RECITERS) as [ReciterKey, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => save({ reciter: key })}
                className={[
                  'flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
                  reciter === key
                    ? 'border-iw-accent bg-iw-accent/10 text-white'
                    : 'border-iw-border text-iw-text-secondary hover:border-iw-text-muted hover:text-white',
                ].join(' ')}
              >
                <span>{label}</span>
                {reciter === key && (
                  <svg className="h-4 w-4 text-iw-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Tafsir */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-iw-text-muted">
            Default Tafsir Source
          </h2>
          <div className="space-y-1">
            {Object.entries(TAFSIR_SOURCES).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => save({ tafsir: key })}
                className={[
                  'flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
                  tafsir === key
                    ? 'border-iw-accent bg-iw-accent/10 text-white'
                    : 'border-iw-border text-iw-text-secondary hover:border-iw-text-muted hover:text-white',
                ].join(' ')}
              >
                <span>{label}</span>
                {tafsir === key && (
                  <svg className="h-4 w-4 text-iw-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center text-xs text-iw-text-muted">
        Settings are saved in your browser.{' '}
        <Link href="/account" className="text-iw-accent hover:underline">
          Sign in
        </Link>{' '}
        to sync across devices (coming in v0.3).
      </p>
    </div>
  )
}
