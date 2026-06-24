import { DEFAULT_LOCALE, isValidLocale, type Locale } from './config'

/**
 * Resolve a locale from a raw value (framework-agnostic — no next/headers).
 *
 * The Astro middleware (src/middleware.ts) sets `context.locals.locale` and the
 * `x-locale` response header. Prefer reading `Astro.locals.locale` directly at
 * call sites. This helper exists for code paths that only have a raw string
 * (e.g. a header value or cookie value) and need it validated/normalized.
 *
 * @param value - candidate locale string (e.g. Astro.locals.locale, an
 *   `x-locale` header, or a cookie value). `null`/`undefined` falls back to default.
 * @returns a valid Locale, or DEFAULT_LOCALE when the input is missing/invalid.
 */
export function resolveLocale(value: string | null | undefined): Locale {
  const candidate = value || DEFAULT_LOCALE
  return isValidLocale(candidate) ? candidate : DEFAULT_LOCALE
}

/**
 * @deprecated Back-compat alias for `resolveLocale`. Prefer reading
 * `Astro.locals.locale` (set by middleware) and passing it through
 * `resolveLocale` when validation is needed.
 */
export const getLocale = resolveLocale
