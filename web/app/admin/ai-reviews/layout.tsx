import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Content Reviews | Islam.wiki Admin',
  description: 'Admin tool for triggering and reviewing AI theological compliance checks.',
  robots: { index: false, follow: false },
}

export default function AIReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
