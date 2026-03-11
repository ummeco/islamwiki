/**
 * scrape-sunnah-com.ts
 *
 * Scrapes sunnah_ref_en (English hadith text) from sunnah.com for Musnad Ahmad
 * books 38-49 (~6,925 hadiths missing translation).
 *
 * Uses sunnah.com's public API endpoint:
 *   GET https://sunnah.com/api/v1/hadiths/ahmad:{number}
 *
 * Rate limiting: 1 request/second to be polite.
 * Saves progress after each book file so it can be resumed.
 *
 * Usage:
 *   npx tsx scripts/hadith/scrape-sunnah-com.ts [--dry-run] [--start-book 38] [--end-book 49]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const HADITH_DIR = join(process.cwd(), 'web/data/hadith/musnad-ahmad')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const startBookArg = args.find((_, i) => args[i - 1] === '--start-book')
const endBookArg = args.find((_, i) => args[i - 1] === '--end-book')
const startBook = startBookArg ? parseInt(startBookArg) : 38
const endBook = endBookArg ? parseInt(endBookArg) : 49

const SUNNAH_COM_BASE = 'https://sunnah.com/api/v1'
const RATE_LIMIT_MS = 1000 // 1 request per second

interface HadithEntry {
  n: number
  ref?: string
  sunnah_ref_en?: string
  [key: string]: unknown
}

interface SunnahComResponse {
  hadiths?: {
    data?: Array<{
      hadithEnglish?: string
      hadithText?: string
      body?: string
    }>
  }
  hadithEnglish?: string
  hadithText?: string
  body?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Extract hadith number from ref field like "Musnad Ahmad 19439"
 */
function extractHadithNumber(ref: string): number | null {
  const match = ref.match(/Musnad Ahmad\s+(\d+)/i)
  return match ? parseInt(match[1]) : null
}

/**
 * Fetch English text from sunnah.com for a given hadith number.
 * Tries the JSON API endpoint first, then falls back to HTML scraping.
 */
async function fetchEnglishText(hadithNumber: number): Promise<string | null> {
  // Try the sunnah.com API
  const url = `${SUNNAH_COM_BASE}/hadiths/ahmad:${hadithNumber}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Islam.wiki/1.0 (https://islam.wiki; admin@islam.wiki) Educational research',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // 404 means this hadith number doesn't exist on sunnah.com
      if (response.status === 404) return null
      console.warn(`  HTTP ${response.status} for hadith ${hadithNumber}`)
      return null
    }

    const data = (await response.json()) as SunnahComResponse

    // Try various response shapes
    const text =
      data?.hadithEnglish ||
      data?.hadithText ||
      data?.body ||
      data?.hadiths?.data?.[0]?.hadithEnglish ||
      data?.hadiths?.data?.[0]?.hadithText ||
      data?.hadiths?.data?.[0]?.body ||
      null

    if (text && typeof text === 'string' && text.trim().length > 20) {
      // Strip HTML tags if present
      return text.replace(/<[^>]*>/g, '').trim()
    }

    return null
  } catch (e) {
    console.warn(`  Fetch error for hadith ${hadithNumber}: ${e}`)
    return null
  }
}

async function processBookFile(filePath: string, bookNum: number): Promise<{ patched: number; failed: number }> {
  const raw = readFileSync(filePath, 'utf8')
  const hadiths: HadithEntry[] = JSON.parse(raw)

  let patched = 0
  let failed = 0
  let i = 0

  for (const hadith of hadiths) {
    i++
    // Skip if already has content
    if (hadith.sunnah_ref_en && hadith.sunnah_ref_en.trim().length > 20) continue

    const hadithNum = hadith.ref ? extractHadithNumber(hadith.ref) : null
    if (!hadithNum) {
      failed++
      continue
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would fetch: ahmad:${hadithNum}`)
      patched++
      continue
    }

    const text = await fetchEnglishText(hadithNum)
    if (text) {
      hadith.sunnah_ref_en = text
      patched++
    } else {
      failed++
    }

    // Progress indicator every 50 hadiths
    if (i % 50 === 0) {
      process.stdout.write(`\r  Book ${bookNum}: ${i}/${hadiths.length} processed, ${patched} patched...`)
    }

    // Rate limit
    await sleep(RATE_LIMIT_MS)
  }

  process.stdout.write('\n')

  if (!dryRun && patched > 0) {
    writeFileSync(filePath, JSON.stringify(hadiths, null, 2))
  }

  return { patched, failed }
}

async function main() {
  console.log(`Scraping sunnah.com for Musnad Ahmad books ${startBook}-${endBook}`)
  if (dryRun) console.log('[DRY RUN MODE]')

  const files = readdirSync(HADITH_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, num: parseInt(f.replace('.json', '')) }))
    .filter(({ num }) => num >= startBook && num <= endBook)
    .sort((a, b) => a.num - b.num)

  if (files.length === 0) {
    console.log(`No files found for books ${startBook}-${endBook}`)
    process.exit(0)
  }

  let totalPatched = 0
  let totalFailed = 0

  for (const { file, num } of files) {
    const filePath = join(HADITH_DIR, file)
    console.log(`\nProcessing book ${num} (${file})...`)

    const { patched, failed } = await processBookFile(filePath, num)
    totalPatched += patched
    totalFailed += failed

    console.log(`  Book ${num}: ${patched} patched, ${failed} failed/skipped`)

    // Brief pause between files
    if (!dryRun) await sleep(2000)
  }

  console.log(`\nDone: ${totalPatched} hadiths patched, ${totalFailed} failed/skipped`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
