import type { Metadata } from 'next'
import { getPendingRevisions, getRecentRevisions } from '@/lib/data/revisions'
import { AdminEditsList } from './edits-list'

export const metadata: Metadata = {
  title: 'Pending Edits',
  description: 'Review and moderate pending wiki edits.',
}

export default function AdminEditsPage() {
  const pending = getPendingRevisions()
  const recent = getRecentRevisions(50).filter((r) => r.status !== 'pending')

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pending Edits</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          Review, approve, or reject pending contributions.
        </p>
      </div>

      {pending.length === 0 ? (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-iw-text-secondary">
            No pending edits. All clear!
          </p>
        </div>
      ) : (
        <AdminEditsList edits={pending} />
      )}

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
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {rev.status}
                </span>
                <div className="flex-1">
                  <div className="text-sm text-iw-text">
                    {rev.content_title}
                  </div>
                  <div className="mt-0.5 text-xs text-iw-text-secondary/70">
                    {rev.edit_summary} &middot; {rev.editor_name} &middot;{' '}
                    {new Date(rev.created_at).toLocaleString()}
                  </div>
                  {rev.rejection_reason && (
                    <div className="mt-1 text-xs text-red-400/70">
                      Reason: {rev.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
