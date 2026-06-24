/**
 * EditButton.tsx — Astro island port of components/wiki/edit-button.tsx
 *
 * PURPOSE: Edit / Suggest-edit affordance gated by the viewer's auth + trust level.
 * CONVERSION: next/link → <a>. Auth check stays a client-side fetch to
 *   /api/auth/me (trust-level gate preserved exactly — the label only shows
 *   "Edit" at trustLevel >= 2, otherwise "Suggest edit"; unauthenticated users
 *   are routed to /account). No admin secret is ever read here.
 * REF: ports components/wiki/edit-button.tsx (articles-wiki migration group)
 */
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

  const href = user ? editHref : `/account?redirect=${encodeURIComponent(editHref)}`
  const label = user && user.trustLevel >= 2 ? 'Edit' : 'Suggest edit'

  return (
    <a
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
    </a>
  )
}
