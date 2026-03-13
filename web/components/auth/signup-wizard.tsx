'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { FloatingInput } from './floating-input'
import { PasswordStrength } from './password-strength'
import { OAuthButton } from './oauth-button'
import { StepIndicator } from './step-indicator'
import { register } from '@/app/actions/auth'
import { validatePassword, validateEmail, validateUsername, suggestUsername } from '@/lib/validation'

interface WizardState {
  step: 1 | 2 | 3
  email: string
  password: string
  confirmPassword: string
  fullName: string
  kunya: string
  username: string
  verifiedProviders: string[]
}

const STORAGE_KEY = 'iw_signup_wizard'

function loadSavedState(): Partial<WizardState> | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

function saveState(state: WizardState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function clearSavedState() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function SignupWizard() {
  const searchParams = useSearchParams()
  const [registerState, registerAction, registerPending] = useActionState(register, undefined)

  const [wizard, setWizard] = useState<WizardState>(() => {
    const saved = loadSavedState()
    return {
      step: 1,
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      kunya: '',
      username: '',
      verifiedProviders: [],
      ...saved,
    }
  })
  const [error, setError] = useState('')
  const [showKunyaInfo, setShowKunyaInfo] = useState(false)

  // Check for OAuth callback
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified) {
      // Fetch current verification status from session
      fetch('/api/auth/oauth/status')
        .then((r) => r.json())
        .then((data) => {
          if (data.verifications && Array.isArray(data.verifications)) {
            const providers = data.verifications.map((v: { provider: string }) => v.provider)
            setWizard((prev) => ({
              ...prev,
              step: 3,
              verifiedProviders: [...new Set<string>(providers)],
            }))
          }
        })
        .catch(() => { /* ignore */ })
    }
  }, [searchParams])

  // Save state on changes
  useEffect(() => {
    saveState(wizard)
  }, [wizard])

  const updateField = useCallback((field: keyof WizardState, value: string) => {
    setWizard((prev) => ({ ...prev, [field]: value }))
    setError('')
  }, [])

  function nextStep() {
    setError('')

    if (wizard.step === 1) {
      if (!validateEmail(wizard.email)) {
        setError('Please enter a valid email address.')
        return
      }
      const pwResult = validatePassword(wizard.password)
      if (!pwResult.valid) {
        setError(pwResult.errors[0])
        return
      }
      if (wizard.password !== wizard.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      setWizard((prev) => ({ ...prev, step: 2 }))
    } else if (wizard.step === 2) {
      if (!wizard.fullName.trim()) {
        setError('Full name is required.')
        return
      }
      const usernameToCheck = wizard.username || suggestUsername(wizard.fullName)
      const usernameResult = validateUsername(usernameToCheck)
      if (!usernameResult.valid) {
        setError(usernameResult.error!)
        return
      }
      if (!wizard.username) {
        setWizard((prev) => ({ ...prev, username: usernameToCheck }))
      }
      setWizard((prev) => ({ ...prev, step: 3 }))
    }
  }

  function prevStep() {
    setError('')
    setWizard((prev) => ({
      ...prev,
      step: (prev.step - 1) as 1 | 2 | 3,
    }))
  }

  function connectOAuth(provider: string) {
    // Save state before navigating away
    saveState(wizard)
    // Navigate to OAuth initiation
    window.location.assign(`/api/auth/oauth/${provider}`)
  }

  function handleCreateAccount() {
    setError('')
    // Build FormData and submit via server action
    const formData = new FormData()
    formData.set('email', wizard.email)
    formData.set('password', wizard.password)
    formData.set('confirm_password', wizard.confirmPassword)
    formData.set('display_name', wizard.fullName)
    formData.set('kunya', wizard.kunya)
    formData.set('username', wizard.username || suggestUsername(wizard.fullName))
    // Clear saved state since we're submitting
    clearSavedState()
    registerAction(formData)
  }

  const canCreateAccount = wizard.verifiedProviders.length >= 1

  // Show server action errors
  const displayError = error || registerState?.error || ''

  return (
    <div>
      <StepIndicator current={wizard.step} />

      {displayError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {displayError}
        </div>
      )}

      {/* Step 1: Account */}
      {wizard.step === 1 && (
        <div className="space-y-4">
          <FloatingInput
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={wizard.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <div>
            <FloatingInput
              name="password"
              label="Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={wizard.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
            <PasswordStrength password={wizard.password} />
          </div>
          <FloatingInput
            name="confirm_password"
            label="Confirm Password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={wizard.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
          />
          <button
            type="button"
            onClick={nextStep}
            className="w-full rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Profile */}
      {wizard.step === 2 && (
        <div className="space-y-4">
          <FloatingInput
            name="display_name"
            label="Full Name"
            type="text"
            required
            autoComplete="name"
            value={wizard.fullName}
            onChange={(e) => {
              updateField('fullName', e.target.value)
              // Auto-suggest username if empty
              if (!wizard.username) {
                setWizard((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                  username: suggestUsername(e.target.value),
                }))
                return
              }
              updateField('fullName', e.target.value)
            }}
          />

          {/* Kunya with info tooltip */}
          <div className="relative">
            <FloatingInput
              name="kunya"
              label="Kunya (optional)"
              type="text"
              value={wizard.kunya}
              onChange={(e) => updateField('kunya', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowKunyaInfo(!showKunyaInfo)}
              className="absolute right-3 top-3.5 rounded-full text-iw-text-muted transition-colors hover:text-iw-text-secondary"
              aria-label="What is a kunya?"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showKunyaInfo && (
              <div className="mt-2 rounded-lg bg-iw-bg/80 p-3 text-xs text-iw-text-muted">
                A kunya is an honorific used in Islamic culture, typically beginning with
                &ldquo;Abu&rdquo; (father of) or &ldquo;Umm&rdquo; (mother of).
                Example: Abu Ahmad, Umm Khadijah.
              </div>
            )}
          </div>

          <FloatingInput
            name="username"
            label="Username"
            type="text"
            required
            autoComplete="username"
            value={wizard.username}
            onChange={(e) => updateField('username', e.target.value)}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 rounded-lg border border-iw-border px-4 py-3 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verification */}
      {wizard.step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-iw-bg/60 p-4">
            <h3 className="text-sm font-semibold text-white">Verify Your Identity</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-iw-text-muted">
              Islam.wiki uses an advanced verification system to prevent bots and
              malicious users from editing content. Please connect at least
              <span className="font-semibold text-iw-accent"> two accounts </span>
              to verify you are a real person.
            </p>
          </div>

          <div className="space-y-2">
            {(['google', 'facebook', 'x', 'github'] as const).map((provider) => (
              <OAuthButton
                key={provider}
                provider={provider}
                connected={wizard.verifiedProviders.includes(provider)}
                onConnect={() => connectOAuth(provider)}
              />
            ))}
          </div>

          <div className="text-center text-xs text-iw-text-muted">
            {wizard.verifiedProviders.length === 0 && 'Connect at least 1 account to continue'}
            {wizard.verifiedProviders.length >= 1 && (
              <span className="text-iw-accent">
                {wizard.verifiedProviders.length} account{wizard.verifiedProviders.length > 1 ? 's' : ''} connected. Ready to create your account.
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 rounded-lg border border-iw-border px-4 py-3 text-sm font-medium text-iw-text-secondary transition-colors hover:border-iw-text-muted hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={!canCreateAccount || registerPending}
              className="flex-1 rounded-lg bg-iw-accent px-4 py-3 text-sm font-semibold text-iw-bg transition-colors hover:bg-iw-accent-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {registerPending ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
