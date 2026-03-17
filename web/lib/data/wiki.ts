import pagesData from '@/data/wiki/pages.json'

// Some pages use legacy `title` field; newer pages use `title_en` / `title_ar` / `title_id`
type RawPageData = {
  id: number
  slug: string
  title?: string
  title_en?: string
  title_ar?: string
  title_id?: string
  content?: string
  content_en?: string
  content_ar?: string
  content_id?: string
  category?: string
  status?: string
  created_at?: string
  updated_at?: string
  is_editorial?: boolean
  qa_passed?: boolean
}

export interface WikiPageData {
  id: number
  slug: string
  title: string
  title_en?: string
  title_ar?: string
  title_id?: string
  content?: string
  content_en?: string
  content_ar?: string
  content_id?: string
  category?: string
  status?: string
  updated_at?: string
}

function normalizeWikiPage(p: RawPageData): WikiPageData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title ?? p.title_en ?? p.slug,
    title_en: p.title_en ?? p.title,
    title_ar: p.title_ar,
    title_id: p.title_id,
    content: p.content ?? p.content_en,
    content_en: p.content_en,
    content_ar: p.content_ar,
    content_id: p.content_id,
    category: p.category,
    status: p.status,
    updated_at: p.updated_at,
  }
}

const pages: WikiPageData[] = (pagesData as RawPageData[]).map(normalizeWikiPage)

export function getWikiPages(): WikiPageData[] {
  return pages
}

export function getWikiPageBySlug(slug: string): WikiPageData | undefined {
  return pages.find((p) => p.slug === slug)
}
