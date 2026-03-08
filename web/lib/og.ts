const BASE = 'https://islam.wiki'

/**
 * Build OG image URL for dynamic pages.
 */
export function ogImageUrl(params: {
  title: string
  subtitle?: string
  section?: string
  arabic?: string
}): string {
  const url = new URL('/api/og', BASE)
  url.searchParams.set('title', params.title)
  if (params.subtitle) url.searchParams.set('subtitle', params.subtitle)
  if (params.section) url.searchParams.set('section', params.section)
  if (params.arabic) url.searchParams.set('arabic', params.arabic)
  return url.toString()
}
