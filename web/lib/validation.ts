/**
 * Shared validation functions for auth forms.
 * Used by both client (signup wizard) and server (server actions).
 */

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else errors.push('Password must be at least 8 characters.')

  if (/[A-Z]/.test(password)) score++
  else errors.push('Include at least one uppercase letter.')

  if (/[a-z]/.test(password)) score++

  if (/[0-9]/.test(password)) score++
  else errors.push('Include at least one number.')

  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (password.length >= 12) score++

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  if (score >= 5) strength = 'strong'
  else if (score >= 4) strength = 'good'
  else if (score >= 3) strength = 'fair'

  return {
    valid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
    errors,
    strength,
    score,
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateUsername(username: string): {
  valid: boolean
  error?: string
} {
  if (username.length < 3 || username.length > 30) {
    return { valid: false, error: 'Username must be 3-30 characters.' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores.',
    }
  }
  return { valid: true }
}

export function suggestUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 20)
}
