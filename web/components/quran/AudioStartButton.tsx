'use client'

interface AudioStartButtonProps {
  onClick: () => void
}

export function AudioStartButton({ onClick }: AudioStartButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Play surah recitation"
      className="flex items-center gap-2 rounded-lg border border-iw-border px-4 py-2 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-accent hover:text-white"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
      Listen
    </button>
  )
}
