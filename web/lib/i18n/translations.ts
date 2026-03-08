import type { Locale } from './config'
import en from './messages/en.json'
import ar from './messages/ar.json'
import id from './messages/id.json'

type Messages = typeof en

const messages: Record<Locale, Messages> = { en, ar, id }

/**
 * Get a nested translation value by dot-path key.
 * Example: t('en', 'nav.quran') → 'Quran'
 */
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages[locale]

  for (const part of parts) {
    if (value == null) break
    value = value[part]
  }

  // Fallback to English if missing
  if (typeof value !== 'string') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = messages.en
    for (const part of parts) {
      if (fallback == null) break
      fallback = fallback[part]
    }
    value = typeof fallback === 'string' ? fallback : key
  }

  // Variable interpolation: {count}, {section}, etc.
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }

  return value
}

/**
 * Get all messages for a locale (for client components that need the full object).
 */
export function getMessages(locale: Locale): Messages {
  return messages[locale]
}
