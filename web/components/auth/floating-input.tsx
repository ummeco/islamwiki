'use client'

import { useState } from 'react'

interface FloatingInputProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  required?: boolean
  minLength?: number
  autoComplete?: string
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FloatingInput({
  name,
  label,
  type = 'text',
  required,
  minLength,
  autoComplete,
  error,
  value,
  onChange,
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={inputType}
        placeholder=" "
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={[
          'peer w-full rounded-lg border bg-iw-surface px-4 pt-5 pb-2 text-sm text-iw-text',
          'outline-none transition-colors duration-200',
          isPassword ? 'pr-11' : '',
          error
            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30'
            : 'border-iw-border focus:border-iw-accent/50 focus:ring-1 focus:ring-iw-accent/30',
        ].join(' ')}
      />
      <label
        htmlFor={name}
        className={[
          'pointer-events-none absolute left-4 top-3.5',
          'origin-[0] text-sm transition-all duration-200',
          // Float up on focus
          'peer-focus:-translate-y-3 peer-focus:scale-[0.8] peer-focus:text-iw-accent',
          // Float up when has content
          'peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-[0.8]',
          'peer-[:not(:placeholder-shown)]:text-iw-text-secondary',
          // Keep green when focused with content
          'peer-focus:peer-[:not(:placeholder-shown)]:text-iw-accent',
          error ? 'text-red-400' : 'text-iw-text-muted',
        ].join(' ')}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-iw-text-muted transition-colors hover:text-iw-text-secondary"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
