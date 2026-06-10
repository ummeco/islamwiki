import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { slugify, extractHeadings, renderContent } from '@/lib/render-content'

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('The Cow')).toBe('the-cow')
  })

  it('strips non-alphanumeric characters', () => {
    expect(slugify("Ali's Story!")).toBe('ali-s-story')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-test-')).toBe('test')
  })

  it('collapses multiple non-alphanumeric chars', () => {
    expect(slugify('a  &  b')).toBe('a-b')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })
})

describe('extractHeadings', () => {
  it('extracts h2 headings', () => {
    const headings = extractHeadings('## Section One\nSome text')
    expect(headings).toHaveLength(1)
    expect(headings[0]).toMatchObject({ level: 2, text: 'Section One' })
  })

  it('extracts h3 headings', () => {
    const headings = extractHeadings('### Sub Section\nMore text')
    expect(headings).toHaveLength(1)
    expect(headings[0]).toMatchObject({ level: 3, text: 'Sub Section' })
  })

  it('extracts multiple headings in order', () => {
    const content = '## First\n### Second\n## Third'
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(3)
    expect(headings[0].level).toBe(2)
    expect(headings[1].level).toBe(3)
    expect(headings[2].level).toBe(2)
  })

  it('generates slugified ids', () => {
    const headings = extractHeadings('## The Cow')
    expect(headings[0].id).toBe('the-cow')
  })

  it('returns empty array for no headings', () => {
    expect(extractHeadings('Just some paragraph text.')).toHaveLength(0)
  })
})

describe('renderContent', () => {
  it('renders a paragraph', () => {
    const nodes = renderContent('Hello world')
    const { container } = render(<>{nodes}</>)
    expect(container.textContent).toContain('Hello world')
  })

  it('renders h2 heading', () => {
    const nodes = renderContent('## Section Title')
    const { container } = render(<>{nodes}</>)
    const h2 = container.querySelector('h2')
    expect(h2).not.toBeNull()
    expect(h2?.textContent).toBe('Section Title')
  })

  it('renders h3 heading', () => {
    const nodes = renderContent('### Sub Title')
    const { container } = render(<>{nodes}</>)
    const h3 = container.querySelector('h3')
    expect(h3).not.toBeNull()
    expect(h3?.textContent).toBe('Sub Title')
  })

  it('renders blockquote', () => {
    const nodes = renderContent('> Some quote')
    const { container } = render(<>{nodes}</>)
    expect(container.querySelector('blockquote')).not.toBeNull()
  })

  it('renders unordered list', () => {
    const nodes = renderContent('- Item one\n- Item two')
    const { container } = render(<>{nodes}</>)
    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(2)
  })

  it('skips blank lines', () => {
    const nodes = renderContent('\n\nHello\n\n')
    expect(nodes.length).toBeGreaterThan(0)
  })

  it('renders bold inline markdown', () => {
    const nodes = renderContent('This is **bold** text')
    const { container } = render(<>{nodes}</>)
    expect(container.querySelector('strong')).not.toBeNull()
  })

  it('renders italic inline markdown', () => {
    const nodes = renderContent('This is *italic* text')
    const { container } = render(<>{nodes}</>)
    expect(container.querySelector('em')).not.toBeNull()
  })

  it('renders inline links', () => {
    const nodes = renderContent('Click [here](https://example.com)')
    const { container } = render(<>{nodes}</>)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('https://example.com')
  })

  it('adds rel=noopener for external links', () => {
    const nodes = renderContent('[Link](https://example.com)')
    const { container } = render(<>{nodes}</>)
    const link = container.querySelector('a')
    expect(link?.getAttribute('rel')).toContain('noopener')
  })

  it('renders internal links without rel attribute', () => {
    const nodes = renderContent('[Link](/quran/1)')
    const { container } = render(<>{nodes}</>)
    const link = container.querySelector('a')
    expect(link?.getAttribute('rel')).toBeNull()
  })

  it('returns empty array for empty input', () => {
    expect(renderContent('')).toHaveLength(0)
  })
})
