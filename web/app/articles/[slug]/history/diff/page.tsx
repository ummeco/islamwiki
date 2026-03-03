import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/data/articles'
import { getRevisions } from '@/lib/data/revisions'
import { RevisionDiff } from '@/components/wiki/revision-diff'
import { WikiLayout } from '@/components/wiki/wiki-layout'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ old?: string; new?: string }>
}

export async function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: `Diff: ${article.title}`,
    description: `Compare revisions of "${article.title}" on Islam.wiki.`,
  }
}

export default async function ArticleDiffPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { old: oldId, new: newId } = await searchParams
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const revisions = getRevisions('article', slug)
  const oldRev = revisions.find((r) => r.id === oldId)
  const newRev = revisions.find((r) => r.id === newId)

  if (!oldRev || !newRev) {
    return (
      <WikiLayout
        breadcrumbs={[
          { label: 'Articles', href: '/articles' },
          { label: article.title, href: `/articles/${slug}` },
          { label: 'History', href: `/articles/${slug}/history` },
          { label: 'Diff' },
        ]}
        showToc={false}
      >
        <div className="max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold text-white">
            Revision not found
          </h1>
          <p className="text-sm text-iw-text-secondary">
            One or both of the specified revisions could not be found.{' '}
            <Link
              href={`/articles/${slug}/history`}
              className="text-iw-accent hover:text-white"
            >
              Return to history
            </Link>
          </p>
        </div>
      </WikiLayout>
    )
  }

  const oldDate = new Date(oldRev.created_at).toLocaleString()
  const newDate = new Date(newRev.created_at).toLocaleString()

  return (
    <WikiLayout
      breadcrumbs={[
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `/articles/${slug}` },
        { label: 'History', href: `/articles/${slug}/history` },
        { label: 'Diff' },
      ]}
      showToc={false}
    >
      <div className="max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold text-white">
          Comparing revisions: {article.title}
        </h1>
        <p className="mb-6 text-sm text-iw-text-secondary/70">
          Showing changes between revisions by {oldRev.editor_name} ({oldDate})
          and {newRev.editor_name} ({newDate})
        </p>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-iw-border bg-iw-surface/40 px-3 py-2">
            <div className="text-xs font-medium text-iw-text-secondary/70">Old revision</div>
            <div className="mt-0.5 text-sm text-iw-text">{oldRev.edit_summary}</div>
            <div className="mt-1 text-xs text-iw-text-secondary/50">
              {oldRev.editor_name} &middot; {oldDate}
            </div>
          </div>
          <div className="rounded-lg border border-iw-border bg-iw-surface/40 px-3 py-2">
            <div className="text-xs font-medium text-iw-text-secondary/70">New revision</div>
            <div className="mt-0.5 text-sm text-iw-text">{newRev.edit_summary}</div>
            <div className="mt-1 text-xs text-iw-text-secondary/50">
              {newRev.editor_name} &middot; {newDate}
            </div>
          </div>
        </div>

        <RevisionDiff
          oldContent={oldRev.content}
          newContent={newRev.content}
          oldLabel={`${oldRev.editor_name} (${oldDate})`}
          newLabel={`${newRev.editor_name} (${newDate})`}
        />

        <div className="mt-4">
          <Link
            href={`/articles/${slug}/history`}
            className="text-sm text-iw-accent hover:text-white"
          >
            Back to revision history
          </Link>
        </div>
      </div>
    </WikiLayout>
  )
}
