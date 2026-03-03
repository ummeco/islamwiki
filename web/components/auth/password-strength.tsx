'use client'

import { validatePassword } from '@/lib/validation'

interface PasswordStrengthProps {
  password: string
}

const COLORS = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-iw-accent',
}

const LABELS = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
}

const SEGMENTS = {
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const { strength } = validatePassword(password)
  const filled = SEGMENTS[strength]

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= filled ? COLORS[strength] : 'bg-iw-border',
            ].join(' ')}
          />
        ))}
      </div>
      <p
        className={[
          'mt-1 text-xs transition-colors duration-300',
          strength === 'weak'
            ? 'text-red-400'
            : strength === 'fair'
              ? 'text-orange-400'
              : strength === 'good'
                ? 'text-yellow-400'
                : 'text-iw-accent',
        ].join(' ')}
      >
        {LABELS[strength]}
      </p>
    </div>
  )
}
