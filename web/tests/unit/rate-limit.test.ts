import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MemoryRateLimitAdapter,
  checkRateLimit,
  getClientIp,
  getRateLimitAdapter,
  resetAdapterCache,
  GENERAL_API,
  EDIT_API,
  UPLOAD_API,
} from '@/lib/rate-limit'
import { RedisRateLimitAdapter } from '@/lib/rate-limit-redis'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let keyCounter = 0
function uk(prefix = 'test'): string {
  return `${prefix}-${++keyCounter}-${Math.random()}`
}

// ---------------------------------------------------------------------------
// MemoryRateLimitAdapter
// ---------------------------------------------------------------------------
describe('MemoryRateLimitAdapter', () => {
  let adapter: MemoryRateLimitAdapter

  beforeEach(() => {
    adapter = new MemoryRateLimitAdapter()
  })

  it('allows the first request', async () => {
    const result = await adapter.check(uk(), { limit: 5, windowMs: 60_000 })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.retryAfterSeconds).toBe(0)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('tracks count across requests in the same window', async () => {
    const key = uk()
    const opts = { limit: 3, windowMs: 60_000 }
    await adapter.check(key, opts) // 1
    await adapter.check(key, opts) // 2
    const result = await adapter.check(key, opts) // 3
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('blocks once the limit is reached', async () => {
    const key = uk()
    const opts = { limit: 2, windowMs: 60_000 }
    await adapter.check(key, opts) // 1
    await adapter.check(key, opts) // 2
    const result = await adapter.check(key, opts) // 3 — over limit
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('allows exactly limit requests, then denies', async () => {
    const key = uk()
    const opts = { limit: 5, windowMs: 60_000 }
    for (let i = 0; i < 5; i++) {
      const r = await adapter.check(key, opts)
      expect(r.allowed).toBe(true)
    }
    const denied = await adapter.check(key, opts)
    expect(denied.allowed).toBe(false)
  })

  it('resets after window expires', async () => {
    const key = uk()
    const opts = { limit: 1, windowMs: 50 }
    await adapter.check(key, opts)
    const blocked = await adapter.check(key, opts)
    expect(blocked.allowed).toBe(false)

    await new Promise<void>(resolve => setTimeout(resolve, 70))

    const reset = await adapter.check(key, opts)
    expect(reset.allowed).toBe(true)
  })

  it('uses independent windows per key', async () => {
    const opts = { limit: 1, windowMs: 60_000 }
    const a = await adapter.check(uk('a'), opts)
    const b = await adapter.check(uk('b'), opts)
    expect(a.allowed).toBe(true)
    expect(b.allowed).toBe(true)
  })

  it('sweep removes expired entries', async () => {
    const key = uk()
    await adapter.check(key, { limit: 5, windowMs: 30 })
    expect(adapter.storeSize).toBeGreaterThan(0)
    await new Promise<void>(resolve => setTimeout(resolve, 50))
    adapter._sweep()
    expect(adapter.storeSize).toBe(0)
  })

  it('retryAfterSeconds is positive and accurate', async () => {
    const key = uk()
    const opts = { limit: 1, windowMs: 5_000 }
    await adapter.check(key, opts)
    const denied = await adapter.check(key, opts)
    expect(denied.retryAfterSeconds).toBeGreaterThan(0)
    expect(denied.retryAfterSeconds).toBeLessThanOrEqual(5)
  })
})

// ---------------------------------------------------------------------------
// Factory / checkRateLimit
// ---------------------------------------------------------------------------
describe('getRateLimitAdapter / checkRateLimit (memory factory)', () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    resetAdapterCache()
  })

  afterEach(() => {
    resetAdapterCache()
  })

  it('returns a MemoryRateLimitAdapter when REDIS_URL is unset', () => {
    const adapter = getRateLimitAdapter()
    expect(adapter).toBeInstanceOf(MemoryRateLimitAdapter)
  })

  it('returns the same adapter on repeated calls (singleton)', () => {
    const a = getRateLimitAdapter()
    const b = getRateLimitAdapter()
    expect(a).toBe(b)
  })

  it('resetAdapterCache forces a new instance', () => {
    const a = getRateLimitAdapter()
    resetAdapterCache()
    const b = getRateLimitAdapter()
    expect(a).not.toBe(b)
  })

  it('checkRateLimit (opts form) resolves via factory', async () => {
    const result = await checkRateLimit(uk(), GENERAL_API)
    expect(result.allowed).toBe(true)
  })

  it('checkRateLimit (legacy 3-arg form) still works', async () => {
    // Existing routes pass (key, number, number) — must still resolve
    const result = await checkRateLimit(uk(), 60, 60_000)
    expect(result.allowed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Rate limit config constants
// ---------------------------------------------------------------------------
describe('Rate limit config constants', () => {
  it('GENERAL_API: 60 req/min', () => {
    expect(GENERAL_API.limit).toBe(60)
    expect(GENERAL_API.windowMs).toBe(60_000)
  })

  it('EDIT_API: 15 req/min', () => {
    expect(EDIT_API.limit).toBe(15)
    expect(EDIT_API.windowMs).toBe(60_000)
  })

  it('UPLOAD_API: 5 req/min', () => {
    expect(UPLOAD_API.limit).toBe(5)
    expect(UPLOAD_API.windowMs).toBe(60_000)
  })
})

// ---------------------------------------------------------------------------
// RedisRateLimitAdapter — fail-CLOSED behavior (T0-15-01)
// ---------------------------------------------------------------------------
describe('RedisRateLimitAdapter — fail-CLOSED on Redis error', () => {
  it('returns allowed=false when pipeline exec throws (ECONNREFUSED / unreachable)', async () => {
    // Build a mock Redis whose pipeline().exec() rejects — simulates unreachable Redis
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard:            vi.fn().mockReturnThis(),
      zrange:           vi.fn().mockReturnThis(),
      zadd:             vi.fn().mockReturnThis(),
      pexpire:          vi.fn().mockReturnThis(),
      exec:             vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    }
    const mockRedis = { pipeline: vi.fn().mockReturnValue(mockPipeline) }

    // Bypass the constructor's require('ioredis') by directly assigning the mock
    const adapter = Object.create(RedisRateLimitAdapter.prototype) as RedisRateLimitAdapter
    ;(adapter as unknown as { redis: unknown }).redis = mockRedis

    const result = await adapter.check('iw:rl:test', { limit: 60, windowMs: 60_000 })

    // fail-CLOSED on Redis err — prevents bypass via Redis attack
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('returns allowed=false when a pipeline command returns an error tuple', async () => {
    // Simulates a Redis command-level error ([Error, null] in the exec result)
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard:            vi.fn().mockReturnThis(),
      zrange:           vi.fn().mockReturnThis(),
      zadd:             vi.fn().mockReturnThis(),
      pexpire:          vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [new Error('READONLY'), null],  // zremrangebyscore failed
        [null, 0],
        [null, []],
      ]),
    }
    const mockRedis = { pipeline: vi.fn().mockReturnValue(mockPipeline) }

    const adapter = Object.create(RedisRateLimitAdapter.prototype) as RedisRateLimitAdapter
    ;(adapter as unknown as { redis: unknown }).redis = mockRedis

    const result = await adapter.check('iw:rl:test', { limit: 60, windowMs: 60_000 })

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------
describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' })
    expect(getClientIp(h)).toBe('1.2.3.4')
  })

  it('returns "unknown" when header is absent', () => {
    expect(getClientIp(new Headers())).toBe('unknown')
  })

  it('trims whitespace from IP', () => {
    const h = new Headers({ 'x-forwarded-for': '  5.6.7.8  ' })
    expect(getClientIp(h)).toBe('5.6.7.8')
  })

  it('falls back to x-real-ip', () => {
    const h = new Headers({ 'x-real-ip': '9.9.9.9' })
    expect(getClientIp(h)).toBe('9.9.9.9')
  })
})
