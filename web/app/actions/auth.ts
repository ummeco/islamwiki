'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import {
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
} from '@/lib/data/users'
import { checkRateLimit } from '@/lib/rate-limit'
import { validatePassword, validateEmail, validateUsername } from '@/lib/validation'

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

  // Rate limiting by email
  const rateLimitKey = `login:${email.toLowerCase()}`
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)
  if (!rateCheck.allowed) {
    const minutes = Math.ceil(rateCheck.resetIn / 60000)
    return { error: `Too many login attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` }
  }

  const user = getUserByEmail(email)
  if (!user) {
    return { error: 'Invalid email or password.' }
  }

  if (user.banned) {
    return { error: 'This account has been suspended.' }
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return { error: 'Invalid email or password.' }
  }

  // Set session
  const session = await getSession()
  session.userId = user.id
  session.username = user.username
  session.email = user.email
  session.displayName = user.display_name
  session.role = user.role
  session.trustLevel = user.trust_level
  session.mustChangePassword = user.must_change_password
  session.isLoggedIn = true
  await session.save()

  // Redirect to password change if flagged
  if (user.must_change_password) {
    redirect('/auth/change-password')
  }

  redirect(redirectTo || '/')
}

// ── Register (multi-step wizard) ──

export async function register(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const displayName = formData.get('display_name') as string
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const kunya = formData.get('kunya') as string | null

  // Validate required fields
  if (!displayName || !username || !email || !password) {
    return { error: 'All fields are required.' }
  }

  // Validate email
  if (!validateEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  // Validate password strength
  const pwResult = validatePassword(password)
  if (!pwResult.valid) {
    return { error: pwResult.errors[0] }
  }

  // Confirm password match
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  // Validate username
  const usernameResult = validateUsername(username)
  if (!usernameResult.valid) {
    return { error: usernameResult.error }
  }

  // Check uniqueness
  if (getUserByEmail(email)) {
    return { error: 'An account with this email already exists.' }
  }

  if (getUserByUsername(username)) {
    return { error: 'This username is already taken.' }
  }

  // Check OAuth verifications from session
  const session = await getSession()
  const verifications = session.oauthVerifications || []

  if (verifications.length < 2) {
    return { error: 'Please verify your identity by connecting at least 2 accounts.' }
  }

  // Create user
  const passwordHash = await bcrypt.hash(password, 12)
  const oauthProviders = verifications.map((v) => ({
    provider: v.provider,
    provider_id: v.provider_id,
    email: v.email,
    connected_at: new Date().toISOString(),
  }))

  const user = createUser({
    email,
    username,
    display_name: displayName,
    password_hash: passwordHash,
    kunya: kunya || undefined,
    oauth_providers: oauthProviders,
    verified: true,
  })

  // Set session (auto-login)
  session.userId = user.id
  session.username = user.username
  session.email = user.email
  session.displayName = user.display_name
  session.role = user.role
  session.trustLevel = user.trust_level
  session.isLoggedIn = true
  // Clear OAuth temp fields
  session.oauthState = undefined
  session.oauthPKCE = undefined
  session.oauthVerifications = undefined
  await session.save()

  redirect('/')
}

// ── Change Password ──

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect('/signin')
  }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' }
  }

  // Validate password strength
  const pwResult = validatePassword(newPassword)
  if (!pwResult.valid) {
    return { error: pwResult.errors[0] }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }

  const user = getUserByEmail(session.email)
  if (!user) {
    return { error: 'User not found.' }
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash)
  if (!valid) {
    return { error: 'Current password is incorrect.' }
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  updateUser(user.id, {
    password_hash: newHash,
    must_change_password: false,
  })

  // Update session
  session.mustChangePassword = false
  await session.save()

  redirect('/')
}

// ── Logout ──

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect('/')
}
