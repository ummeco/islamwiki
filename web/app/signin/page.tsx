import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign In | Islam.wiki',
  description: 'Sign in to your Islam.wiki account.',
  robots: { index: false, follow: false },
}

export default function SignInPage() {
  redirect('/account')
}
