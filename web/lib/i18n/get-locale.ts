import { headers } from 'next/headers'
import { DEFAULT_LOCALE, isValidLocale, type Locale } from './config'

/**
 * Get the current locale from the x-locale header set by middleware.
 * For use in Server Components and Route Handlers.
 */
export async function getLocale(): Promise<Locale> {
  const headersList = await headers()
  const locale = headersList.get('x-locale') || DEFAULT_LOCALE
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE
}
