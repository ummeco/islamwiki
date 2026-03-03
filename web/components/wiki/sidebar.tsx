'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const sections = [
  { label: 'Main Page', href: '/' },
  { label: 'Quran', href: '/quran' },
  { label: 'Hadith', href: '/hadith' },
  { label: 'Seerah', href: '/seerah' },
  { label: 'People', href: '/people' },
  { label: 'Books', href: '/books' },
  { label: 'Articles', href: '/articles' },
  { label: 'Sects', href: '/sects' },
  { label: 'Videos', href: '/videos' },
  { label: 'Audio', href: '/audio' },
]

const community = [
  { label: 'Recent Changes', href: '/recent-changes' },
  { label: 'About', href: '/wiki/about' },
  { label: 'Contribute', href: '/wiki/contribute' },
  { label: 'Guidelines', href: '/wiki/guidelines' },
  { label: 'Contact', href: '/wiki/contact' },
]

function SidebarSection({
  title,
  links,
  pathname,
  defaultOpen = true,
}: {
  title: string
  links: { label: string; href: string }[]
  pathname: string | null
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-iw-text-secondary/70"
      >
        {title}
        <svg
          className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <nav className="space-y-0.5">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-iw-accent/15 font-medium text-white'
                    : 'text-iw-text-secondary hover:bg-iw-surface hover:text-iw-text'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

export function WikiSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 space-y-4 py-4">
      <SidebarSection
        title="Content"
        links={sections}
        pathname={pathname}
      />
      <SidebarSection
        title="Community"
        links={community}
        pathname={pathname}
      />
      <div className="border-t border-iw-border pt-3">
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-iw-text-secondary transition-colors hover:bg-iw-surface hover:text-iw-text"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </Link>
      </div>
    </aside>
  )
}
