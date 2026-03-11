/**
 * fetch-ibn-hibban.ts
 *
 * Fetches Sahih Ibn Hibban (~7,500 hadiths) from sunnah.com API.
 * Outputs to: web/data/hadith/ibn-hibban/{001..NNN}.json
 *
 * Sunnah.com identifier: "ibnhibban"
 * API: GET https://sunnah.com/api/v1/hadiths/ibnhibban:{number}
 *
 * Rate limiting: 1 request/second.
 * Saves every 100 hadiths so progress is preserved.
 *
 * Usage:
 *   npx tsx scripts/hadith/fetch-ibn-hibban.ts [--dry-run] [--start 1] [--end 7500]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const OUTPUT_DIR = join(process.cwd(), 'web/data/hadith/ibn-hibban')
const BATCH_SIZE = 100 // Hadiths per output file

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const startArg = args.find((_, i) => args[i - 1] === '--start')
const endArg = args.find((_, i) => args[i - 1] === '--end')
const startNum = startArg ? parseInt(startArg) : 1
const endNum = endArg ? parseInt(endArg) : 7500

const COLLECTION_SLUG = 'ibnhibban'
const COLLECTION_NAME = 'Sahih Ibn Hibban'
const SUNNAH_COM_BASE = 'https://sunnah.com/api/v1'
const RATE_LIMIT_MS = 1000

interface HadithEntry {
  n: number
  cn: number
  book: number
  collection: string
  chapter_ar: string
  chapter_en: string
  ar: string
  sunnah_ref_en: string
  grade: string
  grade_display: string
  ref: string
  iw_id: string
  iwh_en: string
  topics: string[]
  tags: string[]
  quran_refs: unknown[]
}

interface SunnahComHadith {
  hadithNumber?: number | string
  hadithEnglish?: string
  hadithArabic?: string
  chapterEnglish?: string
  chapterArabic?: string
  bookNumber?: number | string
  grades?: Array<{ grade?: string; graded_by?: string }>
  [key: string]: unknown
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateIwId(collectionCode: string, num: number): string {
  // IWH IDs for ibn hibban start after Musnad Ahmad (last id ~62291)
  // Use a base offset so they don't collide
  const IW_BASE = 70000
  return `IWH-${IW_BASE + num}`
}

async function fetchHadith(number: number): Promise<SunnahComHadith | null> {
  const url = `${SUNNAH_COM_BASE}/hadiths/${COLLECTION_SLUG}:${number}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Islam.wiki/1.0 (https://islam.wiki; admin@islam.wiki) Educational research',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      console.warn(`  HTTP ${response.status} for ${COLLECTION_SLUG}:${number}`)
      return null
    }

    const data = await response.json()
    return data as SunnahComHadith
  } catch (e) {
    console.warn(`  Fetch error for ${number}: ${e}`)
    return null
  }
}

function transformHadith(data: SunnahComHadith, number: number): HadithEntry {
  const grade = data.grades?.[0]?.grade || ''
  const gradeBy = data.grades?.[0]?.graded_by || ''

  return {
    n: number,
    cn: number,
    book: typeof data.bookNumber === 'number' ? data.bookNumber : parseInt(String(data.bookNumber || '1')),
    collection: COLLECTION_SLUG,
    chapter_ar: (data.chapterArabic as string) || '',
    chapter_en: (data.chapterEnglish as string) || '',
    ar: (data.hadithArabic as string) || '',
    sunnah_ref_en: (data.hadithEnglish as string) || '',
    grade: grade,
    grade_display: gradeBy ? `${grade} (${gradeBy})` : grade,
    ref: `${COLLECTION_NAME} ${number}`,
    iw_id: generateIwId('IBH', number),
    iwh_en: (data.hadithEnglish as string) || '',
    topics: [],
    tags: [],
    quran_refs: [],
  }
}

async function main() {
  console.log(`Fetching ${COLLECTION_NAME} hadiths ${startNum}-${endNum}`)
  if (dryRun) console.log('[DRY RUN MODE]')

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`Created directory: ${OUTPUT_DIR}`)
  }

  let currentBatch: HadithEntry[] = []
  let currentBatchStart = startNum
  let totalFetched = 0
  let totalFailed = 0
  let fileNum = Math.ceil(startNum / BATCH_SIZE)

  // Load existing batch if resuming
  const batchFilePath = join(OUTPUT_DIR, `${String(fileNum).padStart(3, '0')}.json`)
  if (existsSync(batchFilePath)) {
    try {
      currentBatch = JSON.parse(readFileSync(batchFilePath, 'utf8'))
      console.log(`Resuming: loaded ${currentBatch.length} hadiths from ${batchFilePath}`)
    } catch {
      currentBatch = []
    }
  }

  for (let num = startNum; num <= endNum; num++) {
    // Check if already in current batch
    if (currentBatch.some((h) => h.n === num)) continue

    if (dryRun) {
      console.log(`  [DRY RUN] Would fetch: ${COLLECTION_SLUG}:${num}`)
      totalFetched++
    } else {
      const data = await fetchHadith(num)
      if (data) {
        currentBatch.push(transformHadith(data, num))
        totalFetched++
      } else {
        totalFailed++
      }

      // Progress update
      if (num % 50 === 0) {
        process.stdout.write(`\r  ${num}/${endNum} fetched: ${totalFetched} ok, ${totalFailed} failed...`)
      }

      // Save batch when full
      if (currentBatch.length >= BATCH_SIZE) {
        const outFile = join(OUTPUT_DIR, `${String(fileNum).padStart(3, '0')}.json`)
        writeFileSync(outFile, JSON.stringify(currentBatch, null, 2))
        console.log(`\n  Saved batch ${fileNum}: ${outFile}`)
        currentBatch = []
        fileNum++
        currentBatchStart = num + 1
      }

      await sleep(RATE_LIMIT_MS)
    }
  }

  // Save final partial batch
  if (!dryRun && currentBatch.length > 0) {
    const outFile = join(OUTPUT_DIR, `${String(fileNum).padStart(3, '0')}.json`)
    writeFileSync(outFile, JSON.stringify(currentBatch, null, 2))
    console.log(`\n  Saved final batch: ${outFile}`)
  }

  console.log(`\nDone: ${totalFetched} hadiths fetched, ${totalFailed} failed/skipped`)
  console.log(`Output: ${OUTPUT_DIR}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
