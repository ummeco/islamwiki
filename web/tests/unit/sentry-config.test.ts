/**
 * S9-05: Tests for Sentry Next.js integration (next.config.ts).
 *
 * next.config.ts wraps the Next.js config with withSentryConfig() and
 * conditionally enables source-map upload only when SENTRY_AUTH_TOKEN is set.
 *
 * These tests verify the structural requirements:
 *   - next.config.ts re-exports a Sentry-wrapped config (not the raw config)
 *   - .env.example documents SENTRY_AUTH_TOKEN, SENTRY_DSN, SENTRY_ORG,
 *     SENTRY_PROJECT
 *   - sentry.client.config.ts / sentry.server.config.ts exist (required by
 *     @sentry/nextjs instrumentation)
 *   - Source-map upload is conditional on SENTRY_AUTH_TOKEN presence
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd() // islamwiki/web/

function readFile(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8')
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel))
}

// ── next.config.ts — withSentryConfig wrapper ────────────────────────────────

describe('next.config.ts — Sentry wrapper (S9-05)', () => {
  it('imports withSentryConfig from @sentry/nextjs', () => {
    const src = readFile('next.config.ts')
    expect(src).toContain('withSentryConfig')
    expect(src).toContain('@sentry/nextjs')
  })

  it('wraps the config with withSentryConfig() as default export', () => {
    const src = readFile('next.config.ts')
    // The default export must be the result of withSentryConfig(...)
    expect(src).toMatch(/export default withSentryConfig\s*\(/)
  })

  it('includes org and project fields in Sentry options', () => {
    const src = readFile('next.config.ts')
    expect(src).toContain('org:')
    expect(src).toContain('project:')
  })

  it('conditionally disables source-map upload without SENTRY_AUTH_TOKEN', () => {
    const src = readFile('next.config.ts')
    // The conditional logic must reference SENTRY_AUTH_TOKEN
    expect(src).toContain('SENTRY_AUTH_TOKEN')
    // Source maps must be disabled when the token is absent
    expect(src).toContain('disable: true')
  })

  it('deletes source maps after upload (hideSourceMaps equivalent)', () => {
    const src = readFile('next.config.ts')
    expect(src).toContain('deleteSourcemapsAfterUpload')
  })
})

// ── .env.example — Sentry env var documentation ─────────────────────────────

describe('.env.example — Sentry env vars (S9-05)', () => {
  it('documents SENTRY_AUTH_TOKEN', () => {
    const src = readFile('.env.example')
    expect(src).toContain('SENTRY_AUTH_TOKEN')
  })

  it('documents NEXT_PUBLIC_SENTRY_DSN or SENTRY_DSN', () => {
    const src = readFile('.env.example')
    expect(src).toMatch(/SENTRY_DSN/)
  })

  it('documents SENTRY_ORG', () => {
    const src = readFile('.env.example')
    expect(src).toContain('SENTRY_ORG')
  })

  it('documents SENTRY_PROJECT', () => {
    const src = readFile('.env.example')
    expect(src).toContain('SENTRY_PROJECT')
  })
})

// ── Sentry instrumentation files ─────────────────────────────────────────────

describe('Sentry instrumentation files (S9-05)', () => {
  it('sentry.client.config.ts exists', () => {
    expect(
      fileExists('sentry.client.config.ts') || fileExists('sentry.client.config.js')
    ).toBe(true)
  })

  it('sentry.server.config.ts exists', () => {
    expect(
      fileExists('sentry.server.config.ts') || fileExists('sentry.server.config.js')
    ).toBe(true)
  })

  it('sentry.client.config.ts initialises Sentry', () => {
    const clientConfig =
      fileExists('sentry.client.config.ts')
        ? readFile('sentry.client.config.ts')
        : fileExists('sentry.client.config.js')
        ? readFile('sentry.client.config.js')
        : null
    expect(clientConfig).not.toBeNull()
    expect(clientConfig).toContain('Sentry.init')
  })

  it('sentry.server.config.ts initialises Sentry', () => {
    const serverConfig =
      fileExists('sentry.server.config.ts')
        ? readFile('sentry.server.config.ts')
        : fileExists('sentry.server.config.js')
        ? readFile('sentry.server.config.js')
        : null
    expect(serverConfig).not.toBeNull()
    expect(serverConfig).toContain('Sentry.init')
  })
})
