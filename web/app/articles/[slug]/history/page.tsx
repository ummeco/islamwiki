import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/data/articles'
import { getRevisions } from '@/lib/data/revisions'
import { WikiLayout } from '@/components/wiki/wiki-layout'
import { ContentTabs } from '@/components/wiki/content-tabs'

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
    title: `History: ${article.title}`,
    description: `Revision history for "${article.title}" on Islam.wiki.`,
  }
}

export default async function ArticleHistoryPage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const revisions = getRevisions('article', slug)

  return (
    <WikiLayout
      breadcrumbs={[
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `/articles/${slug}` },
        { label: 'History' },
      ]}
      showToc={false}
    >
      <ContentTabs
        basePath={`/articles/${slug}`}
        activeTab="history"
        canEdit
      />

      <div className="max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Revision history: {article.title}
        </h1>

        {revisions.length === 0 ? (
          <div className="rounded-xl border border-iw-border bg-iw-surface p-8 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-iw-text-secondary/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-iw-text-secondary">
              No revision history yet.
            </p>
            <p className="mt-2 text-xs text-iw-text-muted">
              Revisions will appear here once edits are made to this article.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {revisions.map((rev, i) => (
              <div
                key={rev.id}
                className="flex items-start gap-4 rounded-lg border border-iw-border bg-iw-surface/60 px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        rev.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : rev.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {rev.status}
                    </span>
                    <span className="text-sm text-iw-text">
                      {rev.edit_summary}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-iw-text-secondary/70">
                    <span>{rev.editor_name}</span>
                    <span>{new Date(rev.created_at).toLocaleString()}</span>
                    {rev.reviewed_by && (
                      <span>Reviewed by: {rev.reviewed_by}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {i < revisions.length - 1 && (
                    <Link
                      href={`/articles/${slug}/history/diff?old=${revisions[i + 1].id}&new=${rev.id}`}
                      className="rounded border border-iw-border px-2.5 py-1 text-xs text-iw-text-secondary hover:border-iw-text-muted hover:text-iw-text"
                    >
                      Diff
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WikiLayout>
  )
}
