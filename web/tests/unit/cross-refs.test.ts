/**
 * S9-33 / S9-15 / S9-27: Unit tests for cross-ref helper utilities.
 * These tests cover the pure utility functions — Hasura queries are not called
 * (they require a live DB connection and are integration-tested separately).
 */

import { describe, it, expect } from 'vitest'
import { ayahSourceId } from '@/lib/cross-refs/quran-hadith'

describe('ayahSourceId()', () => {
  it('formats surah:ayah correctly', () => {
    expect(ayahSourceId(2, 43)).toBe('2:43')
    expect(ayahSourceId(1, 1)).toBe('1:1')
    expect(ayahSourceId(114, 6)).toBe('114:6')
  })

  it('handles large surah and ayah numbers', () => {
    expect(ayahSourceId(2, 286)).toBe('2:286')
  })
})
