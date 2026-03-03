import articlesData from '@/data/articles/articles.json'

interface ArticleData {
  id: number
  slug: string
  title: string
  excerpt?: string
  content?: string
  category: string
  tags: string[]
  language: string
  status: string
  author_id?: number | null
  author_name?: string | null
  created_at: string
  updated_at: string
}

const articles: ArticleData[] = articlesData as ArticleData[]

export function getArticles(): ArticleData[] {
  return articles
}

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return articles.find((a) => a.slug === slug)
}
