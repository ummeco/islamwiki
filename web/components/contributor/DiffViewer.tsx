'use client'

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed'
  content: string
  lineNum?: number
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: DiffLine[] = []

  // Simple LCS-based diff
  const m = oldLines.length
  const n = newLines.length

  // Build LCS table
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
      }
    }
  }

  // Traceback
  const trace: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      trace.unshift({ type: 'unchanged', content: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      trace.unshift({ type: 'added', content: newLines[j - 1] })
      j--
    } else {
      trace.unshift({ type: 'removed', content: oldLines[i - 1] })
      i--
    }
  }

  return trace
}

interface DiffViewerProps {
  oldContent: string
  newContent: string
  className?: string
}

export function DiffViewer({ oldContent, newContent, className = '' }: DiffViewerProps) {
  const diff = computeDiff(oldContent, newContent)

  const added = diff.filter((l) => l.type === 'added').length
  const removed = diff.filter((l) => l.type === 'removed').length

  if (oldContent === newContent) {
    return (
      <div className={`rounded-lg border border-iw-border bg-iw-surface p-6 text-center text-sm text-iw-text-muted ${className}`}>
        No changes yet.
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-iw-border bg-iw-surface overflow-hidden ${className}`}>
      <div className="flex items-center gap-4 border-b border-iw-border px-4 py-2 text-xs font-medium">
        <span className="text-emerald-400">+{added} added</span>
        <span className="text-red-400">-{removed} removed</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <tbody>
            {diff.map((line, idx) => (
              <tr
                key={idx}
                className={
                  line.type === 'added'
                    ? 'bg-emerald-900/20'
                    : line.type === 'removed'
                      ? 'bg-red-900/20'
                      : ''
                }
              >
                <td className="w-8 select-none px-2 py-0.5 text-center text-iw-text-muted">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </td>
                <td
                  className={`px-3 py-0.5 whitespace-pre-wrap break-all ${
                    line.type === 'added'
                      ? 'text-emerald-300'
                      : line.type === 'removed'
                        ? 'text-red-300'
                        : 'text-iw-text-secondary'
                  }`}
                >
                  {line.content || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
