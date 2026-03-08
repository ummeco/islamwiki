import type { Metadata } from 'next'
import { getPendingRevisions, getRecentReviewedRevisions } from '@/lib/contributor/revisions'
import { PendingEditsList } from '@/components/contributor/PendingEditsList'

export const metadata: Metadata = {
  title: 'Pending Edits',
  description: 'Review and moderate pending wiki edits.',
}

export default async function AdminEditsPage() {
  const [pending, recent] = await Promise.all([
    getPendingRevisions(),
    getRecentReviewedRevisions(50),
  ])

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pending Edits</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          Review, approve, or reject pending contributions.
        </p>
      </div>

      <PendingEditsList revisions={pending} />

      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Recently Reviewed
          </h2>
          <div className="space-y-2">
            {recent.map((rev) => (
              <div
                key={rev.id}
                className="flex items-start gap-3 rounded-lg border border-iw-border bg-iw-surface/60 px-4 py-3"
              >
                <span
                  className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : rev.status === 'reverted'
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {rev.status}
                </span>
                <div className="flex-1">
                  <div className="text-sm text-iw-text">
                    {rev.content_type} / {rev.content_slug}
                  </div>
                  <div className="mt-0.5 text-xs text-iw-text-secondary/70">
                    {rev.change_summary && <>{rev.change_summary} &middot; </>}
                    {rev.editor_username} &middot;{' '}
                    {new Date(rev.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
