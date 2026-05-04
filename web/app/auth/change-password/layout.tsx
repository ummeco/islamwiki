import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password | Islam.wiki',
  description: 'Set a new password for your Islam.wiki account.',
  robots: { index: false, follow: false },
}

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
