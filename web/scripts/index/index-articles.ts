/**
 * S9-10b: Index articles into `iw_articles` Meilisearch index.
 * Run: pnpm tsx scripts/index/index-articles.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { MeiliSearch } from 'meilisearch'
import { INDEX_NAMES } from '../../lib/search/schema'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? '',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY ?? '',
})

const DATA_DIR = path.resolve(process.cwd(), 'data/articles')

interface ArticleRaw {
  slug: string
  title: string
  excerpt?: string
  content?: string
  category?: string
  language?: string
  status?: string
  tags?: string[]
}

async function main() {
  await client.createIndex(INDEX_NAMES.articles, { primaryKey: 'id' }).catch(() => {})
  const index = client.index(INDEX_NAMES.articles)
  await index.updateSettings({
    searchableAttributes: ['title', 'content', 'excerpt', 'tags', 'category'],
    filterableAttributes: ['category', 'language', 'status'],
    sortableAttributes: ['title'],
  })

  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
    : []

  const docs: Record<string, unknown>[] = []
  let docId = 0

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
      const articles: ArticleRaw[] = Array.isArray(raw) ? raw : [raw]

      for (const a of articles) {
        docId++
        docs.push({
          id: docId,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt ?? '',
          // Truncate content for index size — 3000 chars is sufficient for search
          content: (a.content ?? '').slice(0, 3000),
          category: a.category ?? '',
          language: a.language ?? 'en',
          status: a.status ?? 'published',
          tags: a.tags ?? [],
        })
      }
    } catch {
      continue
    }
  }

  if (docs.length) {
    await index.addDocuments(docs)
  }

  console.log(`✓ Articles index complete: ${docs.length} articles in ${INDEX_NAMES.articles}`)
}

main().catch((err) => {
  console.error('Articles index failed:', err)
  process.exit(1)
})
