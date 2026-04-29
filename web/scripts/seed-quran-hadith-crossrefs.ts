/**
 * S9-26: Seed Quran → Hadith cross-references.
 *
 * Reads quran_refs arrays from Bukhari + Muslim hadith JSON files and
 * writes rows to the `iw_cross_refs` table via Hasura admin.
 *
 * Target: 10K+ cross-refs from Bukhari + Muslim.
 *
 * Run:
 *   pnpm tsx scripts/seed-quran-hadith-crossrefs.ts
 *   # or with a different collection:
 *   COLLECTIONS=bukhari,muslim,tirmidhi pnpm tsx scripts/seed-quran-hadith-crossrefs.ts
 *
 * Requires:
 *   HASURA_ADMIN_URL or NEXT_PUBLIC_HASURA_URL
 *   HASURA_GRAPHQL_ADMIN_SECRET
 *   (loaded from .env.local)
 *
 * Idempotent: uses INSERT ... ON CONFLICT DO NOTHING
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as glob from 'glob'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ??
  process.env.NEXT_PUBLIC_HASURA_URL ??
  'https://api.ummat.dev/v1/graphql'
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

if (!HASURA_SECRET) {
  console.error('ERROR: HASURA_GRAPHQL_ADMIN_SECRET not set')
  process.exit(1)
}

// ── Collections to seed (override via env) ──────────────────────────────────

const COLLECTIONS_TO_SEED = (process.env.COLLECTIONS ?? 'bukhari,muslim')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// ── GraphQL mutation ─────────────────────────────────────────────────────────

const MUTATION = `
  mutation InsertCrossRefs($objects: [iw_cross_refs_insert_input!]!) {
    insert_iw_cross_refs(
      objects: $objects
      on_conflict: {
        constraint: iw_cross_refs_source_type_source_id_target_type_target_id_key,
        update_columns: []
      }
    ) {
      affected_rows
    }
  }
`

// ── Data types ───────────────────────────────────────────────────────────────

interface HadithEntry {
  n: number
  cn?: number
  book?: number
  collection?: string
  ar?: string
  ar_clean?: string
  t?: Record<string, string>
  quran_refs?: string[]
  grade?: string
  grade_display?: string
}

interface CrossRefObject {
  source_type: string
  source_id: string
  target_type: string
  target_id: string
  ref_type: string
}

// ── Hasura query helper ──────────────────────────────────────────────────────

async function hasuraAdmin<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json()) as { data: T; errors?: { message: string }[] }
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

// ── Book slug lookup ─────────────────────────────────────────────────────────

interface BookEntry {
  id: number
  collection: string
  number: number
  slug: string
  file?: string
}

function loadBookSlugs(): Map<string, Map<number, string>> {
  // collection → bookNumber → bookSlug
  const booksJson = path.resolve(process.cwd(), 'data/hadith/books.json')
  if (!fs.existsSync(booksJson)) return new Map()

  const books: BookEntry[] = JSON.parse(fs.readFileSync(booksJson, 'utf-8'))
  const map = new Map<string, Map<number, string>>()
  for (const b of books) {
    if (!map.has(b.collection)) map.set(b.collection, new Map())
    map.get(b.collection)!.set(b.number, b.slug)
  }
  return map
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const BATCH_SIZE = 500
  const bookSlugs = loadBookSlugs()

  let grandTotal = 0
  let grandInserted = 0

  for (const collection of COLLECTIONS_TO_SEED) {
    const collectionDir = path.resolve(process.cwd(), `data/hadith/${collection}`)
    if (!fs.existsSync(collectionDir)) {
      console.warn(`⚠  Collection dir not found: ${collectionDir} — skipping`)
      continue
    }

    const files = glob.sync('*.json', { cwd: collectionDir }).sort()
    console.log(`\n📖 ${collection}: ${files.length} book file(s)`)

    const collectionBookMap = bookSlugs.get(collection) ?? new Map<number, string>()

    for (const file of files) {
      const bookNumber = parseInt(path.basename(file, '.json'), 10)
      const bookSlug = collectionBookMap.get(bookNumber) ?? String(bookNumber)

      let hadiths: HadithEntry[]
      try {
        hadiths = JSON.parse(fs.readFileSync(path.join(collectionDir, file), 'utf-8'))
        if (!Array.isArray(hadiths)) continue
      } catch {
        console.warn(`  ⚠  Failed to parse ${file} — skipping`)
        continue
      }

      const objects: CrossRefObject[] = []

      for (const hadith of hadiths) {
        if (!hadith.quran_refs || hadith.quran_refs.length === 0) continue
        // target_id: "{collection}:{bookSlug}:{hadithNumber}"
        const targetId = `${collection}:${bookSlug}:${hadith.n}`

        for (const ref of hadith.quran_refs) {
          // ref format: "2:43" (surah:ayah)
          const [surahStr, ayahStr] = ref.split(':')
          if (!surahStr || !ayahStr) continue
          const surahNum = parseInt(surahStr, 10)
          const ayahNum = parseInt(ayahStr, 10)
          if (isNaN(surahNum) || isNaN(ayahNum)) continue

          objects.push({
            source_type: 'quran_ayah',
            source_id: `${surahNum}:${ayahNum}`,
            target_type: 'hadith',
            target_id: targetId,
            ref_type: 'mentioned_in',
          })
        }
      }

      if (objects.length === 0) continue
      grandTotal += objects.length

      // Insert in batches
      for (let i = 0; i < objects.length; i += BATCH_SIZE) {
        const batch = objects.slice(i, i + BATCH_SIZE)
        try {
          const result = await hasuraAdmin<{
            insert_iw_cross_refs: { affected_rows: number }
          }>(MUTATION, { objects: batch })
          const rows = result.insert_iw_cross_refs.affected_rows
          grandInserted += rows
          process.stdout.write(`  ${file}: +${rows} (batch ${Math.floor(i / BATCH_SIZE) + 1})\n`)
        } catch (err) {
          console.error(`  ✗ Batch insert failed for ${file}: ${(err as Error).message}`)
        }
      }
    }
  }

  console.log(`\n✅ Done. Total cross-refs generated: ${grandTotal}. Rows inserted: ${grandInserted}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
