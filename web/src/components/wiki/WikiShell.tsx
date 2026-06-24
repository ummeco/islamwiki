/**
 * WikiShell.tsx — Astro island port of components/wiki/wiki-layout.tsx
 *
 * PURPOSE: Three-column reading layout (sidebar | content | TOC) with breadcrumbs.
 *   Used as a single client:load island wrapping the (already-sanitized) page body.
 * CONVERSION: next/link → <a>. Children are passed as a sanitized HTML string
 *   (bodyHtml) rendered via dangerouslySetInnerHTML, OR as React children for
 *   non-content chrome. Sanitization happens SERVER-SIDE in the .astro page before
 *   the island receives bodyHtml — the island never sanitizes.
 * CONSTRAINTS: No next/* imports. bodyHtml MUST already be passed through
 *   lib/sanitize.ts sanitizeHtml() upstream (XSS release gate).
 * REF: ports components/wiki/wiki-layout.tsx (articles-wiki migration group)
 */
import type { ReactNode } from 'react'
import { WikiSidebar } from './WikiSidebar'
import { TableOfContents, type TocItem } from './TableOfContents'

export interface Breadcrumb {
  label: string
  href?: string
}

interface WikiShellProps {
  children?: ReactNode
  /** Pre-sanitized HTML for the main content body. Sanitized server-side. */
  bodyHtml?: string
  breadcrumbs?: Breadcrumb[]
  tocHeadings?: TocItem[]
  showSidebar?: boolean
  showToc?: boolean
}

export function WikiShell({
  children,
  bodyHtml,
  breadcrumbs,
  tocHeadings,
  showSidebar = true,
  showToc = true,
}: WikiShellProps) {
  return (
    <div className="section-container">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 py-3 text-xs text-iw-text-secondary"
          aria-label="Breadcrumb"
        >
          <a href="/" className="hover:text-iw-text">
            Home
          </a>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-iw-border">/</span>
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-iw-text">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-iw-text">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex gap-6">
        {showSidebar && (
          <div className="hidden border-r border-iw-border pr-4 lg:block">
            <WikiSidebar />
          </div>
        )}

        <main className="min-w-0 flex-1 py-4">
          {bodyHtml !== undefined ? (
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : (
            children
          )}
        </main>

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
