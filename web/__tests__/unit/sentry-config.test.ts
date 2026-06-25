/**
 * S9-05: Tests for Sentry integration via @sentry/astro (astro.config.mjs).
 *
 * Post Next->Astro migration (D-P2-STACK-CANON), Sentry is wired through the
 * @sentry/astro integration in astro.config.mjs. Source-map upload is governed
 * by sourceMapsUploadOptions.authToken (only uploads when SENTRY_AUTH_TOKEN set).
 *
 * These tests verify the structural requirements:
 *   - astro.config.mjs registers the @sentry/astro integration
 *   - Sentry options carry dsn, org, and project
 *   - .env.example documents SENTRY_AUTH_TOKEN, SENTRY_DSN, SENTRY_ORG,
 *     SENTRY_PROJECT
 *   - sentry.client.config.ts / sentry.server.config.ts exist and init Sentry
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

// ── astro.config.mjs — @sentry/astro integration ─────────────────────────────

describe('astro.config.mjs — Sentry integration (S9-05)', () => {
  it('imports the @sentry/astro integration', () => {
    const src = readFile('astro.config.mjs')
    expect(src).toContain('@sentry/astro')
  })

  it('registers the sentry() integration', () => {
    const src = readFile('astro.config.mjs')
    expect(src).toMatch(/sentry\s*\(/)
  })

  it('includes dsn, org and project fields in Sentry options', () => {
    const src = readFile('astro.config.mjs')
    expect(src).toContain('dsn:')
    expect(src).toContain('org:')
    expect(src).toContain('project:')
  })

  it('gates source-map upload on SENTRY_AUTH_TOKEN', () => {
    const src = readFile('astro.config.mjs')
    // @sentry/astro only uploads source maps when authToken is provided.
    expect(src).toContain('sourceMapsUploadOptions')
    expect(src).toContain('SENTRY_AUTH_TOKEN')
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
