/**
 * S9-07: Index all 6,236 Quran ayahs into the Meilisearch `iw_quran` index.
 * Run: pnpm tsx scripts/index/index-quran.ts
 * Requires: MEILISEARCH_HOST + MEILISEARCH_ADMIN_KEY in .env.local
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

const DATA_DIR = path.resolve(process.cwd(), 'data/quran')

interface SurahMeta {
  number: number
  slug: string
  name_ar: string
  name_en: string
  name_transliteration: string
  revelation_type: 'meccan' | 'medinan'
  verses_count: number
}

interface AyahRaw {
  number: number
  ar: string
  t: Record<string, string>
  juz: number
  page: number
}

async function main() {
  const surahs: SurahMeta[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'surahs.json'), 'utf-8')
  )

  // Ensure index exists with correct settings
  await client.createIndex(INDEX_NAMES.quran, { primaryKey: 'id' }).catch(() => {})
  const index = client.index(INDEX_NAMES.quran)
  await index.updateSettings({
    searchableAttributes: ['text_en', 'text_ar', 'surah_slug', 'surah_number_str'],
    filterableAttributes: ['surah_number', 'juz', 'revelation_type', 'page'],
    sortableAttributes: ['surah_number', 'ayah_number', 'juz'],
  })

  let totalIndexed = 0
  const BATCH_SIZE = 500

  for (const surah of surahs) {
    const padded = String(surah.number).padStart(3, '0')
    const ayahFile = path.join(DATA_DIR, 'ayahs', `${padded}.json`)
    if (!fs.existsSync(ayahFile)) {
      console.warn(`  ⚠ Missing ayah file: ${ayahFile}`)
      continue
    }

    const ayahs: AyahRaw[] = JSON.parse(fs.readFileSync(ayahFile, 'utf-8'))
    const docs = ayahs.map((ayah) => ({
      // Unique doc ID: surah_number * 1000 + ayah_number (e.g. 2005 = Al-Baqarah:5)
      id: surah.number * 1000 + ayah.number,
      surah_number: surah.number,
      surah_number_str: String(surah.number),
      surah_slug: surah.slug,
      surah_name_en: surah.name_en,
      ayah_number: ayah.number,
      text_ar: ayah.ar,
      text_en: ayah.t?.['en'] ?? '',
      juz: ayah.juz,
      page: ayah.page,
      revelation_type: surah.revelation_type,
    }))

    // Batch upload in chunks
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      await index.addDocuments(batch)
    }

    totalIndexed += docs.length
    process.stdout.write(`\r  Indexed ${totalIndexed} ayahs (surah ${surah.number}/114)...`)
  }

  console.log(`\n✓ Quran index complete: ${totalIndexed} ayahs in ${INDEX_NAMES.quran}`)
}

main().catch((err) => {
  console.error('Quran index failed:', err)
  process.exit(1)
})
