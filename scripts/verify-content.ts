/**
 * verify-content.ts
 *
 * Scans all articles, book chapters, and wiki pages for minimum word count.
 * Outputs a gap report showing content that needs filling.
 *
 * Usage: npx tsx scripts/verify-content.ts [--min-words 300] [--format json|text]
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data')

interface Article {
  slug: string
  title: string
  category?: string
  content?: string
  content_id?: string
}

interface BookChapter {
  slug?: string
  number?: number
  title?: string
  title_en?: string
  content?: string
  content_en?: string
}

interface WikiPage {
  slug: string
  title: string
  content?: string
}

interface GapItem {
  type: 'article' | 'book_chapter' | 'wiki_page'
  path: string
  slug: string
  title: string
  words: number
  language: string
}

function countWords(text: string | undefined): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

async function main() {
  const args = process.argv.slice(2)
  const minWords = parseInt(args.find((a, i) => args[i - 1] === '--min-words') ?? '300')
  const format = args.find((a, i) => args[i - 1] === '--format') ?? 'text'

  const gaps: GapItem[] = []

  // ── Articles ──
  const articlesFile = join(DATA_DIR, 'articles/articles.json')
  if (existsSync(articlesFile)) {
    const articles: Article[] = JSON.parse(readFileSync(articlesFile, 'utf8'))

    for (const article of articles) {
      const enWords = countWords(article.content)
      const idWords = countWords(article.content_id)

      if (enWords < minWords) {
        gaps.push({
          type: 'article',
          path: 'data/articles/articles.json',
          slug: article.slug,
          title: article.title,
          words: enWords,
          language: 'en',
        })
      }
      if (idWords < minWords) {
        gaps.push({
          type: 'article',
          path: 'data/articles/articles.json',
          slug: article.slug,
          title: article.title,
          words: idWords,
          language: 'id',
        })
      }
    }
  }

  // ── Book chapters ──
  const booksDir = join(DATA_DIR, 'books')
  if (existsSync(booksDir)) {
    const bookSlugs = readdirSync(booksDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)

    for (const bookSlug of bookSlugs) {
      const chapterFiles = readdirSync(join(booksDir, bookSlug))
        .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'meta.json')

      for (const file of chapterFiles) {
        const raw = JSON.parse(readFileSync(join(booksDir, bookSlug, file), 'utf8'))
        const chapters: BookChapter[] = Array.isArray(raw) ? raw : [raw]
        for (const ch of chapters) {
          const words = countWords(ch.content_en ?? ch.content)
          if (words < minWords) {
            gaps.push({
              type: 'book_chapter',
              path: `data/books/${bookSlug}/${file}`,
              slug: ch.slug ?? String(ch.number ?? 0),
              title: `${bookSlug} — ${ch.title_en ?? ch.title ?? '?'}`,
              words,
              language: 'en',
            })
          }
        }
      }
    }
  }

  // ── Wiki pages ──
  const wikiFile = join(DATA_DIR, 'wiki/pages.json')
  if (existsSync(wikiFile)) {
    const pages: WikiPage[] = JSON.parse(readFileSync(wikiFile, 'utf8'))
    for (const page of pages) {
      const words = countWords(page.content)
      if (words < minWords) {
        gaps.push({
          type: 'wiki_page',
          path: 'data/wiki/pages.json',
          slug: page.slug,
          title: page.title,
          words,
          language: 'en',
        })
      }
    }
  }

  // ── Output ──
  if (format === 'json') {
    console.log(JSON.stringify(gaps, null, 2))
  } else {
    const byType: Record<string, GapItem[]> = {}
    for (const g of gaps) {
      const key = `${g.type}/${g.language}`
      byType[key] = byType[key] ?? []
      byType[key].push(g)
    }

    console.log(`\n=== Content Gap Report (min ${minWords} words) ===\n`)
    console.log(`Total gaps: ${gaps.length}\n`)

    for (const [key, items] of Object.entries(byType)) {
      console.log(`${key}: ${items.length} items`)
      for (const item of items.slice(0, 10)) {
        console.log(`  - [${item.words}w] ${item.slug}: ${item.title}`)
      }
      if (items.length > 10) {
        console.log(`  ... and ${items.length - 10} more`)
      }
      console.log()
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
