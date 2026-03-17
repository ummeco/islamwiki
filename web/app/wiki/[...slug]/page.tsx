import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getWikiPageBySlug, getWikiPages } from '@/lib/data/wiki'
import { getSessionUser } from '@/lib/auth'
import { sanitizeHtml } from '@/lib/sanitize'
import { getRevisionsByContent } from '@/lib/contributor/revisions'
import { getLocale } from '@/lib/i18n/get-locale'
import { WikiLayout } from '@/components/wiki/wiki-layout'
import { ContentTabs } from '@/components/wiki/content-tabs'
import { EditButton } from '@/components/wiki/edit-button'
import { MarkdownEditor } from '@/components/wiki/markdown-editor'
import { RevisionDiff } from '@/components/wiki/revision-diff'
import { ogImageUrl } from '@/lib/og'
import { getHreflangAlternates } from '@/components/seo/hreflang'

interface Props {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ old?: string; new?: string }>
}

// Detect the mode from the slug
function parseSlug(slug: string[]): {
  pageSlug: string
  mode: 'read' | 'edit' | 'history' | 'diff'
} {
  const last = slug[slug.length - 1]
  const secondLast = slug.length >= 2 ? slug[slug.length - 2] : null

  if (last === 'diff' && secondLast === 'history') {
    return { pageSlug: slug.slice(0, -2).join('/'), mode: 'diff' }
  }
  if (last === 'history') {
    return { pageSlug: slug.slice(0, -1).join('/'), mode: 'history' }
  }
  if (last === 'edit') {
    return { pageSlug: slug.slice(0, -1).join('/'), mode: 'edit' }
  }
  return { pageSlug: slug.join('/'), mode: 'read' }
}

export async function generateStaticParams() {
  const pages = getWikiPages()
  const params: { slug: string[] }[] = []

  for (const p of pages) {
    const parts = p.slug.split('/')
    params.push({ slug: parts })
    params.push({ slug: [...parts, 'edit'] })
    params.push({ slug: [...parts, 'history'] })
    params.push({ slug: [...parts, 'history', 'diff'] })
  }

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { pageSlug, mode } = parseSlug(slug)
  const page = getWikiPageBySlug(pageSlug)
  if (!page) return {}

  const prefix =
    mode === 'edit' ? 'Edit: ' : mode === 'history' ? 'History: ' : mode === 'diff' ? 'Diff: ' : ''

  return {
    title: `${prefix}${page.title}`,
    description: `${page.title} — Islam.wiki encyclopedia article.`,
    alternates: mode === 'read' ? { languages: getHreflangAlternates(`/wiki/${pageSlug}`) } : undefined,
    openGraph: mode === 'read' ? {
      images: [{ url: ogImageUrl({ title: page.title, section: 'Wiki' }), width: 1200, height: 630 }],
    } : undefined,
  }
}

export default async function WikiPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { pageSlug, mode } = parseSlug(slug)
  const page = getWikiPageBySlug(pageSlug)
  const locale = await getLocale()
  if (!page) notFound()

  const slugParts = pageSlug.split('/')

  const breadcrumbs = slugParts.map((s, i) => ({
    label: s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    ...(i < slugParts.length - 1
      ? { href: `/wiki/${slugParts.slice(0, i + 1).join('/')}` }
      : mode !== 'read'
        ? { href: `/wiki/${pageSlug}` }
        : {}),
  }))

  if (mode === 'edit') {
    breadcrumbs.push({ label: 'Edit' })
  } else if (mode === 'history') {
    breadcrumbs.push({ label: 'History' })
  } else if (mode === 'diff') {
    breadcrumbs.push({ label: 'History', href: `/wiki/${pageSlug}/history` } as { label: string; href?: string })
    breadcrumbs.push({ label: 'Diff' })
  }

  // ── Edit Mode ──
  if (mode === 'edit') {
    const user = await getSessionUser()
    if (!user) {
      redirect(`/account?redirect=/wiki/${pageSlug}/edit`)
    }

    return (
      <WikiLayout breadcrumbs={breadcrumbs} showToc={false}>
        <ContentTabs basePath={`/wiki/${pageSlug}`} activeTab="edit" canEdit />
        <div className="max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold text-white">
            Editing: {page.title}
          </h1>
          <div className="mb-4 rounded-lg border border-iw-border/50 bg-iw-bg/40 px-4 py-3 text-xs text-iw-text-secondary">
            <p>
              Use{' '}
              <Link
                href="https://www.markdownguide.org/basic-syntax/"
                className="text-iw-accent hover:text-white"
                target="_blank"
              rel="noopener noreferrer"
              >
                Markdown syntax
              </Link>{' '}
              for formatting. Please provide an edit summary describing your changes.
            </p>
          </div>
          <MarkdownEditor
            contentType="wiki"
            contentSlug={pageSlug}
            contentTitle={page.title}
            currentContent={page.content || ''}
          />
        </div>
      </WikiLayout>
    )
  }

  // ── History Mode ──
  if (mode === 'history') {
    const revisions = await getRevisionsByContent('wiki', pageSlug).catch(() => [])

    return (
      <WikiLayout breadcrumbs={breadcrumbs} showToc={false}>
        <ContentTabs basePath={`/wiki/${pageSlug}`} activeTab="history" canEdit />
        <div className="max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold text-white">
            Revision history: {page.title}
          </h1>
          {revisions.length === 0 ? (
            <div className="rounded-xl border border-iw-border bg-iw-surface p-8 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-iw-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-iw-text-secondary">No revision history yet.</p>
              <p className="mt-2 text-xs text-iw-text-muted">
                Revisions will appear here once edits are made to this page.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev, i) => (
                <div key={rev.id} className="flex items-start gap-4 rounded-lg border border-iw-border bg-iw-surface/60 px-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${rev.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : rev.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                        {rev.status}
                      </span>
                      <span className="text-sm text-iw-text">{rev.change_summary}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-iw-text-secondary/70">
                      <span>{rev.editor_username}</span>
                      <span>{new Date(rev.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {i < revisions.length - 1 && (
                    <Link href={`/wiki/${pageSlug}/history/diff?old=${revisions[i + 1].id}&new=${rev.id}`} className="rounded border border-iw-border px-2.5 py-1 text-xs text-iw-text-secondary hover:border-iw-text-muted hover:text-iw-text">
                      Diff
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </WikiLayout>
    )
  }

  // ── Diff Mode ──
  if (mode === 'diff') {
    const { old: oldId, new: newId } = await searchParams
    const revisions = await getRevisionsByContent('wiki', pageSlug).catch(() => [])
    const oldRev = revisions.find((r) => r.id === oldId)
    const newRev = revisions.find((r) => r.id === newId)

    if (!oldRev || !newRev) {
      return (
        <WikiLayout breadcrumbs={breadcrumbs} showToc={false}>
          <div className="max-w-3xl">
            <h1 className="mb-6 text-2xl font-bold text-white">Revision not found</h1>
            <p className="text-sm text-iw-text-secondary">
              One or both revisions could not be found.{' '}
              <Link href={`/wiki/${pageSlug}/history`} className="text-iw-accent hover:text-white">Return to history</Link>
            </p>
          </div>
        </WikiLayout>
      )
    }

    const oldDate = new Date(oldRev.created_at).toLocaleString()
    const newDate = new Date(newRev.created_at).toLocaleString()

    return (
      <WikiLayout breadcrumbs={breadcrumbs} showToc={false}>
        <div className="max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold text-white">Comparing revisions: {page.title}</h1>
          <p className="mb-6 text-sm text-iw-text-secondary/70">
            Changes between {oldRev.editor_username} ({oldDate}) and {newRev.editor_username} ({newDate})
          </p>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-iw-border bg-iw-surface/40 px-3 py-2">
              <div className="text-xs font-medium text-iw-text-secondary/70">Old revision</div>
              <div className="mt-0.5 text-sm text-iw-text">{oldRev.change_summary}</div>
              <div className="mt-1 text-xs text-iw-text-secondary/50">{oldRev.editor_username} &middot; {oldDate}</div>
            </div>
            <div className="rounded-lg border border-iw-border bg-iw-surface/40 px-3 py-2">
              <div className="text-xs font-medium text-iw-text-secondary/70">New revision</div>
              <div className="mt-0.5 text-sm text-iw-text">{newRev.change_summary}</div>
              <div className="mt-1 text-xs text-iw-text-secondary/50">{newRev.editor_username} &middot; {newDate}</div>
            </div>
          </div>
          <RevisionDiff
            oldContent={oldRev.previous_content ?? ''}
            newContent={newRev.new_content}
            oldLabel={`${oldRev.editor_username} (${oldDate})`}
            newLabel={`${newRev.editor_username} (${newDate})`}
          />
          <div className="mt-4">
            <Link href={`/wiki/${pageSlug}/history`} className="text-sm text-iw-accent hover:text-white">
              Back to revision history
            </Link>
          </div>
        </div>
      </WikiLayout>
    )
  }

  // ── Read Mode (default) ──
  return (
    <WikiLayout breadcrumbs={breadcrumbs}>
      <ContentTabs basePath={`/wiki/${pageSlug}`} activeTab="read" canEdit />

      <article className="max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">
            {locale === 'ar' && page.title_ar ? page.title_ar : locale === 'id' && page.title_id ? page.title_id : page.title}
          </h1>
          <EditButton editHref={`/wiki/${pageSlug}/edit`} />
        </div>

        <div className="prose prose-invert max-w-none text-iw-text-secondary">
          {(() => {
            const localizedContent =
              locale === 'ar' ? page.content_ar || page.content :
              locale === 'id' ? page.content_id || page.content :
              page.content
            return localizedContent ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(localizedContent) }} />
            ) : (
              <p className="italic text-iw-text-muted">
                This page is being written. Want to contribute?{' '}
                <Link href="/signup" className="text-iw-accent hover:text-white">
                  Create an account
                </Link>{' '}
                and help build the wiki.
              </p>
            )
          })()}
        </div>

        <div className="mt-8 border-t border-iw-border pt-4 text-xs text-iw-text-muted">
          {page.updated_at && <>Last updated: {new Date(page.updated_at).toLocaleDateString()}</>}
        </div>
      </article>
    </WikiLayout>
  )
}
