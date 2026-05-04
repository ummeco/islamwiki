import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reading Preferences | Islam.wiki',
  description: 'Manage your Quran reading language, translation, reciter, and tafsir preferences.',
  robots: { index: false, follow: false },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
