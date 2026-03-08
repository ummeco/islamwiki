import type { Metadata } from 'next'
import Link from 'next/link'
import { getPendingRevisions, getRecentReviewedRevisions } from '@/lib/contributor/revisions'
import { getArticles } from '@/lib/data/articles'
import { getWikiPages } from '@/lib/data/wiki'
import { getPeople } from '@/lib/data/people'
import { getBooks } from '@/lib/data/books'
import { getSeerahEvents } from '@/lib/data/seerah'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Islam.wiki administration panel.',
}

export default async function AdminPage() {
  const [pending, recentEdits] = await Promise.all([
    getPendingRevisions(10).catch(() => []),
    getRecentReviewedRevisions(10).catch(() => []),
  ])
  const pendingEdits = pending
  const articles = getArticles()
  const wikiPages = getWikiPages()
  const people = getPeople()
  const books = getBooks()
  const seerahEvents = getSeerahEvents()

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          Content moderation, user management, and site administration.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/edits"
          className="rounded-xl border border-iw-border bg-iw-surface p-4 transition-colors hover:border-iw-border"
        >
          <p className="text-2xl font-bold text-white">
            {pendingEdits.length}
          </p>
          <p className="text-sm text-iw-text-secondary">Pending Edits</p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-iw-border bg-iw-surface p-4 transition-colors hover:border-iw-border"
        >
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-sm text-iw-text-secondary">Users</p>
        </Link>
        <Link
          href="/admin/ai-reviews"
          className="rounded-xl border border-iw-border bg-iw-surface p-4 transition-colors hover:border-iw-border"
        >
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-sm text-iw-text-secondary">AI Reviews</p>
        </Link>
        <Link
          href="/recent-changes"
          className="rounded-xl border border-iw-border bg-iw-surface p-4 transition-colors hover:border-iw-border"
        >
          <p className="text-2xl font-bold text-white">
            {recentEdits.length}
          </p>
          <p className="text-sm text-iw-text-secondary">Recent Edits</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Content Stats */}
        <div className="rounded-xl border border-iw-border bg-iw-surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Content Stats
          </h2>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: 'Quran Surahs', count: 114 },
              { label: 'Hadith Collections', count: 8 },
              { label: 'People', count: people.length },
              { label: 'Books', count: books.length },
              { label: 'Articles', count: articles.length },
              { label: 'Wiki Pages', count: wikiPages.length },
              { label: 'Seerah Events', count: seerahEvents.length },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <dt className="text-iw-text-secondary">{row.label}</dt>
                <dd className="font-medium text-iw-text">{row.count}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Moderation Links */}
        <div className="rounded-xl border border-iw-border bg-iw-surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Moderation
          </h2>
          <nav className="space-y-2">
            {[
              { href: '/admin/edits', label: 'Review Pending Edits', count: pendingEdits.length },
              { href: '/admin/users', label: 'Manage Users', count: null },
              { href: '/admin/ai-reviews', label: 'AI Review Queue', count: 0 },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-lg border border-iw-border px-3 py-2 text-sm text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:bg-iw-surface hover:text-white"
              >
                <span>{link.label}</span>
                {link.count !== null && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${link.count > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-iw-surface text-iw-text-muted'}`}>
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Recent Activity */}
      {recentEdits.length > 0 && (
        <div className="mt-6 rounded-xl border border-iw-border bg-iw-surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentEdits.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : rev.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {rev.status}
                </span>
                <span className="text-iw-text">{rev.content_type}/{rev.content_slug}</span>
                <span className="text-iw-text-secondary/50">&middot;</span>
                <span className="text-xs text-iw-text-secondary/70">
                  {rev.editor_username}
                </span>
                <span className="text-xs text-iw-text-secondary/50">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
