import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/data/articles'
import { sanitizeHtml } from '@/lib/sanitize'
import { ogImageUrl } from '@/lib/og'
import { WikiLayout } from '@/components/wiki/wiki-layout'
import { ContentTabs } from '@/components/wiki/content-tabs'
import { EditButton } from '@/components/wiki/edit-button'
import { CrossReferences } from '@/components/articles/cross-references'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description:
      article.excerpt ||
      `${article.title} — Islamic encyclopedia article on Islam.wiki.`,
    openGraph: {
      images: [{ url: ogImageUrl({ title: article.title, section: 'Articles', subtitle: article.category || '' }) }],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const relatedArticles = getArticles()
    .filter((a) => a.category === article.category && a.slug !== slug)
    .slice(0, 4)

  return (
    <WikiLayout
      breadcrumbs={[
        { label: 'Articles', href: '/articles' },
        { label: article.title },
      ]}
    >
      <ContentTabs
        basePath={`/articles/${slug}`}
        activeTab="read"
        canEdit
      />

      <article className="max-w-3xl">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="badge bg-iw-accent/10 text-iw-accent mb-3">
                {article.category}
              </span>
              <h1 className="text-3xl font-bold text-white">
                {article.title}
              </h1>
            </div>
            <EditButton editHref={`/articles/${slug}/edit`} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-iw-text-secondary">
            {article.author_name && <span>By {article.author_name}</span>}
            <span>
              {new Date(article.updated_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none text-iw-text-secondary">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
          ) : (
            <p className="italic text-iw-text-muted">
              This article is being written.
            </p>
          )}
        </div>

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-iw-border px-3 py-1 text-xs text-iw-text-secondary hover:border-iw-text-muted"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        {/* Cross-references */}
        <CrossReferences tags={article.tags} category={article.category} />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-10 border-t border-iw-border pt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Related Articles
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.slug}
                  href={`/articles/${ra.slug}`}
                  className="rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
                >
                  <p className="text-sm font-medium text-iw-text line-clamp-2">
                    {ra.title}
                  </p>
                  {ra.excerpt && (
                    <p className="mt-1 text-xs text-iw-text-muted line-clamp-2">
                      {ra.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </WikiLayout>
  )
}
