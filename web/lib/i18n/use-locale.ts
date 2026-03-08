'use client'

import { usePathname } from 'next/navigation'
import { LOCALES, DEFAULT_LOCALE, type Locale } from './config'

/**
 * Client-side hook to detect the current locale from the URL path.
 */
export function useLocale(): Locale {
  const pathname = usePathname()
  const firstSegment = pathname.split('/')[1]

  if (firstSegment && LOCALES.includes(firstSegment as Locale) && firstSegment !== DEFAULT_LOCALE) {
    return firstSegment as Locale
  }

  // Check localStorage preference as fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('iw-locale')
    if (stored && LOCALES.includes(stored as Locale)) {
      return stored as Locale
    }
  }

  return DEFAULT_LOCALE
}
