/**
 * Unit tests for lib/data/data-dir.ts — content corpus root resolver.
 * Covers both env-driven branches (override + subdir/default) so the path stays
 * non-constant-foldable for the Vercel/nft tracer. REF: P2 fix · D-P2-STACK-CANON.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { join } from 'path'
import { dataDir } from '@/lib/data/data-dir'

const ORIG_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIG_ENV }
})

describe('dataDir()', () => {
  it('returns CONTENT_DATA_DIR verbatim when the override is set', () => {
    process.env.CONTENT_DATA_DIR = '/mnt/content'
    expect(dataDir()).toBe('/mnt/content')
  })

  it('joins cwd with CONTENT_DATA_SUBDIR when no override is set', () => {
    delete process.env.CONTENT_DATA_DIR
    process.env.CONTENT_DATA_SUBDIR = 'corpus'
    expect(dataDir()).toBe(join(process.cwd(), 'corpus'))
  })

  it('defaults to cwd/data when neither env var is set', () => {
    delete process.env.CONTENT_DATA_DIR
    delete process.env.CONTENT_DATA_SUBDIR
    expect(dataDir()).toBe(join(process.cwd(), 'data'))
  })
})
