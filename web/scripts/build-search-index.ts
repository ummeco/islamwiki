/**
 * Build and push the Islam.wiki search index to Meilisearch.
 *
 * Usage:
 *   pnpx tsx scripts/build-search-index.ts
 *   pnpx tsx scripts/build-search-index.ts --dry-run   (print stats only)
 *
 * Requires env vars:
 *   MEILISEARCH_URL   — e.g. https://search.ummat.dev
 *   MEILISEARCH_KEY   — admin API key
 */

import { MeiliSearch } from 'meilisearch'
import { readFileSync } from 'fs'
import { join } from 'path'

const DRY_RUN = process.argv.includes('--dry-run')
const INDEX_NAME = 'islamwiki'

// ── SearchDocument — the normalized format for every entity ──────────────────

export interface SearchDocument {
  id: string           // unique: type:slug or type:collection:book:number
  type: string         // quran | hadith | seerah | person | book | article | video | audio | wiki | sect
  title: string        // primary display text
  title_ar?: string    // Arabic title (for Arabic search)
  body: string         // full-text search field (long)
  snippet: string      // pre-built excerpt for display (≤200 chars)
  url: string          // relative URL for navigation
  meta?: string        // badge text (e.g. "Surah 2", "Book", "Collection")
  locale?: string      // 'en' | 'ar' | 'id'
  tags?: string[]      // for filtering
  era?: string         // for people/seerah filtering
  grade?: string       // for hadith filtering (sahih, hasan, daif)
  severity?: number    // for seerah/history (1-3)
}

// ── Data loaders (read from JSON files directly — no server-only imports) ────

const DATA_DIR = join(process.cwd(), 'data')
const SECTS_DIR = join(DATA_DIR, 'sects')
const WIKI_DIR = join(DATA_DIR, 'wiki')

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function buildQuranDocs(): SearchDocument[] {
  type Surah = { number: number; name_ar: string; name_en: string; name_transliteration: string; slug: string; revelation_type: string; verses_count: number }
  const surahs = loadJson<Surah[]>(join(DATA_DIR, 'quran', 'surahs.json'))
  return surahs.map((s) => ({
    id: `quran:${s.number}`,
    type: 'quran',
    title: `Surah ${s.name_transliteration} (${s.name_en})`,
    title_ar: s.name_ar,
    body: `${s.name_en} ${s.name_transliteration} ${s.name_ar} surah ${s.number} ${s.revelation_type} ${s.verses_count} verses`,
    snippet: `${s.verses_count} verses. ${s.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'} surah.`,
    url: `/quran/${s.number}`,
    meta: `Surah ${s.number}`,
    tags: [s.revelation_type],
  }))
}

function buildHadithDocs(): SearchDocument[] {
  type Collection = { id: string; name_en: string; name_ar: string; slug: string; author_name_en: string; total_hadith: number }
  type Book = { id: string; name_en: string; name_ar: string; slug: string; hadith_count: number }
  const docs: SearchDocument[] = []
  const collections = loadJson<Collection[]>(join(DATA_DIR, 'hadith', 'collections.json'))
  for (const c of collections) {
    docs.push({
      id: `hadith:collection:${c.slug}`,
      type: 'hadith',
      title: c.name_en,
      title_ar: c.name_ar,
      body: `${c.name_en} ${c.name_ar} ${c.author_name_en} hadith collection`,
      snippet: `By ${c.author_name_en}. ${c.total_hadith.toLocaleString()} hadith.`,
      url: `/hadith/${c.slug}`,
      meta: 'Collection',
      tags: ['collection'],
    })
    // Load books for this collection
    try {
      const books = loadJson<Book[]>(join(DATA_DIR, 'hadith', c.slug, '000.json'))
      for (const b of books) {
        docs.push({
          id: `hadith:book:${c.slug}:${b.slug}`,
          type: 'hadith',
          title: `${b.name_en} — ${c.name_en}`,
          title_ar: b.name_ar,
          body: `${b.name_en} ${b.name_ar} ${c.name_en} hadith book`,
          snippet: `${b.hadith_count} hadith in this book.`,
          url: `/hadith/${c.slug}/${b.slug}`,
          meta: 'Book',
          tags: ['book'],
        })
      }
    } catch {
      // Collection may not have a books index
    }
  }
  return docs
}

function buildSeerahDocs(): SearchDocument[] {
  type SeerahEvent = { slug: string; title_en: string; title_ar: string; description_en: string; date_ah?: string; year_ah?: number; severity?: number; tags?: string[] }
  const events = loadJson<SeerahEvent[]>(join(DATA_DIR, 'seerah', 'events.json'))
  return events.map((e) => ({
    id: `seerah:${e.slug}`,
    type: 'seerah',
    title: e.title_en,
    title_ar: e.title_ar,
    body: `${e.title_en} ${e.title_ar} ${e.description_en}`,
    snippet: e.description_en.slice(0, 200),
    url: `/seerah/${e.slug}`,
    meta: e.date_ah || (e.year_ah != null ? `${e.year_ah} AH` : ''),
    tags: e.tags ?? [],
    severity: e.severity,
  }))
}

function buildPeopleDocs(): SearchDocument[] {
  type Person = { slug: string; name_en: string; name_ar: string; bio_short_en?: string; era?: string; category?: string; tags?: string[] }
  const people = loadJson<Person[]>(join(DATA_DIR, 'people', 'scholars.json'))
  return people.map((p) => ({
    id: `person:${p.slug}`,
    type: 'person',
    title: p.name_en,
    title_ar: p.name_ar,
    body: `${p.name_en} ${p.name_ar} ${p.bio_short_en ?? ''} ${p.era ?? ''} ${p.category ?? ''}`,
    snippet: p.bio_short_en?.slice(0, 200) ?? `Islamic scholar (${p.era ?? 'historical figure'}).`,
    url: `/people/${p.slug}`,
    meta: p.era,
    tags: p.tags ?? [],
    era: p.era,
  }))
}

function buildBookDocs(): SearchDocument[] {
  type Book = { slug: string; title: string; title_ar?: string; description_en?: string; subject?: string; tags?: string[] }
  const books = loadJson<Book[]>(join(DATA_DIR, 'books', 'classical.json'))
  return books.map((b) => ({
    id: `book:${b.slug}`,
    type: 'book',
    title: b.title,
    title_ar: b.title_ar,
    body: `${b.title} ${b.title_ar ?? ''} ${b.description_en ?? ''} ${b.subject ?? ''}`,
    snippet: b.description_en?.slice(0, 200) ?? b.title,
    url: `/books/${b.slug}`,
    meta: b.subject,
    tags: b.tags ?? [],
  }))
}

function buildArticleDocs(): SearchDocument[] {
  type Article = { slug: string; title: string; excerpt?: string; content?: string; category?: string; tags?: string[] }
  const articles = loadJson<Article[]>(join(DATA_DIR, 'articles', 'articles.json'))
  return articles.map((a) => ({
    id: `article:${a.slug}`,
    type: 'article',
    title: a.title,
    body: `${a.title} ${a.excerpt ?? ''} ${(a.content ?? '').slice(0, 2000)}`,
    snippet: a.excerpt?.slice(0, 200) ?? a.title,
    url: `/articles/${a.slug}`,
    meta: a.category,
    tags: a.tags ?? [],
  }))
}

function buildMediaDocs(): SearchDocument[] {
  type Media = { slug: string; title: string; type: string; speakers?: string[]; description?: string; tags?: string[] }
  let media: Media[] = []
  try {
    media = loadJson<Media[]>(join(DATA_DIR, 'media', 'media.json'))
  } catch {
    return []
  }
  return media.map((m) => ({
    id: `${m.type}:${m.slug}`,
    type: m.type === 'video' ? 'video' : 'audio',
    title: m.title,
    body: `${m.title} ${m.description ?? ''} ${(m.speakers ?? []).join(' ')}`,
    snippet: m.description?.slice(0, 200) ?? m.title,
    url: `/${m.type === 'video' ? 'videos' : 'audio'}/${m.slug}`,
    meta: (m.speakers ?? [])[0],
    tags: m.tags ?? [],
  }))
}

function buildSectDocs(): SearchDocument[] {
  type Sect = { slug: string; name: string; name_ar?: string; description_en?: string; tags?: string[] }
  const sects = loadJson<Sect[]>(join(SECTS_DIR, 'sects.json'))
  return sects.map((s) => ({
    id: `sect:${s.slug}`,
    type: 'sect',
    title: s.name,
    title_ar: s.name_ar,
    body: `${s.name} ${s.name_ar ?? ''} ${s.description_en ?? ''}`,
    snippet: s.description_en?.slice(0, 200) ?? s.name,
    url: `/sects/${s.slug}`,
    tags: s.tags ?? [],
  }))
}

function buildWikiDocs(): SearchDocument[] {
  type WikiPage = { slug: string | string[]; title: string; content?: string; category?: string }
  let pages: WikiPage[] = []
  try {
    pages = loadJson<WikiPage[]>(join(WIKI_DIR, 'pages.json'))
  } catch {
    return []
  }
  return pages.map((p) => {
    const slugStr = Array.isArray(p.slug) ? p.slug.join('/') : p.slug
    return {
      id: `wiki:${slugStr}`,
      type: 'wiki',
      title: p.title,
      body: `${p.title} ${p.content?.slice(0, 2000) ?? ''}`,
      snippet: p.content?.slice(0, 200) ?? p.title,
      url: `/wiki/${slugStr}`,
      meta: p.category,
    }
  })
}

// ── Index settings ────────────────────────────────────────────────────────────

const INDEX_SETTINGS = {
  searchableAttributes: [
    'title',
    'title_ar',
    'body',
    'snippet',
    'tags',
  ],
  filterableAttributes: [
    'type',
    'locale',
    'era',
    'grade',
    'severity',
    'tags',
  ],
  sortableAttributes: ['severity'],
  displayedAttributes: ['id', 'type', 'title', 'title_ar', 'snippet', 'url', 'meta', 'era', 'grade', 'severity', 'tags'],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
  ],
  synonyms: {
    // Islamic name variants
    quran: ['quran', 'koran', 'quraan'],
    hadith: ['hadith', 'hadeeth', 'narration'],
    bukhari: ['bukhari', 'bukhaari', 'al-bukhari'],
    muslim: ['muslim', 'sahih muslim'],
    prophet: ['prophet', 'nabi', 'rasul', 'messenger'],
    allah: ['allah', 'god'],
    seerah: ['seerah', 'sirah', 'biography'],
  },
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Building Islam.wiki search index…')

  const docs: SearchDocument[] = [
    ...buildQuranDocs(),
    ...buildHadithDocs(),
    ...buildSeerahDocs(),
    ...buildPeopleDocs(),
    ...buildBookDocs(),
    ...buildArticleDocs(),
    ...buildMediaDocs(),
    ...buildSectDocs(),
    ...buildWikiDocs(),
  ]

  const counts: Record<string, number> = {}
  for (const d of docs) {
    counts[d.type] = (counts[d.type] ?? 0) + 1
  }

  console.log(`Total documents: ${docs.length}`)
  for (const [type, count] of Object.entries(counts).sort()) {
    console.log(`  ${type}: ${count}`)
  }

  if (DRY_RUN) {
    console.log('\nDry run — skipping Meilisearch push.')
    return
  }

  const url = process.env.MEILISEARCH_URL
  const key = process.env.MEILISEARCH_KEY

  if (!url || !key) {
    console.error('Error: MEILISEARCH_URL and MEILISEARCH_KEY env vars required.')
    process.exit(1)
  }

  const client = new MeiliSearch({ host: url, apiKey: key })

  // Create or update index
  const index = client.index(INDEX_NAME)

  // Apply settings
  console.log('\nApplying index settings…')
  await index.updateSettings(INDEX_SETTINGS)

  // Push documents in batches of 1000
  const BATCH = 1000
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH)
    const task = await index.addDocuments(batch, { primaryKey: 'id' })
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: queued task ${task.taskUid} (${batch.length} docs)`)
  }

  console.log('\nIndex build complete. Tasks are processing asynchronously.')
}

main().catch((e) => { console.error(e); process.exit(1) })
