export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Islam.wiki',
    alternateName: 'The Islamic Reference',
    url: 'https://islam.wiki',
    description:
      'The most comprehensive Islamic knowledge base. Quran with tafsir, authentic Hadith with isnad analysis, scholar biographies, classical books, and encyclopedic articles.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://islam.wiki/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ummat Dev',
      url: 'https://ummat.dev',
    },
    inLanguage: ['en', 'ar', 'id'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://islam.wiki${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
}: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `https://islam.wiki${url}`,
    datePublished,
    dateModified,
    publisher: {
      '@type': 'Organization',
      name: 'Islam.wiki',
      url: 'https://islam.wiki',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Islam.wiki',
      url: 'https://islam.wiki',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
