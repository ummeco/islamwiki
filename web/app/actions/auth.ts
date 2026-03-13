'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import * as authClient from '@/lib/auth-client'
import { validateEmail } from '@/lib/validation'

// ── Cookie helpers ──

function cookieMaxAge(expiresIn: number) {
  // expiresIn is in seconds from Hasura Auth
  return expiresIn
}

async function setAuthCookies(session: authClient.AuthSession) {
  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('iw_at', session.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: cookieMaxAge(session.accessTokenExpiresIn),
    path: '/',
  })

  cookieStore.set('iw_rt', session.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('iw_at')
  cookieStore.delete('iw_rt')
}

// ── Login ──

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { data, error } = await authClient.signIn(email, password)

  if (error || !data) {
    if (error?.status === 401) {
      return { error: 'Invalid email or password.' }
    }
    if (error?.status === 429) {
      return { error: 'Too many login attempts. Please try again later.' }
    }
    return { error: error?.message ?? 'Login failed. Please try again.' }
  }

  await setAuthCookies(data)

  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/'
  redirect(safeRedirect)
}

// ── Register ──

export async function register(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const displayName = formData.get('display_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!displayName || !email || !password) {
    return { error: 'All fields are required.' }
  }

  if (!validateEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { data, error } = await authClient.signUp(email, password, displayName)

  if (error || !data) {
    if (error?.status === 409) {
      return { error: 'An account with this email already exists.' }
    }
    if (error?.status === 400) {
      return { error: error.message ?? 'Invalid registration details.' }
    }
    return { error: error?.message ?? 'Registration failed. Please try again.' }
  }

  await setAuthCookies(data)
  redirect('/')
}

// ── Register via email only (alias for register, kept for call-site compat) ──

export async function registerEmail(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  return register(prevState, formData)
}

// ── Change Password ──

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('iw_at')?.value

  if (!token) {
    redirect('/account')
  }

  const redirectTo = formData.get('redirect_to') as string | null
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!newPassword || !confirmPassword) {
    return { error: 'All fields are required.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }

  const { error } = await authClient.changePassword(token, newPassword)

  if (error) {
    return { error: error.message ?? 'Failed to change password.' }
  }

  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/account'
  redirect(safeRedirect)
}

// ── Logout ──

export async function logout() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('iw_rt')?.value

  if (refreshToken) {
    // Best-effort server-side signout (invalidates refresh token)
    await authClient.signOut(refreshToken).catch(() => undefined)
  }

  await clearAuthCookies()
  redirect('/')
}

// ── Request magic link ──

export async function requestMagicLink(
  _prevState: { error?: string; sent?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string

  if (!email || !validateEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const { error } = await authClient.requestMagicLink(email)

  if (error) {
    // Don't reveal whether email exists
    return { sent: true }
  }

  return { sent: true }
}

// ── Request password reset ──

export async function requestPasswordReset(
  _prevState: { error?: string; sent?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string

  if (!email || !validateEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  // Always return success to avoid email enumeration
  await authClient.requestPasswordReset(email).catch(() => undefined)
  return { sent: true }
}
