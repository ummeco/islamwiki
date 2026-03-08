'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_NAMES, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  ar: '🇸🇦',
  id: '🇮🇩',
}

interface LocaleSwitcherProps {
  currentLocale: Locale
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getLocalizedPath(locale: Locale): string {
    // Strip any existing locale prefix
    let cleanPath = pathname
    for (const loc of LOCALES) {
      if (loc !== DEFAULT_LOCALE && pathname.startsWith(`/${loc}/`)) {
        cleanPath = pathname.slice(loc.length + 1)
        break
      }
      if (loc !== DEFAULT_LOCALE && pathname === `/${loc}`) {
        cleanPath = '/'
        break
      }
    }

    if (locale === DEFAULT_LOCALE) return cleanPath
    return `/${locale}${cleanPath}`
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm hover:bg-iw-surface/50 transition-colors"
        aria-label="Change language"
      >
        <span>{LOCALE_FLAGS[currentLocale]}</span>
        <span className="hidden sm:inline">{LOCALE_NAMES[currentLocale]}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-iw-bg border border-iw-border rounded-lg shadow-lg py-1 min-w-[160px] z-50">
          {LOCALES.map((locale) => (
            <a
              key={locale}
              href={getLocalizedPath(locale)}
              className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-iw-surface/50 transition-colors ${
                locale === currentLocale ? 'font-medium text-iw-accent' : 'text-iw-text'
              }`}
              onClick={() => {
                setOpen(false)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('iw-locale', locale)
                }
              }}
            >
              <span>{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_NAMES[locale]}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
