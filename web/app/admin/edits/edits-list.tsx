'use client'

import { useActionState, useState } from 'react'
import { adminApproveEdit, adminRejectEdit } from '@/app/actions/admin'
import type { Revision } from '@/lib/data/revisions'

interface Props {
  edits: Revision[]
}

export function AdminEditsList({ edits }: Props) {
  const [rejecting, setRejecting] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {edits.map((rev) => (
        <div
          key={rev.id}
          className="rounded-xl border border-iw-border bg-iw-surface/60 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                  pending
                </span>
                <span className="font-medium text-iw-text">
                  {rev.content_title}
                </span>
                <span className="text-xs text-iw-text-secondary/50 capitalize">
                  {rev.content_type}
                </span>
              </div>
              <div className="mt-1 text-sm text-iw-text-secondary">
                {rev.edit_summary}
              </div>
              <div className="mt-1 text-xs text-iw-text-muted">
                By {rev.editor_name} &middot;{' '}
                {new Date(rev.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form action={adminApproveEdit}>
                <input type="hidden" name="content_type" value={rev.content_type} />
                <input type="hidden" name="content_slug" value={rev.content_slug} />
                <input type="hidden" name="revision_id" value={rev.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <button
                type="button"
                onClick={() =>
                  setRejecting(rejecting === rev.id ? null : rev.id)
                }
                className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Expandable content preview */}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-iw-accent hover:text-white">
              Preview content ({rev.content.length} chars)
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-iw-bg/60 p-3 text-xs text-iw-text-secondary">
              {rev.content.slice(0, 2000)}
              {rev.content.length > 2000 && '...'}
            </pre>
          </details>

          {/* Rejection reason form */}
          {rejecting === rev.id && (
            <form action={adminRejectEdit} className="mt-3 flex gap-2">
              <input type="hidden" name="content_type" value={rev.content_type} />
              <input type="hidden" name="content_slug" value={rev.content_slug} />
              <input type="hidden" name="revision_id" value={rev.id} />
              <input
                name="reason"
                type="text"
                placeholder="Reason for rejection..."
                className="flex-1 rounded-lg border border-iw-border bg-iw-surface px-3 py-1.5 text-xs text-iw-text placeholder:text-iw-text-muted focus:border-red-500/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                Confirm Reject
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  )
}
