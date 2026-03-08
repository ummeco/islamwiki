'use client'

import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import { sanitizeHtml } from '@/lib/sanitize'
import { DiffViewer } from './DiffViewer'

interface EditModalProps {
  contentType: string
  contentSlug: string
  contentId?: string
  currentContent: string
  pageTitle: string
  onClose: () => void
}

type Tab = 'edit' | 'preview' | 'diff'

export function EditModal({
  contentType,
  contentSlug,
  contentId,
  currentContent,
  pageTitle,
  onClose,
}: EditModalProps) {
  const [tab, setTab] = useState<Tab>('edit')
  const [content, setContent] = useState(currentContent)
  const [summary, setSummary] = useState('')
  const [isMinor, setIsMinor] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
          contentType,
          contentSlug,
          contentId,
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
        const err = await res.json()
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 pt-10 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-4xl rounded-xl border border-iw-border bg-iw-bg shadow-2xl mx-4 mb-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-iw-border px-6 py-4">
          <div>
            <h2 className="font-semibold text-white">Edit: {pageTitle}</h2>
            <p className="text-xs text-iw-text-muted mt-0.5">
              {contentType} / {contentSlug}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-iw-text-muted hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Edit submitted</h3>
            <p className="text-sm text-iw-text-secondary mb-6">
              Your edit has been submitted. It will be reviewed by a moderator.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-iw-accent px-6 py-2 text-sm font-semibold text-iw-bg hover:bg-iw-accent-light"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-iw-border px-6">
              {(['edit', 'preview', 'diff'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`mr-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                    tab === t
                      ? 'border-iw-accent text-iw-accent'
                      : 'border-transparent text-iw-text-secondary hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="p-6">
              {tab === 'edit' && (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-iw-border bg-iw-surface p-4 font-mono text-sm text-iw-text focus:border-iw-accent focus:outline-none resize-y"
                  rows={20}
                  placeholder="Edit content here..."
                />
              )}

              {tab === 'preview' && (
                <div
                  className="prose prose-invert prose-sm max-w-none min-h-[400px] rounded-lg border border-iw-border bg-iw-surface p-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(content, { async: false }) as string) }}
                />
              )}

              {tab === 'diff' && (
                <DiffViewer oldContent={currentContent} newContent={content} />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-iw-border px-6 py-4 space-y-3">
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Edit summary (optional): e.g. Fixed typo, Added source"
                className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-2 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent focus:outline-none"
                maxLength={300}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-iw-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMinor}
                    onChange={(e) => setIsMinor(e.target.checked)}
                    className="rounded border-iw-border"
                  />
                  Minor edit
                </label>

                <div className="flex items-center gap-3">
                  {errorMsg && (
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-iw-border px-4 py-2 text-sm font-medium text-iw-text-secondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!hasChanges || status === 'submitting'}
                    className="rounded-lg bg-iw-accent px-5 py-2 text-sm font-semibold text-iw-bg hover:bg-iw-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? 'Submitting…' : 'Submit edit'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
