import type { Metadata } from 'next'
import Link from 'next/link'
import { getRecentRevisions } from '@/lib/data/revisions'
import { WikiLayout } from '@/components/wiki/wiki-layout'

export const metadata: Metadata = {
  title: 'Recent Changes',
  description: 'View the most recent edits and contributions on Islam.wiki.',
}

function contentPath(type: string, slug: string): string {
  if (type === 'article') return `/articles/${slug}`
  return `/${type}/${slug}`
}

export default function RecentChangesPage() {
  const revisions = getRecentRevisions(100)

  return (
    <WikiLayout
      breadcrumbs={[{ label: 'Recent Changes' }]}
      showToc={false}
    >
      <h1 className="mb-6 text-2xl font-bold text-white">
        Recent Changes
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
            No recent changes yet. Be the first to contribute!
          </p>
          <p className="mt-2 text-xs text-iw-text-muted">
            Recent edits across all content types will appear here once the
            editing system is active.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-iw-surface/40"
            >
              <span
                className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                  rev.status === 'approved'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : rev.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'
                }`}
              >
                {rev.status}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={contentPath(rev.content_type, rev.content_slug)}
                    className="font-medium text-iw-accent hover:text-white"
                  >
                    {rev.content_title}
                  </Link>
                  <span className="text-iw-text-secondary/50">&middot;</span>
                  <span className="text-iw-text-secondary/70">{rev.edit_summary}</span>
                </div>
                <div className="mt-0.5 text-xs text-iw-text-secondary/50">
                  <span>{rev.editor_name}</span>
                  <span className="mx-1.5">&middot;</span>
                  <span>{new Date(rev.created_at).toLocaleString()}</span>
                  <span className="mx-1.5">&middot;</span>
                  <span className="capitalize">{rev.content_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WikiLayout>
  )
}
