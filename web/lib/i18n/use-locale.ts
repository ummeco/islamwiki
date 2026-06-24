'use client'

import { LOCALES, DEFAULT_LOCALE, type Locale } from './config'

/**
 * Client-side locale resolver for React islands (framework-agnostic — no next/navigation).
 *
 * Astro islands do not have a router hook like next's `usePathname`. The hosting
 * `.astro` page knows the locale (`Astro.locals.locale`) and the request path, so
 * it passes the pathname in as a prop. This function derives the locale from that
 * path, falling back to a localStorage preference and then the default.
 *
 * @param pathname - the current URL path. In an island, pass the value the parent
 *   `.astro` provides (e.g. `Astro.url.pathname`); when omitted it reads
 *   `window.location.pathname` on the client.
 */
export function useLocale(pathname?: string): Locale {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const firstSegment = path.split('/')[1]

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
