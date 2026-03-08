'use client'

import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'

interface AyahBookmarkButtonProps {
  surahNumber: number
  ayahNumber: number
  surahNameEn: string
  surahNameAr: string
}

export function AyahBookmarkButton({
  surahNumber,
  ayahNumber,
  surahNameEn,
  surahNameAr,
}: AyahBookmarkButtonProps) {
  const { mounted, isBookmarked, addBookmark, removeBookmark } = useQuranBookmarks()

  if (!mounted) return null

  const saved = isBookmarked(surahNumber, ayahNumber)

  function toggle() {
    if (saved) {
      removeBookmark(surahNumber, ayahNumber)
    } else {
      addBookmark({ surahNumber, ayahNumber, surahNameEn, surahNameAr })
    }
  }

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove bookmark' : 'Bookmark this verse'}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this verse'}
      className={`rounded p-1 transition-colors ${saved ? 'text-iw-accent hover:text-iw-accent/70' : 'text-iw-text-muted hover:text-iw-text'}`}
    >
      <svg
        className="h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
