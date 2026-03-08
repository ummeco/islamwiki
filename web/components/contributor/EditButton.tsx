'use client'

import { useState } from 'react'
import { EditModal } from './EditModal'

interface EditButtonProps {
  contentType: string
  contentSlug: string
  contentId?: string
  currentContent: string
  pageTitle: string
}

export function EditButton({
  contentType,
  contentSlug,
  contentId,
  currentContent,
  pageTitle,
}: EditButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-iw-border px-3 py-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:border-iw-accent/40 hover:text-white"
        aria-label="Edit this page"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>

      {open && (
        <EditModal
          contentType={contentType}
          contentSlug={contentSlug}
          contentId={contentId}
          currentContent={currentContent}
          pageTitle={pageTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
