import { Suspense } from 'react'
import { AccountForm } from './account-form'

export const metadata = {
  title: 'Account',
  description: 'Sign in or create your Islam.wiki account.',
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountForm />
    </Suspense>
  )
}
