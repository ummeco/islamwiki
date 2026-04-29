/**
 * S9-08: Index all hadith from 9 major collections into `iw_hadith` Meilisearch index.
 * Collections: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta, Ahmad, Darimi
 * Run: pnpm tsx scripts/index/index-hadith.ts
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

const DATA_DIR = path.resolve(process.cwd(), 'data/hadith')
const BATCH_SIZE = 500

const COLLECTIONS = [
  'bukhari', 'muslim', 'abu-dawud', 'tirmidhi',
  'nasai', 'ibn-majah', 'muwatta', 'ahmad', 'darimi',
]

interface CollectionMeta {
  id: number
  slug: string
  name_en: string
  name_ar: string
  author_name_en: string
}

interface BookEntry {
  id: number
  slug: string
  name_en: string
  name_ar?: string
  hadith_count?: number
}

interface HadithEntry {
  id?: number
  number: number
  text_ar?: string
  text_en?: string
  english?: { text?: string }
  arabic?: string
  grade?: string
  grade_en?: string
}

async function main() {
  const allCollections: CollectionMeta[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'collections.json'), 'utf-8')
  )

  await client.createIndex(INDEX_NAMES.hadith, { primaryKey: 'id' }).catch(() => {})
  const index = client.index(INDEX_NAMES.hadith)
  await index.updateSettings({
    searchableAttributes: ['text_en', 'text_ar', 'collection_name', 'book_name'],
    filterableAttributes: ['collection_slug', 'book_slug', 'grade'],
    sortableAttributes: ['collection_slug', 'number'],
  })

  let totalIndexed = 0
  let docId = 0

  for (const collSlug of COLLECTIONS) {
    const meta = allCollections.find((c) => c.slug === collSlug)
    const collDir = path.join(DATA_DIR, collSlug)
    if (!fs.existsSync(collDir)) {
      console.warn(`  ⚠ Missing collection dir: ${collDir}`)
      continue
    }

    // Load books list if available
    const booksFile = path.join(collDir, 'books.json')
    const books: BookEntry[] = fs.existsSync(booksFile)
      ? JSON.parse(fs.readFileSync(booksFile, 'utf-8'))
      : []
    const bookMap = new Map(books.map((b) => [b.id, b]))

    // Each collection dir contains numbered JSON files (001.json, 002.json …)
    const files = fs
      .readdirSync(collDir)
      .filter((f) => /^\d+\.json$/.test(f))
      .sort()

    const batch: Record<string, unknown>[] = []

    for (const file of files) {
      const bookNumber = parseInt(file.replace('.json', ''), 10)
      const bookMeta = bookMap.get(bookNumber)
      let hadiths: HadithEntry[] = []

      try {
        const raw = JSON.parse(fs.readFileSync(path.join(collDir, file), 'utf-8'))
        hadiths = Array.isArray(raw) ? raw : raw.hadiths ?? raw.hadith ?? []
      } catch {
        continue
      }

      for (const h of hadiths) {
        docId++
        batch.push({
          id: docId,
          collection_slug: collSlug,
          collection_name: meta?.name_en ?? collSlug,
          book_slug: bookMeta?.slug ?? `book-${bookNumber}`,
          book_name: bookMeta?.name_en ?? `Book ${bookNumber}`,
          number: h.number,
          text_ar: h.text_ar ?? h.arabic ?? '',
          text_en: h.text_en ?? h.english?.text ?? '',
          grade: h.grade ?? h.grade_en ?? '',
        })

        if (batch.length >= BATCH_SIZE) {
          await index.addDocuments(batch.splice(0, BATCH_SIZE))
          totalIndexed += BATCH_SIZE
          process.stdout.write(`\r  Indexed ${totalIndexed} hadith (${collSlug})...`)
        }
      }
    }

    // Flush remaining
    if (batch.length) {
      await index.addDocuments(batch)
      totalIndexed += batch.length
      batch.length = 0
    }

    console.log(`\n  ✓ ${collSlug}: done`)
  }

  console.log(`\n✓ Hadith index complete: ${totalIndexed} hadith in ${INDEX_NAMES.hadith}`)
}

main().catch((err) => {
  console.error('Hadith index failed:', err)
  process.exit(1)
})
