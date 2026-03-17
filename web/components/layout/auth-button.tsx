'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

interface AuthUser {
  userId: string
  username: string
  email: string
  displayName: string
  role: string
  trustLevel: number
}

export function AuthButton() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-iw-border" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/account"
        className="rounded-md border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-iw-text"
      >
        Login
      </Link>
    )
  }

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-iw-accent/15 text-xs font-bold text-iw-accent transition-colors hover:bg-iw-accent/25"
        title={user.displayName}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-iw-border bg-iw-surface p-2 shadow-xl">
          <div className="border-b border-iw-border px-3 py-2">
            <p className="text-sm font-medium text-iw-text">
              {user.displayName}
            </p>
            <p className="text-xs text-iw-text-muted">@{user.username}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-iw-accent">
              {user.role} &middot; Trust {user.trustLevel}
            </p>
          </div>

          <div className="mt-1 space-y-0.5">
            <Link
              href={`/profile/${user.username}`}
              className="block rounded-md px-3 py-2 text-sm text-iw-text-secondary transition-colors hover:bg-iw-elevated hover:text-iw-text"
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>
            {user.trustLevel >= 4 && (
              <Link
                href="/admin"
                className="block rounded-md px-3 py-2 text-sm text-iw-text-secondary transition-colors hover:bg-iw-elevated hover:text-iw-text"
                onClick={() => setOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/recent-changes"
              className="block rounded-md px-3 py-2 text-sm text-iw-text-secondary transition-colors hover:bg-iw-elevated hover:text-iw-text"
              onClick={() => setOpen(false)}
            >
              Recent Changes
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-start text-sm text-red-400 transition-colors hover:bg-red-500/10"
                onClick={() => setOpen(false)}
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
