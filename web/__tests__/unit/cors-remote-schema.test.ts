/**
 * T0-08-04: CORS headers on /api/graphql Remote Schema endpoint — Islam.wiki
 *
 * Verifies OPTIONS preflight returns correct per-app origin allowlist.
 * No wildcard, no admin-secret in allowed headers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { OPTIONS } from '@/src/pages/api/graphql'

// Web-standard Request replaces next/server's NextRequest (next removed in P2).
// The Astro API handler receives the request via the APIContext object ({ request }).
function makeOptions(origin: string) {
  const request = new Request('http://localhost/api/graphql', {
    method: 'OPTIONS',
    headers: { Origin: origin },
  })
  // Minimal Astro APIContext stub — the OPTIONS handler only reads `request`.
  return { request } as Parameters<typeof OPTIONS>[0]
}

describe('OPTIONS /api/graphql — CORS preflight (Islam.wiki)', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('REMOTE_SCHEMA_SECRET', 'test-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 204 with correct origin for prod Hasura (api.ummat.dev)', async () => {
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://api.ummat.dev')
  })

  it('returns 204 with correct origin for local dev (api.islamwiki.local.nself.org:8543)', async () => {
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://api.islamwiki.local.nself.org:8543'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://api.islamwiki.local.nself.org:8543'
    )
  })

  it('returns no ACAO header for unknown origin', async () => {
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://evil.example.com'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('returns no ACAO header for browser (islam.wiki app origin)', async () => {
    // RS endpoint is Hasura-to-Next — not called from the browser
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://islam.wiki'))
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('allowed headers do NOT include x-hasura-admin-secret', async () => {
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    const headers = res.headers.get('Access-Control-Allow-Headers') ?? ''
    expect(headers.toLowerCase()).not.toContain('admin-secret')
    expect(headers.toLowerCase()).toContain('x-remote-schema-secret')
  })

  it('allowed methods are POST and OPTIONS only', async () => {
    const { OPTIONS } = await import('@/src/pages/api/graphql')
    const res = await OPTIONS(makeOptions('https://api.ummat.dev'))
    const methods = res.headers.get('Access-Control-Allow-Methods') ?? ''
    expect(methods).toContain('POST')
    expect(methods).toContain('OPTIONS')
    expect(methods.toUpperCase()).not.toContain('DELETE')
    expect(methods.toUpperCase()).not.toContain('PUT')
  })
})
