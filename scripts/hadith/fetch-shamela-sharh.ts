/**
 * fetch-shamela-sharh.ts
 *
 * Fetches Sharh (commentary) data from al-Shamela (shamela.ws) for major hadith collections.
 * Outputs sharh text to web/data/hadith/sharh/{collection}/{book}.json
 *
 * Shamela uses book IDs. This script targets sharh works for:
 *   - Fath al-Bari (sharh of Bukhari) — shamela book ID 1672
 *   - Sharh Nawawi ala Muslim — shamela book ID 1671
 *   - Tuhfat al-Ahwadhi (sharh of Tirmidhi) — shamela book ID 1678
 *   - Awn al-Ma'bud (sharh of Abu Dawud) — shamela book ID 1679
 *
 * NOTE: This script generates the structure for sharh data. Actual scraping
 * requires an active network connection and Shamela's public API or HTML parsing.
 * Run with --dry-run to see what would be fetched before actually running.
 *
 * Usage:
 *   npx tsx scripts/hadith/fetch-shamela-sharh.ts [--dry-run] [--collection bukhari]
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const OUTPUT_DIR = join(process.cwd(), 'web/data/hadith/sharh')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const collectionArg = args.find((_, i) => args[i - 1] === '--collection')

const RATE_LIMIT_MS = 1500 // Slightly slower for Shamela

// Shamela book configurations
const SHARH_BOOKS = [
  {
    id: 'fath-al-bari',
    name: 'Fath al-Bari',
    sharahOf: 'bukhari',
    shamelaId: 1672,
    estimatedEntries: 9082,
  },
  {
    id: 'sharh-nawawi-muslim',
    name: 'Sharh an-Nawawi ala Sahih Muslim',
    sharahOf: 'muslim',
    shamelaId: 1671,
    estimatedEntries: 7563,
  },
  {
    id: 'tuhfat-al-ahwadhi',
    name: 'Tuhfat al-Ahwadhi',
    sharahOf: 'tirmidhi',
    shamelaId: 1678,
    estimatedEntries: 3956,
  },
  {
    id: 'awn-al-mabud',
    name: "Awn al-Ma'bud",
    sharahOf: 'abudawud',
    shamelaId: 1679,
    estimatedEntries: 5274,
  },
]

interface SharhEntry {
  hadith_ref: string       // e.g. "bukhari:1"
  sharh_book: string       // e.g. "fath-al-bari"
  sharh_book_name: string  // human-readable
  sharh_ar: string         // Arabic commentary text
  volume?: number
  page?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch a single sharh entry from Shamela.
 * Shamela's public API returns text by book_id + hadith_index.
 */
async function fetchShamelaEntry(
  shamelaBookId: number,
  entryIndex: number
): Promise<{ ar: string; volume?: number; page?: number } | null> {
  // Shamela API endpoint (public access)
  const url = `https://shamela.ws/api/book/${shamelaBookId}/${entryIndex}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Islam.wiki/1.0 (https://islam.wiki) Educational',
        'Accept': 'application/json',
        'Referer': 'https://shamela.ws',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    const text = data?.text || data?.content || data?.body || ''

    if (typeof text === 'string' && text.trim().length > 20) {
      return {
        ar: text.trim(),
        volume: data?.volume,
        page: data?.page,
      }
    }

    return null
  } catch {
    return null
  }
}

async function processBook(
  config: (typeof SHARH_BOOKS)[0],
  outputDir: string
): Promise<void> {
  const bookOutputDir = join(outputDir, config.sharahOf)
  if (!existsSync(bookOutputDir)) mkdirSync(bookOutputDir, { recursive: true })

  const outputFile = join(bookOutputDir, `${config.id}.json`)

  console.log(`\nFetching ${config.name} (shamela id: ${config.shamelaId})`)
  console.log(`  Estimated entries: ${config.estimatedEntries}`)
  console.log(`  Output: ${outputFile}`)

  if (dryRun) {
    console.log(`  [DRY RUN] Would fetch ${config.estimatedEntries} entries from shamela.ws`)
    return
  }

  const entries: SharhEntry[] = []
  let failed = 0

  for (let i = 1; i <= config.estimatedEntries; i++) {
    const result = await fetchShamelaEntry(config.shamelaId, i)

    if (result) {
      entries.push({
        hadith_ref: `${config.sharahOf}:${i}`,
        sharh_book: config.id,
        sharh_book_name: config.name,
        sharh_ar: result.ar,
        volume: result.volume,
        page: result.page,
      })
    } else {
      failed++
    }

    if (i % 100 === 0) {
      process.stdout.write(`\r  ${i}/${config.estimatedEntries}: ${entries.length} ok, ${failed} failed...`)
      // Save intermediate progress every 500
      if (i % 500 === 0) {
        writeFileSync(outputFile, JSON.stringify(entries, null, 2))
      }
    }

    await sleep(RATE_LIMIT_MS)
  }

  writeFileSync(outputFile, JSON.stringify(entries, null, 2))
  console.log(`\n  Saved ${entries.length} entries to ${outputFile}`)
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  const books = collectionArg
    ? SHARH_BOOKS.filter((b) => b.sharahOf === collectionArg || b.id === collectionArg)
    : SHARH_BOOKS

  if (books.length === 0) {
    console.log(`No books found matching --collection ${collectionArg}`)
    process.exit(1)
  }

  console.log(`Fetching Shamela sharh data for ${books.length} book(s)`)
  if (dryRun) console.log('[DRY RUN MODE]')

  for (const book of books) {
    await processBook(book, OUTPUT_DIR)
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
