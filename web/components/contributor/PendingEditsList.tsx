'use client'

import { useState } from 'react'
import { DiffViewer } from './DiffViewer'
import type { Revision } from '@/lib/contributor/revisions'

interface PendingEditsListProps {
  revisions: Revision[]
}

export function PendingEditsList({ revisions }: PendingEditsListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())

  if (revisions.length === 0) {
    return (
      <div className="rounded-xl border border-iw-border bg-iw-surface p-10 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-iw-text-secondary">No pending edits. All clear.</p>
      </div>
    )
  }

  async function handleAction(revisionId: string, action: 'approved' | 'denied') {
    setLoading(revisionId)
    try {
      const res = await fetch('/api/revisions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, action }),
      })
      if (res.ok) {
        setDone((prev) => new Set([...prev, revisionId]))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {revisions.map((rev) => {
        if (done.has(rev.id)) return null
        const isExpanded = expanded === rev.id
        const isLoading = loading === rev.id

        return (
          <div key={rev.id} className="rounded-xl border border-iw-border bg-iw-surface overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                    pending
                  </span>
                  <span className="text-xs text-iw-text-muted capitalize">{rev.content_type}</span>
                  <span className="font-medium text-iw-text truncate">{rev.content_slug}</span>
                  {rev.is_minor && (
                    <span className="rounded bg-iw-surface px-1.5 py-0.5 text-xs text-iw-text-muted border border-iw-border">minor</span>
                  )}
                  {rev.diff_size_pct !== null && (
                    <span className="text-xs text-iw-text-muted">{rev.diff_size_pct}% changed</span>
                  )}
                </div>
                {rev.change_summary && (
                  <p className="mt-1 text-sm text-iw-text-secondary">{rev.change_summary}</p>
                )}
                <p className="mt-1 text-xs text-iw-text-muted">
                  By {rev.editor_username} · {new Date(rev.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : rev.id)}
                  className="rounded-lg border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary hover:text-white"
                >
                  {isExpanded ? 'Hide diff' : 'View diff'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(rev.id, 'denied')}
                  disabled={isLoading}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(rev.id, 'approved')}
                  disabled={isLoading}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  {isLoading ? '…' : 'Approve'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-iw-border p-4">
                <DiffViewer
                  oldContent={rev.previous_content ?? ''}
                  newContent={rev.new_content}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
