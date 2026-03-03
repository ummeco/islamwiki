'use client'
interface DiscoverModeToggleProps {
  mode: 'traditional' | 'discover'
  hasGroups: boolean
  onChange: (mode: 'traditional' | 'discover') => void
}

export function DiscoverModeToggle({ mode, hasGroups, onChange }: DiscoverModeToggleProps) {
  if (!hasGroups) return null
  return (
    <div className="flex rounded-lg border border-iw-border bg-iw-surface p-0.5" role="tablist">
      {(['traditional', 'discover'] as const).map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === m ? 'bg-iw-bg text-white shadow-sm' : 'text-iw-text-muted hover:text-white'
          }`}
        >
          {m === 'traditional' ? 'Traditional' : 'Discover'}
        </button>
      ))}
    </div>
  )
}
