import type { Metadata } from 'next'
import { getArticles } from '@/lib/data/articles'
import { ArticlesGrid } from '@/components/listings/articles-grid'

export const metadata: Metadata = {
  title: 'Articles — Islamic Encyclopedia',
  description:
    'Encyclopedic articles on all aspects of Islam: worship, theology, history, jurisprudence, and more. Scholar-verified and community-driven.',
}

export default function ArticlesIndexPage() {
  const articles = getArticles()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Articles</h1>
        <p className="mt-2 text-iw-text-secondary">
          Encyclopedic articles on all aspects of Islam. Scholar-verified and community-driven.
        </p>
      </div>

      <ArticlesGrid articles={articles} />
    </div>
  )
}
