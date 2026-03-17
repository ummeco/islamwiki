'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NarratorNode {
  position: number
  name_en: string
  name_ar?: string
  slug?: string
  type: string
  // Legacy field aliases
  person_name_en?: string
  person_name_ar?: string
  person_slug?: string
  role?: string
}

interface IsnadChainProps {
  chain: NarratorNode[]
  evaluation?: string
  chainTextAr?: string
}

function getEvaluationStyle(evaluation: string): string {
  const lower = evaluation.toLowerCase()
  if (lower === 'sahih') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  if (lower === 'hasan') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  if (lower === "da'if" || lower === 'daif') return 'bg-red-500/20 text-red-300 border-red-500/30'
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

export function IsnadChain({ chain, evaluation, chainTextAr }: IsnadChainProps) {
  const [showArabic, setShowArabic] = useState(false)

  if (!chain || chain.length === 0) {
    return (
      <div className="rounded-xl border border-iw-border bg-iw-surface p-6">
        <h2 className="mb-3 text-sm font-semibold text-white">Isnad Chain</h2>
        <p className="text-sm text-iw-text-secondary">
          Isnad chain data is not yet available for this hadith.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-iw-border bg-iw-surface p-6">
      <h2 className="mb-5 text-sm font-semibold text-white">Isnad Chain</h2>

      {/* Vertical chain */}
      <div className="relative ml-4">
        {chain.map((narrator, index) => {
          const isLast = index === chain.length - 1

          return (
            <div key={narrator.position} className="relative pb-6 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute top-8 left-3.5 h-[calc(100%-1.5rem)] w-px bg-iw-border"
                  aria-hidden="true"
                />
              )}

              {/* Downward arrow between nodes */}
              {!isLast && (
                <div
                  className="absolute bottom-1 left-2 text-iw-text-muted"
                  aria-hidden="true"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M6 9L2 5h8L6 9z" />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Position badge */}
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-iw-border bg-iw-bg text-xs font-medium text-iw-accent">
                  {narrator.position}
                </div>

                {/* Narrator info */}
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    {(narrator.slug || narrator.person_slug) ? (
                      <Link
                        href={`/people/${narrator.slug || narrator.person_slug}`}
                        className="text-sm font-medium text-iw-accent hover:text-white transition-colors"
                      >
                        {narrator.name_en || narrator.person_name_en || narrator.name_ar}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-iw-text">
                        {narrator.name_en || narrator.person_name_en || narrator.name_ar}
                      </span>
                    )}
                    <span className="rounded-md bg-iw-elevated/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-iw-text-secondary">
                      {narrator.type || narrator.role}
                    </span>
                  </div>
                  {(narrator.name_ar || narrator.person_name_ar) && (
                    <p className="mt-0.5 font-[var(--font-arabic)] text-xs text-iw-text-secondary/80 direction-rtl" dir="rtl" lang="ar">
                      {narrator.name_ar || narrator.person_name_ar}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Evaluation badge */}
      {evaluation && (
        <div className="mt-5 flex items-center gap-2 border-t border-iw-border pt-4">
          <span className="text-xs font-medium text-iw-text-secondary">Chain evaluation:</span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getEvaluationStyle(evaluation)}`}
          >
            {evaluation}
          </span>
        </div>
      )}

      {/* Collapsible Arabic chain text */}
      {chainTextAr && (
        <div className="mt-4 border-t border-iw-border pt-4">
          <button
            type="button"
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center gap-1.5 text-xs font-medium text-iw-text-secondary transition-colors hover:text-iw-text"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showArabic ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
            Arabic chain text
          </button>
          {showArabic && (
            <div className="mt-3 rounded-lg bg-iw-bg/60 p-4">
              <p className="arabic-text text-sm leading-loose">{chainTextAr}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
