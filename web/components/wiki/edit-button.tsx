'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface EditButtonProps {
  editHref: string
}

export function EditButton({ editHref }: EditButtonProps) {
  const [user, setUser] = useState<{
    trustLevel: number
    role: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  const href = user ? editHref : `/signin?redirect=${encodeURIComponent(editHref)}`
  const label = user && user.trustLevel >= 2 ? 'Edit' : 'Suggest edit'

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      {label}
    </Link>
  )
}
