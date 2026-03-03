'use client'

import Link from 'next/link'

interface ContentTabsProps {
  basePath: string
  activeTab: 'read' | 'edit' | 'history'
  canEdit?: boolean
}

export function ContentTabs({
  basePath,
  activeTab,
  canEdit = false,
}: ContentTabsProps) {
  const tabs = [
    { key: 'read', label: 'Read', href: basePath },
    ...(canEdit
      ? [{ key: 'edit', label: 'Edit', href: `${basePath}/edit` }]
      : []),
    { key: 'history', label: 'History', href: `${basePath}/history` },
  ]

  return (
    <div className="mb-6 flex items-center gap-1 border-b border-iw-border">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'text-white'
              : 'text-iw-text-secondary hover:text-iw-text'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-iw-accent" />
          )}
        </Link>
      ))}
    </div>
  )
}
