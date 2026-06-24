/**
 * EditModal.tsx — admin pending-edits review island for /admin/edits
 *
 * PURPOSE: List pending revisions (rendered server-side, passed in as a prop) and let a
 *   moderator open each one in a modal to review a SANITIZED preview + a line diff, then
 *   approve or reject via /api/admin/edits. Hydrated via client:load.
 *
 * SECURITY (release gate — XSS):
 *   - The revision's proposed Markdown is rendered to HTML with `marked` and then passed
 *     through sanitizeHtml() (lib/sanitize) BEFORE it is ever placed in the DOM via
 *     dangerouslySetInnerHTML. Untrusted contributor content is never injected raw.
 *   - Approve/reject calls hit /api/admin/edits, which re-verifies the moderator session
 *     (trustLevel>=2) server-side; no Hasura admin secret reaches this island.
 * CONVERSION: replaces the Next `PendingEditsList` (which used server actions) — actions now
 *   POST to /api/admin/edits with action=approve|reject.
 * REF: ports app/admin/edits/page.tsx review UI (auth-interactive migration group)
 */
'use client'

import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { sanitizeHtml } from '@/lib/sanitize'
import { DiffViewer } from '../../../components/contributor/DiffViewer'

export interface PendingRevision {
  id: string
  content_type: string
  content_slug: string
  editor_username: string
  previous_content: string | null
  new_content: string
  change_summary: string | null
  is_minor: boolean
  diff_size_pct: number | null
  created_at: string
}

interface Props {
  revisions: PendingRevision[]
}

type Tab = 'preview' | 'diff'

async function review(
  action: 'approve' | 'reject',
  rev: PendingRevision,
  reason?: string
): Promise<boolean> {
  const fd = new FormData()
  fd.set('action', action)
  fd.set('content_type', rev.content_type)
  fd.set('content_slug', rev.content_slug)
  fd.set('revision_id', rev.id)
  if (reason) fd.set('reason', reason)
  try {
    const res = await fetch('/api/admin/edits', { method: 'POST', body: fd })
    return res.ok
  } catch {
    return false
  }
}

function ReviewModal({ rev, onClose }: { rev: PendingRevision; onClose: (changed: boolean) => void }) {
  const [tab, setTab] = useState<Tab>('preview')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // SECURITY: sanitize the rendered Markdown BEFORE injecting as HTML.
  const previewHtml = sanitizeHtml(marked.parse(rev.new_content, { async: false }) as string)

  async function act(action: 'approve' | 'reject') {
    setBusy(true)
    setError('')
    const reason = action === 'reject' ? window.prompt('Rejection reason (optional):') ?? undefined : undefined
    const ok = await review(action, rev, reason ?? undefined)
    setBusy(false)
    if (ok) onClose(true)
    else setError('Action failed. You may lack permission, or the revision was already reviewed.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 pt-10 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(false)
      }}
    >
      <div className="mx-4 mb-10 w-full max-w-4xl rounded-xl border border-iw-border bg-iw-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-iw-border px-6 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Review: {rev.content_type} / {rev.content_slug}
            </h2>
            <p className="mt-0.5 text-xs text-iw-text-muted">
              by {rev.editor_username}
              {rev.is_minor && ' · minor'}
              {rev.change_summary ? ` · ${rev.change_summary}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded-md p-1 text-iw-text-muted hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-iw-border px-6">
          {(['preview', 'diff'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`mr-4 border-b-2 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-iw-accent text-iw-accent' : 'border-transparent text-iw-text-secondary hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'preview' && (
            <div
              className="prose prose-invert prose-sm min-h-[300px] max-w-none rounded-lg border border-iw-border bg-iw-surface p-4"
              // SECURITY: previewHtml is sanitized above via sanitizeHtml().
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
          {tab === 'diff' && (
            <DiffViewer oldContent={rev.previous_content ?? ''} newContent={rev.new_content} />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-iw-border px-6 py-4">
          {error && <p className="mr-auto text-xs text-red-400">{error}</p>}
          <button
            aria-label="Reject"
            type="button"
            disabled={busy}
            onClick={() => act('reject')}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            aria-label="Approve"
            type="button"
            disabled={busy}
            onClick={() => act('approve')}
            className="rounded-lg bg-iw-accent px-5 py-2 text-sm font-semibold text-iw-bg hover:bg-iw-accent-light disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PendingEditsList({ revisions }: Props) {
  const [active, setActive] = useState<PendingRevision | null>(null)

  if (revisions.length === 0) {
    return (
      <div className="rounded-xl border border-iw-border bg-iw-surface p-8 text-center">
        <p className="text-sm text-iw-text-secondary">No pending edits. All caught up.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {revisions.map((rev) => (
        <button
          key={rev.id}
          type="button"
          onClick={() => setActive(rev)}
          className="flex w-full items-start gap-3 rounded-lg border border-iw-border bg-iw-surface/60 px-4 py-3 text-left transition-colors hover:border-iw-accent/40"
        >
          <span className="mt-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-400">pending</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-iw-text">
              {rev.content_type} / {rev.content_slug}
            </div>
            <div className="mt-0.5 text-xs text-iw-text-secondary/70">
              {rev.change_summary && <>{rev.change_summary} &middot; </>}
              {rev.editor_username} &middot; {new Date(rev.created_at).toLocaleString()}
              {rev.is_minor && ' · minor'}
            </div>
          </div>
        </button>
      ))}

      {active && (
        <ReviewModal
          rev={active}
          onClose={(changed) => {
            setActive(null)
            if (changed) window.location.reload()
          }}
        />
      )}
    </div>
  )
}
