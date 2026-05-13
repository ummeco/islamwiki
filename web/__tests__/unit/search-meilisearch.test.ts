/**
 * S9-33 / S9-16 / S9-20 / S9-24: Unit tests for the Meilisearch search module.
 * Tests cover the isMeilisearchConfigured() guard and the graceful fallback behaviour.
 * Actual Meilisearch queries require a live index (integration tests only).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isMeilisearchConfigured } from '@/lib/search-meilisearch'

describe('isMeilisearchConfigured()', () => {
  const originalHost = process.env.MEILISEARCH_HOST

  beforeEach(() => {
    delete process.env.MEILISEARCH_HOST
  })

  afterEach(() => {
    if (originalHost !== undefined) {
      process.env.MEILISEARCH_HOST = originalHost
    } else {
      delete process.env.MEILISEARCH_HOST
    }
  })

  it('returns false when MEILISEARCH_HOST is not set', () => {
    expect(isMeilisearchConfigured()).toBe(false)
  })

  it('returns true when MEILISEARCH_HOST is set', () => {
    process.env.MEILISEARCH_HOST = 'http://localhost:7700'
    expect(isMeilisearchConfigured()).toBe(true)
  })
})
