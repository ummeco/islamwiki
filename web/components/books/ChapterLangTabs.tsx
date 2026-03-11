'use client'

import { useEffect, useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

type Lang = 'en' | 'ar' | 'id'

interface ChapterLangTabsProps {
  contentEn?: string
  contentAr?: string
  contentId?: string
}

const LABELS: Record<Lang, string> = {
  en: 'English',
  ar: 'Arabic',
  id: 'Indonesian',
}

export function ChapterLangTabs({ contentEn, contentAr, contentId }: ChapterLangTabsProps) {
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
          className="prose prose-invert max-w-none text-iw-text-secondary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentEn) }}
        />
      )}

      {activeLang === 'ar' && contentAr && (
        <div
          dir="rtl"
          lang="ar"
          className="arabic-text text-lg leading-loose text-white/90"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentAr) }}
        />
      )}

      {activeLang === 'id' && contentId && (
        <div
          className="prose prose-invert max-w-none text-iw-text-secondary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentId) }}
        />
      )}
    </div>
  )
}
