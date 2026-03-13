'use client'

import { useState } from 'react'

interface ReviewResult {
  verdict: 'pass' | 'flag' | 'reject'
  confidence: number
  issues: string[]
  summary: string
  provider?: string
  model?: string
}

const VERDICT_STYLES: Record<string, string> = {
  pass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  flag: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  reject: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function AIReviewsPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('article')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReview = async () => {
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, contentType }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || `HTTP ${res.status}`)
      } else {
        setResult(await res.json())
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Content Reviews</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          Manually trigger theological compliance checks. Requires Moderator (Level 3+).
        </p>
      </div>

      {/* Pipeline overview */}
      <div className="mb-8 rounded-xl border border-iw-border bg-iw-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-iw-accent">
          Review Pipeline
        </h2>
        <ol className="space-y-2 text-sm text-iw-text-secondary">
          {[
            'User submits edit — trust level 0/1 triggers automatic AI pre-screen',
            "AI checks against theological guidelines: aqeedah, fiqh, sourcing, shirk/bid'ah markers",
            'Returns verdict: pass / flag / reject — with confidence score and specific issues',
            'Flagged → human moderator queue. Passed → auto-approved or fast-tracked.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-bold text-iw-accent">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Manual review form */}
      <div className="rounded-xl border border-iw-border bg-iw-surface p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">Manual Review</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-iw-text-secondary">
                Content Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tawassul in Islamic Jurisprudence"
                className="w-full rounded-lg border border-iw-border bg-iw-bg px-3 py-2 text-sm text-white placeholder-iw-text-muted outline-none focus:border-iw-accent/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-iw-text-secondary">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                title="Content type"
                aria-label="Content type"
                className="w-full rounded-lg border border-iw-border bg-iw-bg px-3 py-2 text-sm text-white outline-none focus:border-iw-accent/50"
              >
                {['article', 'wiki', 'biography', 'hadith', 'book', 'tafsir'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-iw-text-secondary">
              Content to Review
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the content to review here…"
              rows={8}
              className="w-full rounded-lg border border-iw-border bg-iw-bg px-3 py-2 text-sm text-white placeholder-iw-text-muted outline-none focus:border-iw-accent/50"
            />
          </div>

          <button
            type="button"
            onClick={handleReview}
            disabled={loading || !title.trim() || !content.trim()}
            className="rounded-lg bg-iw-accent px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Reviewing…' : 'Run AI Review'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`rounded-xl border px-5 py-4 ${VERDICT_STYLES[result.verdict] ?? ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold uppercase tracking-wide">
                  {result.verdict}
                </span>
                <span className="text-sm opacity-80">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              </div>
              <p className="mt-2 text-sm opacity-90">{result.summary}</p>
            </div>

            {result.issues.length > 0 && (
              <div className="rounded-lg border border-iw-border bg-iw-bg/50 px-4 py-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-iw-text-muted">
                  Issues Found
                </h3>
                <ul className="space-y-1">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-iw-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result.provider || result.model) && (
              <p className="text-xs text-iw-text-muted">
                Reviewed by {result.provider} · {result.model}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
