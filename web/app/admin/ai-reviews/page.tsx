import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Reviews',
  description: 'AI-powered content review dashboard.',
}

export default function AIReviewsPage() {
  return (
    <div className="section-container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Content Reviews</h1>
        <p className="mt-2 text-sm text-iw-text-secondary">
          AI-powered theological compliance checking for wiki contributions.
        </p>
      </div>

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
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
        <p className="text-sm text-iw-text-secondary">
          AI review system will be active once the AI backend is configured.
        </p>
        <p className="mt-2 text-xs text-iw-text-muted">
          This system uses Claude and OpenAI to review wiki edits for theological
          accuracy and compliance with Ahl us-Sunnah wal-Jama'ah guidelines.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-iw-border bg-iw-surface p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Review Pipeline
        </h2>
        <ol className="space-y-3 text-sm text-iw-text-secondary">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-medium text-iw-accent">
              1
            </span>
            <span>
              User submits an edit (trust level 0-1 triggers automatic AI review)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-medium text-iw-accent">
              2
            </span>
            <span>
              AI checks content against theological guidelines, known sources, and scholarly consensus
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-medium text-iw-accent">
              3
            </span>
            <span>
              Returns verdict (pass / flag / reject) with confidence score and specific issues
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-medium text-iw-accent">
              4
            </span>
            <span>
              Flagged content goes to human moderator queue. Passed content is auto-approved or fast-tracked.
            </span>
          </li>
        </ol>
      </div>
    </div>
  )
}
