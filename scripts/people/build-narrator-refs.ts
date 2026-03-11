/**
 * build-narrator-refs.ts
 *
 * Scans all 70k hadiths for narrator name matches and builds a cross-reference index.
 * Output: web/data/people/narrator-hadiths.json
 * Format: { [narrator_slug]: { collection: string, book: string, number: number }[] }
 *
 * Matching strategy:
 *   1. Check `sunnah_ref_en` field for narrator name
 *   2. Check narrator name against isnad_chain[] if populated
 *   3. Fuzzy: check if narrator name appears in iwh_en text (first 200 chars = isnad)
 *
 * Usage: npx tsx scripts/people/build-narrator-refs.ts [--dry-run] [--narrator <slug>]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data')
const HADITH_DIR = join(DATA_DIR, 'hadith')
const NARRATORS_FILE = join(DATA_DIR, 'people/narrators.json')
const OUTPUT_FILE = join(DATA_DIR, 'people/narrator-hadiths.json')

interface Narrator {
  slug: string
  name_en: string
  person_slug?: string
  hadith_count?: number
  aliases?: string[]
}

interface HadithEntry {
  id: number
  number: number
  iwh_en?: string
  sunnah_ref_en?: string
  isnad_chain?: string[]
  [key: string]: unknown
}

type NarratorRefs = Record<string, Array<{
  collection: string
  book: string
  number: number
}>>

function normalizeForSearch(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(ibn|bin|bint|abu|abi|umm|al-|al|')\b/gi, ' ')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildNarratorTerms(narrators: Narrator[]): Map<string, string[]> {
  const map = new Map<string, string[]>()

  for (const n of narrators) {
    const terms: string[] = [normalizeForSearch(n.name_en)]

    // Common abbreviated forms: "Abu Hurayrah", "Ibn 'Abbas", etc.
    const parts = n.name_en.split(' ')
    if (parts.length >= 2) {
      terms.push(normalizeForSearch(parts.slice(-2).join(' ')))
    }

    // Include aliases
    for (const alias of n.aliases ?? []) {
      terms.push(normalizeForSearch(alias))
    }

    map.set(n.slug, [...new Set(terms.filter((t) => t.length > 3))])
  }

  return map
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const narratorFilter = args.find((a, i) => args[i - 1] === '--narrator')

  console.log('Loading narrators...')
  const narrators: Narrator[] = JSON.parse(readFileSync(NARRATORS_FILE, 'utf8'))
  const narratorTerms = buildNarratorTerms(narrators)

  const filteredNarrators = narratorFilter
    ? narrators.filter((n) => n.slug === narratorFilter)
    : narrators

  console.log(`Processing ${filteredNarrators.length} narrators across all collections...`)

  const refs: NarratorRefs = {}
  for (const n of filteredNarrators) {
    refs[n.slug] = []
  }

  const collections = readdirSync(HADITH_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  let totalMatches = 0

  for (const collection of collections) {
    const collectionDir = join(HADITH_DIR, collection)
    const files = readdirSync(collectionDir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
      const book = file.replace('.json', '')
      const hadiths: HadithEntry[] = JSON.parse(readFileSync(join(collectionDir, file), 'utf8'))

      for (const hadith of hadiths) {
        // Build searchable text from isnad portion
        const isnadText = normalizeForSearch(
          [
            hadith.sunnah_ref_en ?? '',
            (hadith.iwh_en ?? '').slice(0, 300), // first 300 chars typically = isnad
            (hadith.isnad_chain ?? []).join(' '),
          ].join(' ')
        )

        for (const narrator of filteredNarrators) {
          const terms = narratorTerms.get(narrator.slug) ?? []
          const matched = terms.some((term) => isnadText.includes(term))

          if (matched) {
            refs[narrator.slug].push({
              collection,
              book,
              number: hadith.number,
            })
            totalMatches++
          }
        }
      }
    }

    process.stdout.write('.')
  }

  console.log(`\n\nTotal matches: ${totalMatches}`)

  // Sort each narrator's refs
  for (const slug of Object.keys(refs)) {
    refs[slug].sort((a, b) => a.collection.localeCompare(b.collection) || parseInt(a.book) - parseInt(b.book) || a.number - b.number)
  }

  if (!dryRun) {
    writeFileSync(OUTPUT_FILE, JSON.stringify(refs, null, 2))
    console.log(`Written to ${OUTPUT_FILE}`)
  } else {
    const sample = Object.entries(refs)
      .filter(([, v]) => v.length > 0)
      .slice(0, 5)
    console.log('Sample (dry run):', JSON.stringify(sample, null, 2))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
