'use client'

import type { Locale } from '@/lib/i18n/config'
import { LOCALE_NAMES, DEFAULT_LOCALE } from '@/lib/i18n/config'

interface TranslationBannerProps {
  locale: Locale
  contentLocale?: Locale
}

/**
 * Shows a banner when content is displayed in English because the
 * requested locale's translation is not yet available.
 */
export function TranslationBanner({ locale, contentLocale }: TranslationBannerProps) {
  if (locale === DEFAULT_LOCALE) return null
  if (contentLocale && contentLocale === locale) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 text-sm text-amber-800 dark:text-amber-200 mb-4">
      This content is not yet available in {LOCALE_NAMES[locale]}. Showing the English version.
    </div>
  )
}
