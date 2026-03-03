import { Suspense } from 'react'
import { SignInForm } from './signin-form'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to Islam.wiki to contribute to the encyclopedia.',
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
