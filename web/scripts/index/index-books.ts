/**
 * S9-09: Index all book chapters into `iw_books` Meilisearch index.
 * Fields: id, book_slug, chapter_number, title_en, content_en, has_text_ar, madhab, subject
 * Run: pnpm tsx scripts/index/index-books.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { Meilisearch } from 'meilisearch'
import { INDEX_NAMES } from '../../lib/search/schema'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = new Meilisearch({
  host: process.env.MEILISEARCH_HOST ?? '',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY ?? '',
})

const DATA_DIR = path.resolve(process.cwd(), 'data/books')
const BATCH_SIZE = 200

interface BookMeta {
  slug: string
  title_en: string
  title_ar?: string
  author_name_en?: string
  madhab?: string
  subject?: string
}

interface ChapterRaw {
  number: number
  title_en?: string
  title_ar?: string
  content_en?: string
  content_ar?: string
}

async function main() {
  const booksFile = path.join(path.resolve(process.cwd(), 'data'), 'books', 'books.json')
  // Fall back to data root books.json if per-subdirectory not found
  const booksMetaFile = fs.existsSync(booksFile)
    ? booksFile
    : path.resolve(process.cwd(), 'data/books.json')

  let books: BookMeta[] = []
  if (fs.existsSync(booksMetaFile)) {
    books = JSON.parse(fs.readFileSync(booksMetaFile, 'utf-8'))
  }
  const bookMap = new Map(books.map((b) => [b.slug, b]))

  await client.createIndex(INDEX_NAMES.books, { primaryKey: 'id' }).catch(() => {})
  const index = client.index(INDEX_NAMES.books)
  await index.updateSettings({
    searchableAttributes: ['title_en', 'title_ar', 'content_en', 'author_name'],
    filterableAttributes: ['book_slug', 'madhab', 'subject', 'has_text_ar'],
    sortableAttributes: ['chapter_number', 'book_slug'],
  })

  let totalIndexed = 0
  let docId = 0
  const batch: Record<string, unknown>[] = []

  // Each book is a directory under data/books/ with chapter JSON files
  const bookDirs = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((d) => {
        const full = path.join(DATA_DIR, d)
        return fs.statSync(full).isDirectory()
      })
    : []

  for (const bookSlug of bookDirs) {
    const bookDir = path.join(DATA_DIR, bookSlug)
    const meta = bookMap.get(bookSlug)

    const chapterFiles = fs
      .readdirSync(bookDir)
      .filter((f) => f.endsWith('.json'))
      .sort()

    for (const file of chapterFiles) {
      let chapters: ChapterRaw[] = []
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(bookDir, file), 'utf-8'))
        chapters = Array.isArray(raw) ? raw : [raw]
      } catch {
        continue
      }

      for (const ch of chapters) {
        docId++
        batch.push({
          id: docId,
          book_slug: bookSlug,
          author_name: meta?.author_name_en ?? '',
          madhab: meta?.madhab ?? '',
          subject: meta?.subject ?? '',
          chapter_number: ch.number,
          title_en: ch.title_en ?? '',
          title_ar: ch.title_ar ?? '',
          content_en: (ch.content_en ?? '').slice(0, 5000),
          has_text_ar: Boolean(ch.content_ar),
        })

        if (batch.length >= BATCH_SIZE) {
          await index.addDocuments(batch.splice(0, BATCH_SIZE))
          totalIndexed += BATCH_SIZE
          process.stdout.write(`\r  Indexed ${totalIndexed} chapters (${bookSlug})...`)
        }
      }
    }
  }

  if (batch.length) {
    await index.addDocuments(batch)
    totalIndexed += batch.length
  }

  console.log(`\n✓ Books index complete: ${totalIndexed} chapters in ${INDEX_NAMES.books}`)
}

main().catch((err) => {
  console.error('Books index failed:', err)
  process.exit(1)
})
