import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

interface HreflangTagsProps {
  path: string
}

/**
 * Generates hreflang link tags for all supported locales.
 * Use in page head via Next.js metadata or directly in layout.
 */
export function HreflangTags({ path }: HreflangTagsProps) {
  const base = 'https://islam.wiki'
  const cleanPath = path === '/' ? '' : path

  return (
    <>
      {LOCALES.map((locale) => {
        const href = locale === DEFAULT_LOCALE
          ? `${base}${cleanPath}`
          : `${base}/${locale}${cleanPath}`
        return (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={href}
          />
        )
      })}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${base}${cleanPath}`}
      />
    </>
  )
}

/**
 * Generate hreflang metadata for use with Next.js generateMetadata().
 */
export function getHreflangAlternates(path: string): Record<string, string> {
  const base = 'https://islam.wiki'
  const cleanPath = path === '/' ? '' : path
  const alternates: Record<string, string> = {}

  for (const locale of LOCALES) {
    const href = locale === DEFAULT_LOCALE
      ? `${base}${cleanPath}`
      : `${base}/${locale}${cleanPath}`
    alternates[locale as string] = href
  }

  return alternates
}
