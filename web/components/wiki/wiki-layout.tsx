'use client'

import Link from 'next/link'
import { WikiSidebar } from './sidebar'
import { TableOfContents } from './toc'

interface Breadcrumb {
  label: string
  href?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

interface WikiLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  tocHeadings?: TocItem[]
  showSidebar?: boolean
  showToc?: boolean
}

export function WikiLayout({
  children,
  breadcrumbs,
  tocHeadings,
  showSidebar = true,
  showToc = true,
}: WikiLayoutProps) {
  return (
    <div className="section-container">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 py-3 text-xs text-iw-text-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-iw-text">
            Home
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-iw-border">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-iw-text">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-iw-text">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Three-column layout */}
      <div className="flex gap-6">
        {/* Sidebar - hidden on mobile */}
        {showSidebar && (
          <div className="hidden border-r border-iw-border pr-4 lg:block">
            <WikiSidebar />
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 py-4">{children}</main>

        {/* TOC - hidden on mobile and tablets */}
        {showToc && tocHeadings && tocHeadings.length > 0 && (
          <div className="hidden xl:block">
            <div className="py-4">
              <TableOfContents headings={tocHeadings} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
