'use client'

import { useState } from 'react'

interface Props {
  textEn: string
  textAr?: string
  reference: string
  shareUrl: string
}

export function HadithActions({ textEn, textAr, reference, shareUrl }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const parts: string[] = []
    if (textAr) parts.push(textAr)
    parts.push(`"${textEn}"`)
    parts.push(`— ${reference}`)
    parts.push(shareUrl)
    navigator.clipboard.writeText(parts.join('\n\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Hadith — ${reference}`,
        text: `"${textEn}" — ${reference}`,
        url: shareUrl,
      }).catch(() => {/* dismissed */})
    } else {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-iw-border px-4 py-2 text-xs text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:text-iw-accent"
        title="Copy hadith text"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-lg border border-iw-border px-4 py-2 text-xs text-iw-text-secondary transition-colors hover:border-iw-accent/30 hover:text-iw-accent"
        title="Share hadith"
      >
        Share
      </button>
    </div>
  )
}
