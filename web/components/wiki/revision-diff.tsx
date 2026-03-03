'use client'

import { diffLines } from 'diff'

interface RevisionDiffProps {
  oldContent: string
  newContent: string
  oldLabel?: string
  newLabel?: string
}

export function RevisionDiff({
  oldContent,
  newContent,
  oldLabel = 'Previous',
  newLabel = 'Current',
}: RevisionDiffProps) {
  const changes = diffLines(oldContent, newContent)

  return (
    <div className="overflow-hidden rounded-xl border border-iw-border">
      <div className="flex items-center gap-4 border-b border-iw-border bg-iw-bg/60 px-4 py-2 text-xs text-iw-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500/40" />
          {oldLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" />
          {newLabel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          {changes.map((part, i) => {
            if (part.added) {
              return (
                <span
                  key={i}
                  className="bg-emerald-500/15 text-emerald-300"
                >
                  {part.value}
                </span>
              )
            }
            if (part.removed) {
              return (
                <span key={i} className="bg-red-500/15 text-red-300">
                  {part.value}
                </span>
              )
            }
            return (
              <span key={i} className="text-iw-text-secondary/70">
                {part.value}
              </span>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
