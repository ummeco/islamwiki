/**
 * Simple in-memory rate limiter.
 * Tracks attempts per key with automatic expiry.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean expired entries every 5 minutes
let lastClean = Date.now()
function cleanExpired() {
  const now = Date.now()
  if (now - lastClean < 300_000) return
  lastClean = now
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key)
  }
}

/**
 * Extract client IP from request headers for rate limiting.
 */
export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')
    || 'unknown'
}

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanExpired()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs }
  }

  entry.count++

  if (entry.count > maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    }
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetIn: entry.resetAt - now,
  }
}
