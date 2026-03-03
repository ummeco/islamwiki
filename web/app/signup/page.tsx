'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { SignupWizard } from '@/components/auth/signup-wizard'

function SignupContent() {
  return (
    <AuthCard
      title="Join Islam.wiki"
      subtitle="Create an account to contribute and help build the most comprehensive Islamic reference."
    >
      <SignupWizard />

      <p className="mt-6 text-center text-sm text-iw-text-secondary">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-iw-accent hover:text-white">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-iw-accent border-t-transparent" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
