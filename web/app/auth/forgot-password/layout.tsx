import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Islam.wiki',
  description: 'Request a password reset link for your Islam.wiki account.',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
