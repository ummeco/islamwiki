/**
 * Islam.wiki Meilisearch Indexer
 *
 * Indexes all static content (books, articles, hadith, people, quran, wiki, sects)
 * into Meilisearch for fast full-text search.
 *
 * Usage:
 *   MEILISEARCH_URL=https://api.islam.wiki/meili \
 *   MEILISEARCH_KEY=<admin-key> \
 *   npx tsx scripts/index-meilisearch.ts
 *
 * Or with local Meilisearch:
 *   MEILISEARCH_URL=http://localhost:7700 \
 *   MEILISEARCH_KEY=<master-key> \
 *   npx tsx scripts/index-meilisearch.ts
 */

import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const MEILISEARCH_URL = process.env.MEILISEARCH_URL ?? 'http://localhost:7700'
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY ?? ''
const INDEX_NAME = 'islamwiki'
const DATA_DIR = join(process.cwd(), 'web/data')
const BATCH_SIZE = 500

interface SearchDoc {
  id: string
  type: string
  title: string
  snippet: string
  url: string
  meta?: string
}

async function meiliRequest(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${MEILISEARCH_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${MEILISEARCH_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meilisearch ${method} ${path} failed: ${res.status} ${err}`)
  }
  return res.json()
}

async function waitForTask(taskUid: number) {
  while (true) {
    const task = await meiliRequest(`/tasks/${taskUid}`)
    if (task.status === 'succeeded') return
    if (task.status === 'failed') throw new Error(`Task ${taskUid} failed: ${JSON.stringify(task.error)}`)
    await new Promise((r) => setTimeout(r, 500))
  }
}

async function addDocuments(docs: SearchDoc[]) {
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const result = await meiliRequest(`/indexes/${INDEX_NAME}/documents`, 'POST', batch)
    await waitForTask(result.taskUid)
    process.stdout.write('.')
  }
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function snippet(html: string, max = 200): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

async function indexBooks() {
  const classical = readJson(join(DATA_DIR, 'books/classical.json'))
  const docs: SearchDoc[] = []

  for (const book of classical) {
    if (book.canonical === false) continue
    const slug = book.slug
    docs.push({
      id: `book-${slug}`,
      type: 'book',
      title: book.title_en ?? book.title,
      snippet: book.about_en ? snippet(book.about_en) : (book.author ?? ''),
      url: `/books/${slug}`,
      meta: book.author ?? undefined,
    })

    // Index chapters
    const bookDir = join(DATA_DIR, `books/${slug}`)
    try {
      const files = readdirSync(bookDir).filter(f => /^\d+\.json$/.test(f))
      for (const f of files) {
        const ch = readJson(join(bookDir, f))
        if (!ch.content_en) continue
        docs.push({
          id: `book-${slug}-${ch.number}`,
          type: 'book',
          title: ch.title_en ?? `${book.title_en} — Ch. ${ch.number}`,
          snippet: snippet(ch.content_en),
          url: `/books/${slug}/${ch.number}`,
          meta: book.author ?? undefined,
        })
      }
    } catch { /* book dir missing */ }
  }

  console.log(`\nIndexing ${docs.length} book docs...`)
  await addDocuments(docs)
}

async function indexArticles() {
  const docs: SearchDoc[] = []

  try {
    // Articles are stored in a single articles.json file
    const articles = readJson(join(DATA_DIR, 'articles/articles.json'))
    const list = Array.isArray(articles) ? articles : (articles.articles ?? [])
    for (const article of list) {
      if (!article.slug) continue
      docs.push({
        id: `article-${article.slug}`,
        type: 'article',
        title: article.title_en ?? article.title ?? article.slug,
        snippet: snippet(article.content_en ?? article.content ?? article.excerpt ?? ''),
        url: `/articles/${article.slug}`,
        meta: article.category ?? undefined,
      })
    }
  } catch {
    // No articles.json found
  }

  console.log(`\nIndexing ${docs.length} article docs...`)
  if (docs.length > 0) await addDocuments(docs)
}

async function indexPeople() {
  const docs: SearchDoc[] = []

  try {
    const scholars = readJson(join(DATA_DIR, 'people/scholars.json'))
    for (const p of scholars) {
      docs.push({
        id: `person-${p.slug}`,
        type: 'person',
        title: p.name_en ?? p.name,
        snippet: p.bio_short_en ?? `${p.died_ah ? `d. ${p.died_ah} AH` : ''}`.trim(),
        url: `/people/${p.slug}`,
        meta: p.era ?? undefined,
      })
    }
  } catch { /* no scholars.json */ }

  try {
    const narrators = readJson(join(DATA_DIR, 'people/narrators.json'))
    for (const p of narrators) {
      docs.push({
        id: `narrator-${p.slug}`,
        type: 'person',
        title: p.name_en ?? p.name,
        snippet: p.bio_short_en ?? '',
        url: `/people/${p.slug}`,
        meta: 'Narrator',
      })
    }
  } catch { /* no narrators.json */ }

  console.log(`\nIndexing ${docs.length} people docs...`)
  await addDocuments(docs)
}

async function indexWiki() {
  const docs: SearchDoc[] = []

  try {
    const pages = readJson(join(DATA_DIR, 'wiki/pages.json'))
    const list = Array.isArray(pages) ? pages : []
    for (const page of list) {
      if (!page.slug) continue
      docs.push({
        id: `wiki-${page.slug}`,
        type: 'wiki',
        title: page.title_en ?? page.title ?? page.slug,
        snippet: snippet(page.content_en ?? page.content ?? ''),
        url: `/wiki/${page.slug}`,
        meta: page.category ?? undefined,
      })
    }
  } catch { /* no wiki data */ }

  console.log(`\nIndexing ${docs.length} wiki docs...`)
  if (docs.length > 0) await addDocuments(docs)
}

async function indexSects() {
  const docs: SearchDoc[] = []

  try {
    const sects = readJson(join(DATA_DIR, 'sects/sects.json'))
    const list = Array.isArray(sects) ? sects : []
    for (const s of list) {
      if (!s.slug) continue
      docs.push({
        id: `sect-${s.slug}`,
        type: 'sect',
        title: s.name_en ?? s.name,
        snippet: snippet(s.description_en ?? ''),
        url: `/sects/${s.slug}`,
        meta: s.status ?? undefined,
      })
    }
  } catch { /* no sects data */ }

  console.log(`\nIndexing ${docs.length} sect docs...`)
  if (docs.length > 0) await addDocuments(docs)
}

async function indexQuran() {
  const docs: SearchDoc[] = []

  try {
    const surahs = readJson(join(DATA_DIR, 'quran/surahs.json'))
    const list = Array.isArray(surahs) ? surahs : []
    for (const s of list) {
      docs.push({
        id: `quran-surah-${s.number}`,
        type: 'quran',
        title: `Surah ${s.name_transliteration} (${s.number})`,
        snippet: `${s.revelation_type ?? ''} — ${s.verses_count ?? ''} verses`.trim(),
        url: `/quran/${s.slug}`,
        meta: s.name_ar ?? s.name_arabic ?? undefined,
      })
    }
  } catch { /* no surahs.json */ }

  console.log(`\nIndexing ${docs.length} Quran docs...`)
  if (docs.length > 0) await addDocuments(docs)
}

async function main() {
  if (!MEILISEARCH_KEY) {
    console.error('MEILISEARCH_KEY env var required')
    process.exit(1)
  }

  console.log(`Connecting to Meilisearch at ${MEILISEARCH_URL}...`)
  const health = await meiliRequest('/health')
  console.log('Health:', health.status)

  // Create/update index settings
  console.log(`\nSetting up index "${INDEX_NAME}"...`)
  await meiliRequest(`/indexes`, 'POST', { uid: INDEX_NAME, primaryKey: 'id' }).catch(() => {
    // Index may already exist
  })

  const settingsTask = await meiliRequest(`/indexes/${INDEX_NAME}/settings`, 'PATCH', {
    searchableAttributes: ['title', 'snippet', 'meta'],
    displayedAttributes: ['id', 'type', 'title', 'snippet', 'url', 'meta'],
    filterableAttributes: ['type'],
    sortableAttributes: ['type'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  })
  await waitForTask(settingsTask.taskUid)
  console.log('Index settings configured.')

  // Run all indexers
  await indexBooks()
  await indexArticles()
  await indexPeople()
  await indexWiki()
  await indexSects()
  await indexQuran()

  // Final stats
  const stats = await meiliRequest(`/indexes/${INDEX_NAME}/stats`)
  console.log(`\n\n✅ Indexing complete!`)
  console.log(`   Total documents: ${stats.numberOfDocuments}`)
  console.log(`   Is indexing: ${stats.isIndexing}`)
}

main().catch((err) => {
  console.error('\n❌ Indexing failed:', err.message)
  process.exit(1)
})
