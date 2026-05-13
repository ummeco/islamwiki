import { describe, it, expect } from 'vitest'
import { getArticles, getArticleBySlug } from '@/lib/data/articles'

describe('getArticles()', () => {
  it('returns > 400 articles', () => {
    const articles = getArticles()
    expect(articles.length).toBeGreaterThan(400)
  })

  it('returns articles with required fields', () => {
    const articles = getArticles()
    const first = articles[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('slug')
    expect(first).toHaveProperty('title')
    expect(first).toHaveProperty('category')
  })

  it('all articles have categories', () => {
    const articles = getArticles()
    const noCategory = articles.filter((a) => !a.category)
    expect(noCategory.length).toBe(0)
  })
})

describe('getArticleBySlug()', () => {
  it('returns article for valid slug', () => {
    const articles = getArticles()
    const slug = articles[0].slug
    const article = getArticleBySlug(slug)
    expect(article).toBeDefined()
    expect(article?.slug).toBe(slug)
  })

  it('returns undefined for unknown slug', () => {
    expect(getArticleBySlug('not-an-article')).toBeUndefined()
  })
})
