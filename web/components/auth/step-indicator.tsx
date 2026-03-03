'use client'

const STEPS = ['Account', 'Profile', 'Verification']

interface StepIndicatorProps {
  current: number // 1-based
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const step = i + 1
        const isComplete = step < current
        const isCurrent = step === current

        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={[
                  'h-px w-8 transition-colors duration-300',
                  step <= current ? 'bg-iw-accent/50' : 'bg-iw-border',
                ].join(' ')}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  isComplete
                    ? 'bg-iw-accent text-iw-bg'
                    : isCurrent
                      ? 'border-2 border-iw-accent bg-iw-accent/10 text-iw-accent'
                      : 'border border-iw-border text-iw-text-muted',
                ].join(' ')}
              >
                {isComplete ? (
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={[
                  'hidden text-xs font-medium sm:inline',
                  isCurrent ? 'text-iw-accent' : isComplete ? 'text-iw-text-secondary' : 'text-iw-text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
