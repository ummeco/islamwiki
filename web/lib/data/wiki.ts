import pagesData from '@/data/wiki/pages.json'

interface WikiPageData {
  id: number
  slug: string
  title: string
  content?: string
  category?: string
  status: string
  created_at: string
  updated_at: string
}

const pages: WikiPageData[] = pagesData as WikiPageData[]

export function getWikiPages(): WikiPageData[] {
  return pages
}

export function getWikiPageBySlug(slug: string): WikiPageData | undefined {
  return pages.find((p) => p.slug === slug)
}
