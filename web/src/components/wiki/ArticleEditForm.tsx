/**
 * ArticleEditForm.tsx — Astro island port of the editor used by app/articles/[slug]/edit/page.tsx
 *
 * PURPOSE: Inline Markdown editor for an article (edit / preview / diff + submit). Replaces the
 *   Next `MarkdownEditor` component. Hydrated via client:load on /articles/[slug]/edit (the page
 *   shell + auth guard are handled server-side; this island handles the interactive edit).
 *
 * SECURITY (release gate — XSS):
 *   - The live preview renders the editor Markdown to HTML with `marked` then sanitizeHtml()
 *     (lib/sanitize) BEFORE dangerouslySetInnerHTML — untrusted input is never injected raw.
 *   - Submit POSTs to /api/revisions, which re-verifies the session (401 when unauthenticated),
 *     applies the IP-block / rate-limit / trust / ban / daily-cap gates server-side. No secret
 *     reaches this island.
 * REF: ports app/articles/[slug]/edit/page.tsx editor (auth-interactive migration group)
 */
'use client'

import { useRef, useState } from 'react'
import { marked } from 'marked'
import { sanitizeHtml } from '@/lib/sanitize'
import { DiffViewer } from '../../../components/contributor/DiffViewer'

interface Props {
  contentSlug: string
  contentTitle: string
  currentContent: string
}

type Tab = 'edit' | 'preview' | 'diff'

export function ArticleEditForm({ contentSlug, contentTitle, currentContent }: Props) {
  const [tab, setTab] = useState<Tab>('edit')
  const [content, setContent] = useState(currentContent)
  const [summary, setSummary] = useState('')
  const [isMinor, setIsMinor] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasChanges = content !== currentContent

  async function handleSubmit() {
    if (!hasChanges) return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'article',
          contentSlug,
          previousContent: currentContent,
          newContent: content,
          changeSummary: summary || null,
          isMinor,
        }),
      })
      if (res.status === 401) {
        setErrorMsg('You must be logged in to edit.')
        setStatus('error')
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setErrorMsg(err.error ?? 'Submission failed')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-iw-border bg-iw-surface px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">Edit submitted</h3>
        <p className="mb-6 text-sm text-iw-text-secondary">
          Your edit has been submitted. It will be reviewed by a moderator.
        </p>
        <a
          href={`/articles/${contentSlug}`}
          className="inline-block rounded-lg bg-iw-accent px-6 py-2 text-sm font-semibold text-iw-bg hover:bg-iw-accent-light"
        >
          Back to article
        </a>
      </div>
    )
  }

  // SECURITY: sanitize the rendered Markdown BEFORE injecting as HTML.
  const previewHtml = sanitizeHtml(marked.parse(content, { async: false }) as string)

  return (
    <div className="rounded-xl border border-iw-border bg-iw-bg">
      <div className="flex border-b border-iw-border px-6">
        {(['edit', 'preview', 'diff'] as Tab[]).map((t) => (
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
        {tab === 'edit' && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-y rounded-lg border border-iw-border bg-iw-surface p-4 font-mono text-sm text-iw-text focus:border-iw-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60"
            rows={20}
            placeholder="Edit content here..."
            aria-label={`Editing ${contentTitle}`}
          />
        )}
        {tab === 'preview' && (
          <div
            className="prose prose-invert prose-sm min-h-[400px] max-w-none rounded-lg border border-iw-border bg-iw-surface p-4"
            // SECURITY: previewHtml is sanitized above via sanitizeHtml().
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
        {tab === 'diff' && <DiffViewer oldContent={currentContent} newContent={content} />}
      </div>

      <div className="space-y-3 border-t border-iw-border px-6 py-4">
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Edit summary (optional): e.g. Fixed typo, Added source"
          className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-2 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-iw-accent/60"
          maxLength={300}
        />
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-iw-text-secondary">
            <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="rounded border-iw-border" />
            Minor edit
          </label>
          <div className="flex items-center gap-3">
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <a
              href={`/articles/${contentSlug}`}
              className="rounded-lg border border-iw-border px-4 py-2 text-sm font-medium text-iw-text-secondary hover:text-white"
            >
              Cancel
            </a>
            <button
              aria-label="Submit"
              type="button"
              onClick={handleSubmit}
              disabled={!hasChanges || status === 'submitting'}
              className="rounded-lg bg-iw-accent px-5 py-2 text-sm font-semibold text-iw-bg hover:bg-iw-accent-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
