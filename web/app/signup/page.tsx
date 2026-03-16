import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: { index: false },
}

export default function SignUpPage() {
  redirect('/auth/register')
}
