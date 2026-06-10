import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyTurnstileToken } from '@/lib/turnstile'

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    // Ensure clean env each test
    delete process.env.TURNSTILE_SECRET_KEY
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.TURNSTILE_SECRET_KEY
  })

  it('returns true in dev when TURNSTILE_SECRET_KEY is missing (fail-open)', async () => {
    // NODE_ENV is 'test' in vitest — same as non-production → fail-open
    const result = await verifyTurnstileToken('any-token')
    expect(result).toBe(true)
  })

  it('returns false for empty token even in dev', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    // Mock fetch to return success
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('')
    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns false for whitespace-only token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('   ')
    expect(result).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns true when Turnstile API returns success: true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('valid-token')
    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('returns false when Turnstile API returns success: false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('invalid-token')
    expect(result).toBe(false)
  })

  it('returns false when fetch returns non-ok status', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    const mockFetch = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('some-token')
    expect(result).toBe(false)
  })

  it('returns false when fetch throws (network error)', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('some-token')
    expect(result).toBe(false)
  })

  it('sends POST to Cloudflare siteverify URL', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret123'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await verifyTurnstileToken('my-token')
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('cloudflare.com/turnstile')
    expect(opts.method).toBe('POST')
  })
})
