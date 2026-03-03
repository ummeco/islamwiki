'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AuthButton } from './auth-button'
import { SearchModal } from '@/components/search/search-modal'

const navItems = [
  { label: 'Quran', href: '/quran' },
  { label: 'Hadith', href: '/hadith' },
  { label: 'Seerah', href: '/seerah' },
  { label: 'People', href: '/people' },
  { label: 'Books', href: '/books' },
  { label: 'Articles', href: '/articles' },
  { label: 'Video', href: '/videos' },
  { label: 'Audio', href: '/audio' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-iw-border bg-iw-bg/90 backdrop-blur-xl">
      <nav className="section-container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" alt="Islam.wiki" width={28} height={28} className="rounded" />
          <span className="text-lg font-bold">
            <span className="text-white">Islam</span>
            <span className="text-iw-text-muted">.</span>
            <span className="text-iw-accent">wiki</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname?.startsWith(item.href)
                  ? 'bg-iw-elevated text-white'
                  : 'text-iw-text-secondary hover:text-iw-text'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <SearchModal />
          <AuthButton />
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-md p-2 text-iw-text-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-iw-border bg-iw-bg/95 backdrop-blur-xl md:hidden">
          <div className="section-container space-y-0.5 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname?.startsWith(item.href)
                    ? 'bg-iw-elevated text-white'
                    : 'text-iw-text-secondary hover:text-iw-text'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-iw-border" />
            <Link
              href="/search"
              className="block rounded-md px-3 py-2 text-sm text-iw-text-secondary hover:text-iw-text"
              onClick={() => setMobileOpen(false)}
            >
              Search
            </Link>
            <div className="px-3 py-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
