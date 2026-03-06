'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login, registerEmail, requestMagicLink, requestPasswordReset } from '@/app/actions/auth'

type Mode = 'magic-link' | 'password' | 'register' | 'forgot-password' | 'link-sent' | 'reset-sent'

const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 12.027 17.64 9.719 17.64 6.98z" fill="currentColor" opacity=".5"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="currentColor" opacity=".5"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="currentColor" opacity=".5"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="currentColor" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: (
      <svg width="13" height="16" viewBox="0 0 814 1000" fill="currentColor" opacity=".5" aria-hidden="true">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.5c-44-81.9-79.6-207.2-79.6-326.8C0 504.2 39.7 431.9 108.2 381.1c50.7-37.2 119.1-61.8 191-61.8 68.8 0 127.3 28.7 160.2 28.7 31.9 0 103.4-30.5 160.2-30.5zm-316.6-68.3c-8.3-28.6-8.3-86.7 0-115.3 50.3-18.8 111.1-60.3 143.4-129.3 10.8 5.6 97.4 49.8 97.4 162 0 24.3-3.8 48.3-10.2 71.6-28.8 0-104.1-2.3-148.8-36.6l-81.8 47.6z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity=".5" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'x',
    label: 'X',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity=".5" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.261 5.631 5.903-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
]

const inputCls = 'w-full rounded-lg border border-iw-border bg-iw-bg px-3.5 py-2.5 text-sm text-white placeholder:text-iw-text-muted focus:border-iw-accent/50 focus:outline-none transition-colors'
const submitCls = 'block w-4/5 mx-auto rounded-lg bg-iw-accent px-4 py-2.5 text-sm font-semibold text-[#0a1a05] transition-all hover:bg-iw-accent-light disabled:opacity-50'
const toggleCls = 'text-xs text-iw-text-muted transition-colors hover:text-iw-text-secondary'

export function AccountForm() {
  const [mode, setMode] = useState<Mode>('magic-link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [backHref, setBackHref] = useState('/')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    try {
      const last = localStorage.getItem('iw_last_path')
      if (last && last !== '/account') startTransition(() => setBackHref(last))
    } catch {
      // localStorage unavailable
    }
  }, [startTransition])

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setConfirmPassword('')
  }

  function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await requestMagicLink(undefined, formData)
      if (result?.error) setError(result.error)
      else if (result?.sent) switchMode('link-sent')
    })
  }

  function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await login(undefined, formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const formData = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await registerEmail(undefined, formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await requestPasswordReset(undefined, formData)
      if (result?.error) setError(result.error)
      else if (result?.sent) switchMode('reset-sent')
    })
  }

  const showTabs = mode !== 'link-sent' && mode !== 'reset-sent'
  const isPasswordTab = mode === 'password' || mode === 'forgot-password' || mode === 'register'

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-iw-border bg-iw-surface p-8 shadow-[0_0_120px_-10px_rgba(121,194,76,0.22)]">

          {/* Logo with ← back arrow */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <Link
              href={backHref}
              aria-label="Go back"
              className="ml-[-10px] flex-shrink-0 text-xl leading-none text-white/30 no-underline transition-colors hover:text-white/60"
            >
              ←
            </Link>
            <Link href={backHref} aria-label="Islam.wiki home" className="flex items-center gap-2">
              <Image src="/icon.png" alt="Islam.wiki" width={48} height={48} className="rounded" priority />
              <span className="text-lg font-bold">
                <span className="text-white">Islam</span>
                <span className="text-iw-text-muted">.</span>
                <span className="text-iw-accent">wiki</span>
              </span>
            </Link>
          </div>

          {/* Subtitle */}
          <p className="mb-5 text-center text-sm text-iw-text-muted">
            Your account will sync all settings, preferences, and history across all of your devices.
          </p>

          {/* Tabs */}
          {showTabs && (
            <div className="mb-5 flex rounded-lg border border-iw-border bg-iw-bg p-1">
              <button
                type="button"
                onClick={() => switchMode('magic-link')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === 'magic-link'
                    ? 'bg-iw-elevated text-white'
                    : 'text-iw-text-muted hover:text-iw-text-secondary'
                }`}
              >
                Login Link
              </button>
              <button
                type="button"
                onClick={() => switchMode('password')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  isPasswordTab
                    ? 'bg-iw-elevated text-white'
                    : 'text-iw-text-muted hover:text-iw-text-secondary'
                }`}
              >
                Password
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}{' '}
              {(mode === 'password' || mode === 'register') && (
                <button
                  type="button"
                  className="underline transition-colors hover:text-red-300"
                  onClick={() => switchMode('magic-link')}
                >
                  Use a login link instead.
                </button>
              )}
            </div>
          )}

          {/* ── Magic link form (default — login + auto-register) ── */}
          {mode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <p className="text-xs text-iw-text-muted">
                New here? We&rsquo;ll create your account automatically.
              </p>
              <input
                name="email"
                type="email"
                className={inputCls}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <button type="submit" className={submitCls} disabled={isPending || !email.trim()}>
                {isPending ? 'Sending…' : 'Send Login Link'}
              </button>
            </form>
          )}

          {/* ── Password form (existing accounts) ── */}
          {mode === 'password' && (
            <form onSubmit={handlePassword} className="space-y-3">
              <input
                name="email"
                type="email"
                className={inputCls}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <input
                name="password"
                type="password"
                className={inputCls}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                className={submitCls}
                disabled={isPending || !email.trim() || !password}
              >
                {isPending ? 'Logging in…' : 'Login'}
              </button>
              <div className="flex items-center justify-between">
                <button type="button" className={toggleCls} onClick={() => switchMode('register')}>
                  Create Account
                </button>
                <button type="button" className={toggleCls} onClick={() => switchMode('forgot-password')}>
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* ── Register form ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                name="display_name"
                type="text"
                className={inputCls}
                placeholder="Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                autoFocus
              />
              <input
                name="email"
                type="email"
                className={inputCls}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                name="password"
                type="password"
                className={inputCls}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <input
                name="confirm_password"
                type="password"
                className={inputCls}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="submit"
                className={submitCls}
                disabled={isPending || !email.trim() || !password || !confirmPassword}
              >
                {isPending ? 'Creating account…' : 'Create Account'}
              </button>
              <button
                type="button"
                className={`block w-full text-center ${toggleCls}`}
                onClick={() => switchMode('password')}
              >
                Already have an account? Login
              </button>
            </form>
          )}

          {/* ── Forgot password form ── */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-xs text-iw-text-muted">
                Enter your email and we&rsquo;ll send you a reset link.
              </p>
              <input
                name="email"
                type="email"
                className={inputCls}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <button type="submit" className={submitCls} disabled={isPending || !email.trim()}>
                {isPending ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className={`block w-full text-center ${toggleCls}`}
                onClick={() => switchMode('password')}
              >
                Back to login
              </button>
            </form>
          )}

          {/* ── Link sent confirmation ── */}
          {mode === 'link-sent' && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-iw-accent/10 text-iw-accent">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-bold text-white">Check your inbox</h2>
              <p className="mb-6 text-sm text-iw-text-muted">
                We sent a login link to <strong className="text-white">{email}</strong>. It expires in 15 minutes.
              </p>
              <button
                type="button"
                onClick={() => switchMode('magic-link')}
                className="text-sm text-iw-accent transition-colors hover:text-iw-accent-light"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* ── Reset sent confirmation ── */}
          {mode === 'reset-sent' && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-iw-accent/10 text-iw-accent">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-bold text-white">Reset link sent</h2>
              <p className="mb-6 text-sm text-iw-text-muted">
                Check <strong className="text-white">{email}</strong> for a password reset link.
              </p>
              <button
                type="button"
                onClick={() => switchMode('password')}
                className="text-sm text-iw-accent transition-colors hover:text-iw-accent-light"
              >
                Back to login
              </button>
            </div>
          )}

          {/* ── Social row ── */}
          {showTabs && (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-iw-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-iw-surface px-3 text-xs text-iw-text-muted/50">or</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SOCIAL_PROVIDERS.map(({ id, label, icon }) => {
                  const isEnabled = id === 'google'
                  if (isEnabled) {
                    return (
                      <a
                        key={id}
                        href={`/api/auth/oauth/${id}`}
                        aria-label={`Sign in with ${label}`}
                        className="flex flex-col items-center gap-1 rounded-lg border border-iw-border bg-iw-bg px-2 py-2.5 text-iw-text-muted transition-all hover:border-iw-accent/40 hover:text-white"
                      >
                        {icon}
                        <span className="text-[10px]">{label}</span>
                      </a>
                    )
                  }
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled
                      title={`${label} — coming soon`}
                      aria-label={`${label} — coming soon`}
                      className="flex flex-col items-center gap-1 rounded-lg border border-iw-border bg-iw-bg px-2 py-2.5 text-iw-text-muted opacity-40 transition-opacity"
                    >
                      {icon}
                      <span className="text-[10px]">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-iw-text-muted/60">
            Islam.wiki is a part of the Ummat ecosystem, your account works across{' '}
            <a
              href="https://ummat.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-iw-text-muted/80 underline transition-colors hover:text-iw-text-muted"
            >
              all of our apps
            </a>
            .
          </p>

        </div>
      </div>
    </div>
  )
}
