import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/data/articles'
import { getSessionUser } from '@/lib/auth'
import { WikiLayout } from '@/components/wiki/wiki-layout'
import { ContentTabs } from '@/components/wiki/content-tabs'
import { MarkdownEditor } from '@/components/wiki/markdown-editor'

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
    title: `Edit: ${article.title}`,
    description: `Edit the article "${article.title}" on Islam.wiki.`,
  }
}

export default async function EditArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const user = await getSessionUser()
  if (!user) {
    redirect(`/signin?redirect=/articles/${slug}/edit`)
  }

  return (
    <WikiLayout
      breadcrumbs={[
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `/articles/${slug}` },
        { label: 'Edit' },
      ]}
      showToc={false}
    >
      <ContentTabs
        basePath={`/articles/${slug}`}
        activeTab="edit"
        canEdit
      />

      <div className="max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Editing: {article.title}
        </h1>

        <div className="mb-4 rounded-lg border border-iw-border/50 bg-iw-bg/40 px-4 py-3 text-xs text-iw-text-secondary">
          <p>
            You are editing this article. Use{' '}
            <Link href="https://www.markdownguide.org/basic-syntax/" className="text-iw-accent hover:text-white" target="_blank">
              Markdown syntax
            </Link>{' '}
            for formatting. Please provide an edit summary describing your changes.
          </p>
        </div>

        <MarkdownEditor
          contentType="article"
          contentSlug={slug}
          contentTitle={article.title}
          currentContent={article.content || ''}
        />
      </div>
    </WikiLayout>
  )
}
