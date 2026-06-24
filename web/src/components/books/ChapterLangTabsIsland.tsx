/**
 * ChapterLangTabsIsland.tsx — Astro island: EN/AR/ID language tabs for a chapter.
 *
 * PURPOSE: Ports components/books/ChapterLangTabs.tsx to an Astro island.
 * SECURITY (HARD): The chapter HTML is sanitized SERVER-SIDE via lib/sanitize
 *   sanitizeHtml() in the .astro page BEFORE being passed in. This island
 *   receives ALREADY-SANITIZED strings and only switches which one is visible —
 *   it performs NO further fetching and never receives raw HTML. The XSS gate
 *   stays in the server frontmatter, exactly as the Next page sanitized at the
 *   call site (the Next component re-sanitized; here sanitization is hoisted to
 *   the server so the island boundary never carries unsanitized markup).
 * INPUTS: contentEn/contentAr/contentId — pre-sanitized HTML strings (or undefined).
 * OUTPUTS: Tabbed, hydrated chapter reader.
 * CONSTRAINTS: No next/* imports. window/history accessed only in handlers/effects.
 * REF: ports components/books/ChapterLangTabs.tsx · D-P2-STACK-CANON
 */
import { useEffect, useState } from 'react'

type Lang = 'en' | 'ar' | 'id'

interface ChapterLangTabsIslandProps {
  /** Pre-sanitized (lib/sanitize sanitizeHtml) HTML — sanitization done server-side. */
  contentEn?: string
  contentAr?: string
  contentId?: string
}

const LABELS: Record<Lang, string> = {
  en: 'English',
  ar: 'Arabic',
  id: 'Indonesian',
}

export default function ChapterLangTabsIsland({
  contentEn,
  contentAr,
  contentId,
}: ChapterLangTabsIslandProps) {
  const available: Lang[] = []
  if (contentEn) available.push('en')
  if (contentAr) available.push('ar')
  if (contentId) available.push('id')

  const defaultLang: Lang = available[0] ?? 'en'
  const [activeLang, setActiveLang] = useState<Lang>(defaultLang)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const langParam = params.get('lang') as Lang | null
    if (langParam && available.includes(langParam)) {
      setActiveLang(langParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function switchLang(lang: Lang) {
    setActiveLang(lang)
    const params = new URLSearchParams(window.location.search)
    params.set('lang', lang)
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }

  if (available.length === 0) {
    return (
      <p className="italic text-iw-text-muted">
        Chapter content is being prepared. Check back soon.
      </p>
    )
  }

  return (
    <div>
      {available.length > 1 && (
        <div className="mb-6 flex gap-1 border-b border-iw-border">
          {available.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLang(lang)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeLang === lang
                  ? '-mb-px border-b-2 border-iw-accent text-iw-accent'
                  : 'text-iw-text-muted hover:text-iw-text'
              }`}
            >
              {LABELS[lang]}
            </button>
          ))}
        </div>
      )}

      {activeLang === 'en' && contentEn && (
        <div
          className="book-prose"
          dangerouslySetInnerHTML={{ __html: contentEn }}
        />
      )}

      {activeLang === 'ar' && contentAr && (
        <div
          dir="rtl"
          lang="ar"
          className="arabic-text text-lg leading-loose text-white/90"
          dangerouslySetInnerHTML={{ __html: contentAr }}
        />
      )}

      {activeLang === 'id' && contentId && (
        <div
          className="book-prose"
          dangerouslySetInnerHTML={{ __html: contentId }}
        />
      )}
    </div>
  )
}
