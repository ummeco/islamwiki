'use client'

import { getTrustLevelName, TRUST_THRESHOLDS, type TrustLevel } from '@/lib/contributor/trust'

const LEVEL_COLORS: Record<TrustLevel, string> = {
  0: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  2: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  3: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  4: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  5: 'bg-iw-accent/20 text-iw-accent border-iw-accent/30',
}

interface TrustBadgeProps {
  level: TrustLevel
  score?: number
  showScore?: boolean
  size?: 'sm' | 'md'
}

export function TrustBadge({ level, score, showScore = false, size = 'md' }: TrustBadgeProps) {
  const name = getTrustLevelName(level)
  const color = LEVEL_COLORS[level]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${color} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
      title={`Trust Level ${level}: ${name}${score !== undefined ? ` (score: ${score})` : ''}`}
    >
      <span>{name}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70">· {score}pts</span>
      )}
    </span>
  )
}

interface TrustProgressProps {
  level: TrustLevel
  score: number
}

export function TrustProgress({ level, score }: TrustProgressProps) {
  if (level >= 4) return null

  const nextLevel = (level + 1) as TrustLevel
  const currentThreshold = TRUST_THRESHOLDS[level]
  const nextThreshold = TRUST_THRESHOLDS[nextLevel]
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-iw-text-muted mb-1">
        <span>{getTrustLevelName(level)}</span>
        <span>{score} / {nextThreshold} → {getTrustLevelName(nextLevel)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-iw-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-iw-accent transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
