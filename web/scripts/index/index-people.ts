/**
 * S9-10a: Index people into `iw_people` Meilisearch index.
 * Run: pnpm tsx scripts/index/index-people.ts
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

const DATA_DIR = path.resolve(process.cwd(), 'data/people')

interface PersonRaw {
  slug: string
  name_en: string
  name_ar: string
  bio_short_en?: string
  era?: string
  madhab?: string
  category?: string
  tags?: string[]
  death_ah?: number
}

async function main() {
  await client.createIndex(INDEX_NAMES.people, { primaryKey: 'id' }).catch(() => {})
  const index = client.index(INDEX_NAMES.people)
  await index.updateSettings({
    searchableAttributes: ['name_en', 'name_ar', 'bio_short', 'tags'],
    filterableAttributes: ['era', 'madhab', 'category'],
    sortableAttributes: ['name_en', 'death_ah'],
  })

  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
    : []

  const docs: Record<string, unknown>[] = []
  let docId = 0

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
      const people: PersonRaw[] = Array.isArray(raw) ? raw : [raw]

      for (const p of people) {
        docId++
        docs.push({
          id: docId,
          slug: p.slug,
          name_en: p.name_en,
          name_ar: p.name_ar,
          bio_short: p.bio_short_en ?? '',
          era: p.era ?? '',
          madhab: p.madhab ?? '',
          category: p.category ?? '',
          tags: p.tags ?? [],
          death_ah: p.death_ah,
        })
      }
    } catch {
      continue
    }
  }

  if (docs.length) {
    await index.addDocuments(docs)
  }

  console.log(`✓ People index complete: ${docs.length} people in ${INDEX_NAMES.people}`)
}

main().catch((err) => {
  console.error('People index failed:', err)
  process.exit(1)
})
