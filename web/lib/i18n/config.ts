export const LOCALES = ['en', 'ar', 'id'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
}

export const RTL_LOCALES: Locale[] = ['ar']

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale)
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}
