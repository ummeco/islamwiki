'use client'

interface PlayAyahButtonProps {
  ayahNumber: number
  isPlaying: boolean
  isCurrentAyah: boolean
  onPlay: (ayah: number) => void
}

export function PlayAyahButton({ ayahNumber, isPlaying, isCurrentAyah, onPlay }: PlayAyahButtonProps) {
  return (
    <button
      onClick={() => onPlay(ayahNumber)}
      aria-label={`${isPlaying && isCurrentAyah ? 'Currently playing' : 'Play'} verse ${ayahNumber}`}
      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
        isCurrentAyah
          ? 'border-iw-accent bg-iw-accent/10 text-iw-accent'
          : 'border-iw-border text-iw-text-muted hover:border-iw-accent hover:text-iw-accent'
      }`}
    >
      {isPlaying && isCurrentAyah ? (
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-0.5 animate-bounce bg-current"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      ) : (
        <svg className="h-3 w-3 translate-x-px" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  )
}
