'use client'

import { useEffect, useState, useMemo } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocProps {
  content?: string
  headings?: TocItem[]
}

export function TableOfContents({ content, headings: propHeadings }: TocProps) {
  const [activeId, setActiveId] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  // Parse headings from HTML content or use provided headings
  const headings = useMemo(() => {
    if (propHeadings) return propHeadings
    if (!content) return []

    const items: TocItem[] = []
    const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi
    let match

    while ((match = regex.exec(content)) !== null) {
      items.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, ''),
      })
    }

    return items
  }, [content, propHeadings])

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="sticky top-20 w-[180px] shrink-0">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between pb-2 text-xs font-semibold uppercase tracking-wider text-iw-text-secondary/70"
      >
        Contents
        <svg
          className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-90'}`}
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

      {!collapsed && (
        <nav className="max-h-[calc(100vh-8rem)] space-y-0.5 overflow-y-auto border-s border-iw-border">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block border-s-2 py-1 text-xs transition-colors ${
                h.level === 3 ? 'ps-5' : 'ps-3'
              } ${
                activeId === h.id
                  ? 'border-iw-accent text-white'
                  : 'border-transparent text-iw-text-secondary hover:text-iw-text'
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
