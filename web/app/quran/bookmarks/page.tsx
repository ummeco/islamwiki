import type { Metadata } from 'next'
import { BookmarksClient } from './BookmarksClient'

export const metadata: Metadata = {
  title: 'My Quran Bookmarks',
  description: 'Your saved Quran verses. Bookmarks are stored locally in your browser.',
  robots: { index: false },
}

export default function QuranBookmarksPage() {
  return <BookmarksClient />
}
