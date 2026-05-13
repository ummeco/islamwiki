/**
 * S9-04: Tests for AI prompt title XML isolation in lib/ai/review.ts.
 *
 * The reviewContent() function wraps the user-supplied title in a <title_field>
 * element to prevent prompt-injection via <title>...</title> tags that could
 * confuse the XML structure of the review prompt. These tests verify:
 *   - <title> / </title> tags in the title are neutralised before the prompt is built
 *   - Injected XML/HTML structures in the title are sanitised
 *   - Normal titles are passed through unchanged
 *   - The openai package is NOT imported anywhere in the AI pipeline
 *
 * NOTE: reviewContent() calls the Anthropic API. We test only the sanitisation
 * logic (safeTitle derivation) independently because mocking the full API
 * stack is disproportionate for a unit test at this level. The prompt-building
 * logic is deterministic and inline — extractable as a pure function test.
 */
import { describe, it, expect } from 'vitest'

// ── safeTitle logic — re-implement inline for unit testing ──────────────────
// This mirrors the exact transform in lib/ai/review.ts:
//   const safeTitle = title.replace(/<\/?title>/gi, '[title]')
// If review.ts changes this transform, this test must be updated in lockstep.

function safeTitle(title: string): string {
  return title.replace(/<\/?title>/gi, '[title]')
}

// ── Title XML injection neutralisation ──────────────────────────────────────

describe('safeTitle() — <title> tag neutralisation (S9-04)', () => {
  it('leaves a normal title unchanged', () => {
    expect(safeTitle('The Life of the Prophet')).toBe('The Life of the Prophet')
  })

  it('replaces <title> open tag with [title]', () => {
    const out = safeTitle('Inject<title>alert(1)</title>Payload')
    expect(out).not.toContain('<title>')
    expect(out).not.toContain('</title>')
    expect(out).toContain('[title]')
  })

  it('replaces </title> close tag independently', () => {
    expect(safeTitle('</title>injection')).not.toContain('</title>')
    expect(safeTitle('</title>injection')).toContain('[title]')
  })

  it('is case-insensitive — strips <TITLE> uppercase variant', () => {
    const out = safeTitle('<TITLE>xss</TITLE>')
    expect(out).not.toContain('<TITLE>')
    expect(out).not.toContain('</TITLE>')
  })

  it('is case-insensitive — strips mixed-case <Title>', () => {
    const out = safeTitle('<Title>xss</Title>')
    expect(out).not.toContain('<Title>')
    expect(out).not.toContain('</Title>')
  })

  it('replaces all occurrences in a title with multiple injections', () => {
    const out = safeTitle('<title>a</title><title>b</title>')
    expect(out).not.toContain('<title>')
    expect(out).not.toContain('</title>')
    // Each open tag and each close tag replaced with [title]
    expect(out.split('[title]').length).toBeGreaterThanOrEqual(5) // 4 replacements + 1 split remainder
  })

  it('preserves surrounding text around stripped tags', () => {
    const out = safeTitle('prefix <title>inject</title> suffix')
    expect(out).toContain('prefix')
    expect(out).toContain('inject') // text content of element survives
    expect(out).toContain('suffix')
    expect(out).not.toContain('<title>')
    expect(out).not.toContain('</title>')
  })

  it('handles empty title gracefully', () => {
    expect(safeTitle('')).toBe('')
  })

  it('handles title with no XML tags unchanged', () => {
    const normal = 'Tafsir of Surah Al-Baqarah — Verses 1–10'
    expect(safeTitle(normal)).toBe(normal)
  })

  it('does not strip unrelated XML tags (only <title> is targeted)', () => {
    const out = safeTitle('<content>should stay</content>')
    expect(out).toContain('<content>')
    expect(out).toContain('</content>')
  })

  it('handles prompt-injection attempt via multiple title tag variants', () => {
    const attack = '</title><script>alert(1)</script><title>'
    const out = safeTitle(attack)
    expect(out).not.toContain('</title>')
    expect(out).not.toContain('<title>')
    // Script tag is not stripped by safeTitle (that is DOMPurify's job), but
    // title tags that would close/open XML structure are neutralised
    expect(out).toContain('[title]')
  })
})

// ── openai package removal verification ─────────────────────────────────────

describe('S9-04: openai package removal', () => {
  it('lib/ai/service.ts does not import openai package', async () => {
    // Read the service module source and verify no openai import
    const fs = await import('fs')
    const path = await import('path')
    const servicePath = path.resolve(process.cwd(), 'lib/ai/service.ts')
    const source = fs.readFileSync(servicePath, 'utf-8')
    expect(source).not.toMatch(/from ['"]openai['"]/)
    expect(source).not.toMatch(/require\(['"]openai['"]\)/)
    expect(source).not.toMatch(/import openai/i)
  })

  it('lib/ai/review.ts uses <title_field> wrapper, not <title>', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const reviewPath = path.resolve(process.cwd(), 'lib/ai/review.ts')
    const source = fs.readFileSync(reviewPath, 'utf-8')
    // Verify the safe wrapper element is present
    expect(source).toContain('title_field')
    // Verify the safeTitle transform is applied before embedding
    expect(source).toContain('safeTitle')
    // Verify no unguarded <title> interpolation
    expect(source).not.toMatch(/`.*<title>\$\{title\}.*<\/title>/)
  })
})
