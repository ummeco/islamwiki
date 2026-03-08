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
function traverse(obj: unknown, parts: string[]): unknown {
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') break
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.')
  let value = traverse(messages[locale], parts)

  // Fallback to English if missing
  if (typeof value !== 'string') {
    const fallback = traverse(messages.en, parts)
    value = typeof fallback === 'string' ? fallback : key
  }

  let result = value as string

  // Variable interpolation: {count}, {section}, etc.
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }

  return result
}

/**
 * Get all messages for a locale (for client components that need the full object).
 */
export function getMessages(locale: Locale): Messages {
  return messages[locale]
}
