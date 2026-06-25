/**
 * Islam.wiki — Rate Limiter: Adapter Interface + Factory
 *
 * CANONICAL SOURCE: ummat/packages/shared/src/security/rate-limit.ts
 * This file is a standalone-repo copy. Do NOT edit the logic here —
 * update the canonical source and sync here (T-P7-W1.5-10).
 *
 * TRAP-M02: Fail-closed in production. REDIS_URL is required.
 * Previous version silently fell back to MemoryRateLimitAdapter in prod.
 *
 * Limits (per spec):
 *   /api/*       (general): 60 req/min per IP
 *   /api/edit:              15 req/min per authenticated user
 *   /api/upload:             5 req/min per authenticated user
 *
 * Algorithm: sliding window (fixed window for memory adapter, true sliding for Redis).
 */

import { MemoryRateLimitAdapter } from './rate-limit-memory'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

/** Adapter interface — memory and Redis adapters both implement this. */
export interface RateLimitAdapter {
  check(key: string, opts: RateLimitOptions): Promise<RateLimitResult>
}

// Re-export so tests can instanceof-check without importing from the memory module
export { MemoryRateLimitAdapter }

// ---------------------------------------------------------------------------
// Factory — picks adapter based on environment
// ---------------------------------------------------------------------------

let _adapter: RateLimitAdapter | null = null

export function getRateLimitAdapter(): RateLimitAdapter {
  if (_adapter) return _adapter

  if (process.env.REDIS_URL) {
    try {
      // ioredis is an optional dep — loaded only when REDIS_URL is present
      const { RedisRateLimitAdapter } = require('./rate-limit-redis')
      _adapter = new RedisRateLimitAdapter(process.env.REDIS_URL)
    } catch {
      console.warn('[rate-limit] REDIS_URL set but ioredis unavailable — falling back to in-memory adapter')
      _adapter = new MemoryRateLimitAdapter()
    }
  } else {
    // TRAP-M02: fail closed in production — in-memory bypass on Vercel
    // multi-instance is a security hole (state is not shared across instances).
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[rate-limit] REDIS_URL required in production. Set REDIS_URL to enable rate limiting.')
    }
    console.warn('[rate-limit] REDIS_URL not set — using in-memory adapter (not safe for multi-instance)')
    _adapter = new MemoryRateLimitAdapter()
  }

  return _adapter!
}

/** Reset the cached adapter (used in tests). */
export function resetAdapterCache(): void {
  _adapter = null
}

// ---------------------------------------------------------------------------
// Convenience wrapper — used by middleware and route handlers
// ---------------------------------------------------------------------------

/** Async adapter-backed rate check. Pass a RateLimitOptions object. */
export async function checkRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult>
/** Legacy 3-arg call: (key, maxAttempts, windowMs). */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>
/** @internal implementation */
export async function checkRateLimit(key: string, optsOrMax: RateLimitOptions | number, windowMs?: number): Promise<RateLimitResult> {
  if (typeof optsOrMax === 'number') {
    // Legacy 3-arg call — route through legacy sync store for backward compat
    const limit = optsOrMax
    const ms = windowMs ?? 60_000
    return getRateLimitAdapter().check(key, { limit, windowMs: ms })
  }
  return getRateLimitAdapter().check(key, optsOrMax)
}

// ---------------------------------------------------------------------------
// Standard limit configs (per spec)
// ---------------------------------------------------------------------------

/** /api/* general: 60 req/min per IP */
export const GENERAL_API: RateLimitOptions = { limit: 60, windowMs: 60_000 }

/** /api/edit: 15 req/min per authenticated user */
export const EDIT_API: RateLimitOptions = { limit: 15, windowMs: 60_000 }

/** /api/upload: 5 req/min per authenticated user */
export const UPLOAD_API: RateLimitOptions = { limit: 5, windowMs: 60_000 }

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Build a standard 429 Response from a blocked RateLimitResult. */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response('Too many requests. Please try again later.', {
    status: 429,
    headers: {
      'Retry-After': String(result.retryAfterSeconds),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    },
  })
}
