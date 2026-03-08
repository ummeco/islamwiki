'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SectItem {
  id: number
  slug: string
  name_ar: string
  name_en: string
  parent_sect_id?: number
  description_en: string
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  mainstream: 'bg-emerald-500/20 text-emerald-300',
  accepted: 'bg-blue-500/20 text-blue-300',
  deviant: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
  other: 'bg-gray-500/20 text-gray-300',
  active: 'bg-purple-500/20 text-purple-300',
  orthodox: 'bg-emerald-500/20 text-emerald-300',
  historical: 'bg-gray-500/20 text-gray-300',
}

function SectNode({
  sect,
  subSects,
}: {
  sect: SectItem
  subSects: SectItem[]
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = subSects.length > 0

  return (
    <div>
      <div className="card group flex items-center gap-3">
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-iw-text-muted transition-colors hover:bg-iw-surface hover:text-white"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-6 flex-shrink-0" />}

        <Link
          href={`/sects/${sect.slug}`}
          className="flex-1"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-iw-text group-hover:text-white">
              {sect.name_en}
            </h2>
            <span className={`badge ${STATUS_COLORS[sect.status]}`}>
              {sect.status}
            </span>
          </div>
          {sect.name_ar && (
            <p className="arabic-text text-sm text-white/70">{sect.name_ar}</p>
          )}
          <p className="mt-1 line-clamp-2 text-sm text-iw-text-secondary">
            {sect.description_en}
          </p>
        </Link>
      </div>

      {hasChildren && open && (
        <div className="ml-8 mt-2 space-y-2 border-l border-iw-border pl-4">
          {subSects.map((child) => (
            <Link
              key={child.id}
              href={`/sects/${child.slug}`}
              className="block rounded-lg border border-iw-border p-3 transition-colors hover:border-iw-text-muted/20 hover:bg-iw-surface"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-iw-text">
                  {child.name_en}
                </span>
                <span className={`badge text-xs ${STATUS_COLORS[child.status]}`}>
                  {child.status}
                </span>
              </div>
              {child.name_ar && (
                <p className="arabic-text mt-0.5 text-xs text-white/60">{child.name_ar}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function SectTree({ sects }: { sects: SectItem[] }) {
  const roots = sects.filter((s) => !s.parent_sect_id)

  return (
    <div className="space-y-4">
      {roots.map((sect) => {
        const children = sects.filter((s) => s.parent_sect_id === sect.id)
        return <SectNode key={sect.id} sect={sect} subSects={children} />
      })}
    </div>
  )
}
