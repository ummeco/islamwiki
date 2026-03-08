'use client'

import { useState } from 'react'
import { DiffViewer } from './DiffViewer'
import { TrustBadge } from './TrustBadge'
import type { Revision } from '@/lib/contributor/revisions'
import type { TrustLevel } from '@/lib/contributor/trust'

const STATUS_STYLES = {
  approved: 'bg-emerald-500/15 text-emerald-400',
  denied: 'bg-red-500/15 text-red-400',
  pending: 'bg-amber-500/15 text-amber-400',
  reverted: 'bg-gray-500/15 text-gray-400',
}

interface RevisionHistoryProps {
  revisions: Revision[]
  currentUserLevel?: TrustLevel
}

export function RevisionHistory({ revisions, currentUserLevel = 0 }: RevisionHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reverting, setReverting] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  async function handleRevert(rev: Revision) {
    if (!reason.trim()) return
    setReverting(rev.id)
    try {
      await fetch('/api/revisions/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId: rev.id, reason }),
      })
      setReason('')
    } finally {
      setReverting(null)
    }
  }

  if (revisions.length === 0) {
    return (
      <div className="rounded-lg border border-iw-border bg-iw-surface p-6 text-center text-sm text-iw-text-muted">
        No revision history yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {revisions.map((rev, idx) => {
        const isExpanded = expanded === rev.id
        const statusStyle = STATUS_STYLES[rev.status] ?? STATUS_STYLES.pending
        const isFirst = idx === 0

        return (
          <div key={rev.id} className="rounded-lg border border-iw-border bg-iw-surface overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusStyle}`}>
                {rev.status}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-iw-text-secondary">
                  {rev.change_summary || 'No summary'}
                </span>
                <span className="ml-2 text-xs text-iw-text-muted">
                  — {rev.editor_username}, {new Date(rev.created_at).toLocaleDateString()}
                </span>
                {rev.diff_size_pct !== null && (
                  <span className="ml-2 text-xs text-iw-text-muted">{rev.diff_size_pct}% change</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {rev.auto_approved && (
                  <span className="text-xs text-iw-text-muted italic">auto</span>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : rev.id)}
                  className="text-xs text-iw-text-muted hover:text-white"
                >
                  {isExpanded ? 'Hide' : 'Diff'}
                </button>
                {currentUserLevel >= 2 && !isFirst && (
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : `revert-${rev.id}`)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Revert
                  </button>
                )}
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

            {expanded === `revert-${rev.id}` && (
              <div className="border-t border-iw-border p-4 flex items-center gap-3">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for revert (required)"
                  className="flex-1 rounded-lg border border-iw-border bg-iw-bg px-3 py-1.5 text-sm text-iw-text focus:border-iw-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRevert(rev)}
                  disabled={!reason.trim() || reverting === rev.id}
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-40"
                >
                  {reverting === rev.id ? 'Reverting…' : 'Confirm revert'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
