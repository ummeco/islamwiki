/**
 * S9-29: Hreflang utilities for Islam.wiki multi-locale routes.
 *
 * Supports locales: en (default), ar (RTL), id (Bahasa Indonesia).
 * Hreflang alternates are added to all 8 route types:
 * quran · hadith · people · history · videos · audio · sects · books
 *
 * Usage in generateMetadata():
 *   const alternates = getHreflangAlternates('/hadith/bukhari/1/1')
 *   return { alternates: { canonical: '...', languages: alternates } }
 *
 * Usage in sitemap:
 *   const sitemap = addHreflangToSitemapEntry({ url: 'https://islam.wiki/hadith/...' })
 */

const BASE_URL = 'https://islam.wiki'

export const SUPPORTED_LOCALES = ['en', 'ar', 'id'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_HREFLANG_MAP: Record<SupportedLocale, string> = {
  en: 'en',
  ar: 'ar',
  id: 'id',
}

/**
 * Returns hreflang alternates record for a given canonical path.
 * The canonical path must start with `/` (e.g. `/hadith/bukhari/1/1`).
 *
 * Returns an object suitable for Next.js `alternates.languages` metadata:
 * {
 *   en: 'https://islam.wiki/hadith/bukhari/1/1',
 *   ar: 'https://islam.wiki/ar/hadith/bukhari/1/1',
 *   id: 'https://islam.wiki/id/hadith/bukhari/1/1',
 *   'x-default': 'https://islam.wiki/hadith/bukhari/1/1',
 * }
 */
export function getHreflangAlternates(
  canonicalPath: string
): Record<string, string> {
  // Ensure path starts with /
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`

  const alternates: Record<string, string> = {
    // x-default always points to the English (default) URL
    'x-default': `${BASE_URL}${path}`,
    en: `${BASE_URL}${path}`,
    ar: `${BASE_URL}/ar${path}`,
    id: `${BASE_URL}/id${path}`,
  }

  return alternates
}

/**
 * Adds hreflang alternates to a sitemap entry object.
 * Accepts the canonical URL (full URL, e.g. 'https://islam.wiki/quran/1').
 *
 * Returns a sitemap entry object with `alternates.languages` populated.
 */
export function addHreflangToSitemapEntry(entry: {
  url: string
  lastModified?: Date
  changeFrequency?: string
  priority?: number
}): {
  url: string
  lastModified?: Date
  changeFrequency?: string
  priority?: number
  alternates?: { languages: Record<string, string> }
} {
  // Extract the path portion of the canonical URL
  let path: string
  try {
    path = new URL(entry.url).pathname
  } catch {
    // If URL parsing fails, use the url as-is as path
    path = entry.url.startsWith(BASE_URL)
      ? entry.url.slice(BASE_URL.length)
      : entry.url
  }

  return {
    ...entry,
    alternates: {
      languages: {
        ar: `${BASE_URL}/ar${path}`,
        id: `${BASE_URL}/id${path}`,
      },
    },
  }
}

/**
 * Route types that support hreflang alternates.
 * Used in sitemap.ts to filter which entries get alternates.
 */
export const HREFLANG_ROUTE_TYPES = [
  'quran',
  'hadith',
  'people',
  'history',
  'videos',
  'audio',
  'sects',
  'books',
] as const

export type HreflangRouteType = (typeof HREFLANG_ROUTE_TYPES)[number]

/**
 * Returns true if the given path should have hreflang alternates.
 * Based on the 8 supported route types from T29 acceptance criteria.
 */
export function pathSupportsHreflang(path: string): boolean {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return HREFLANG_ROUTE_TYPES.some(
    (type) => normalized === type || normalized.startsWith(`${type}/`)
  )
}
