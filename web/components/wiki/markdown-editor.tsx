'use client'

import { useActionState, useState } from 'react'
import { submitEdit } from '@/app/actions/wiki'
import { marked } from 'marked'

interface MarkdownEditorProps {
  contentType: string
  contentSlug: string
  contentTitle: string
  currentContent: string
}

export function MarkdownEditor({
  contentType,
  contentSlug,
  contentTitle,
  currentContent,
}: MarkdownEditorProps) {
  const [state, formAction, pending] = useActionState(submitEdit, undefined)
  const [content, setContent] = useState(currentContent)
  const [previewMode, setPreviewMode] = useState(false)

  const preview = marked.parse(content, { async: false }) as string

  function insertMarkdown(prefix: string, suffix: string = '') {
    const textarea = document.getElementById(
      'content-editor'
    ) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const before = content.substring(0, start)
    const after = content.substring(end)

    const newContent = `${before}${prefix}${selected}${suffix}${after}`
    setContent(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      )
    }, 0)
  }

  return (
    <div>
      {state?.error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {state.status === 'approved'
            ? 'Edit published successfully!'
            : 'Edit submitted for review. A moderator will review it shortly.'}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="content_type" value={contentType} />
        <input type="hidden" name="content_slug" value={contentSlug} />
        <input type="hidden" name="content_title" value={contentTitle} />

        {/* Toolbar */}
        <div className="mb-2 flex items-center gap-1 rounded-t-xl border border-b-0 border-iw-border bg-iw-bg/60 px-2 py-1.5">
          <button
            type="button"
            onClick={() => insertMarkdown('**', '**')}
            className="rounded px-2 py-1 text-xs font-bold text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('*', '*')}
            className="rounded px-2 py-1 text-xs italic text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('## ')}
            className="rounded px-2 py-1 text-xs text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('[', '](url)')}
            className="rounded px-2 py-1 text-xs text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="Link"
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('- ')}
            className="rounded px-2 py-1 text-xs text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="List"
          >
            List
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('> ')}
            className="rounded px-2 py-1 text-xs text-iw-text-secondary hover:bg-iw-elevated hover:text-iw-text"
            title="Quote"
          >
            Quote
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              previewMode
                ? 'bg-iw-accent/15 text-white'
                : 'text-iw-text-secondary hover:text-iw-text'
            }`}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>

        {/* Editor / Preview */}
        {previewMode ? (
          <div className="min-h-[400px] rounded-b-xl border border-iw-border bg-iw-bg/40 p-6">
            <div
              className="prose prose-invert max-w-none text-iw-text-secondary"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        ) : (
          <textarea
            id="content-editor"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] w-full resize-y rounded-b-xl border border-iw-border bg-iw-bg/40 p-4 font-mono text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
            placeholder="Write your content in Markdown..."
          />
        )}

        {/* Edit summary */}
        <div className="mt-4">
          <label
            htmlFor="edit_summary"
            className="mb-1 block text-sm font-medium text-iw-text-secondary"
          >
            Edit summary (describe your changes)
          </label>
          <input
            id="edit_summary"
            name="edit_summary"
            type="text"
            required
            minLength={3}
            placeholder="e.g., Added section on early life, fixed dates"
            className="w-full rounded-lg border border-iw-border bg-iw-surface px-4 py-2.5 text-sm text-iw-text placeholder:text-iw-text-muted focus:border-iw-accent/40 focus:ring-1 focus:ring-iw-accent/40 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-iw-accent px-6 py-2.5 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light disabled:opacity-50"
          >
            {pending ? 'Submitting...' : 'Submit Edit'}
          </button>
          <span className="text-xs text-iw-text-muted">
            {content.length} characters
          </span>
        </div>
      </form>
    </div>
  )
}
