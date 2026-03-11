/**
 * build-isnad.ts
 *
 * Parses the `isnad_ar` Arabic text in each hadith to extract a narrator chain.
 * Uses the names from `data/people/narrators.json` as a lookup table.
 * Outputs: patches each collection's JSON files with a `isnad_chain` array.
 *
 * Usage: npx tsx scripts/hadith/build-isnad.ts [--collection bukhari] [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data')
const HADITH_DIR = join(DATA_DIR, 'hadith')
const NARRATORS_FILE = join(DATA_DIR, 'people/narrators.json')

interface Narrator {
  slug: string
  name_en: string
  name_ar?: string
  aliases?: string[]
}

interface HadithEntry {
  id: number
  isnad_ar?: string
  isnad_chain?: string[]
  [key: string]: unknown
}

// ── Build narrator lookup from narrators.json ──

function buildNarratorLookup(narrators: Narrator[]): Map<string, string> {
  const lookup = new Map<string, string>()
  for (const n of narrators) {
    // Index by full English name
    lookup.set(n.name_en.toLowerCase(), n.name_en)
    // Index by last word (common chain citation style)
    const parts = n.name_en.split(' ')
    if (parts.length > 1) {
      lookup.set(parts[parts.length - 1].toLowerCase(), n.name_en)
    }
    // Index aliases
    for (const alias of n.aliases ?? []) {
      lookup.set(alias.toLowerCase(), n.name_en)
    }
  }
  return lookup
}

// ── Extract narrator chain from Arabic isnad text ──
// Arabic isnad format: "حَدَّثَنَا X قَالَ حَدَّثَنَا Y عَنْ Z ..."
// Transmission verbs: حدثنا، أخبرنا، عن، قال

const TRANSMISSION_VERBS = [
  /حَدَّثَنَا\s+/g,
  /حَدَّثَنِي\s+/g,
  /أَخْبَرَنَا\s+/g,
  /أَخْبَرَنِي\s+/g,
  /عَنْ\s+/g,
  /قَالَ\s+/g,
  /رَوَى\s+/g,
]

function extractChainFromArabic(isnadAr: string): string[] {
  if (!isnadAr) return []

  // Split on transmission verbs and collect name segments
  let text = isnadAr
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()

  const segments: string[] = []

  // Split on common transmission verbs
  const verbPattern = /(?:حَدَّثَنَا|حَدَّثَنِي|أَخْبَرَنَا|أَخْبَرَنِي|عَنْ|قَالَ|رَوَى)\s+/g
  const parts = text.split(verbPattern)

  for (const part of parts) {
    const cleaned = part.trim()
    if (cleaned.length < 3) continue
    // Take first 4 words as the narrator name (Arabic names can be long)
    const words = cleaned.split(' ').slice(0, 4).join(' ')
    if (words) segments.push(words)
  }

  // Deduplicate while preserving order
  return [...new Set(segments)].slice(0, 10) // max 10 narrators in chain
}

// ── Process a single hadith book file ──

function processBookFile(filePath: string, dryRun: boolean): number {
  const raw = readFileSync(filePath, 'utf8')
  const hadiths: HadithEntry[] = JSON.parse(raw)
  let patched = 0

  const updated = hadiths.map((h) => {
    if (!h.isnad_ar || h.isnad_chain?.length) return h

    const chain = extractChainFromArabic(h.isnad_ar)
    if (chain.length === 0) return h

    patched++
    return { ...h, isnad_chain: chain }
  })

  if (!dryRun && patched > 0) {
    writeFileSync(filePath, JSON.stringify(updated, null, 2))
  }

  return patched
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const collectionArg = args.find((a, i) => args[i - 1] === '--collection')

  const narrators: Narrator[] = JSON.parse(readFileSync(NARRATORS_FILE, 'utf8'))
  console.log(`Loaded ${narrators.length} narrators`)

  const collections = readdirSync(HADITH_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((c) => !collectionArg || c === collectionArg)

  let totalPatched = 0

  for (const collection of collections) {
    const collectionDir = join(HADITH_DIR, collection)
    const files = readdirSync(collectionDir).filter((f) => f.endsWith('.json'))

    let collectionPatched = 0
    for (const file of files) {
      const patched = processBookFile(join(collectionDir, file), dryRun)
      collectionPatched += patched
    }

    if (collectionPatched > 0) {
      console.log(`  ${collection}: ${collectionPatched} hadiths updated`)
    }
    totalPatched += collectionPatched
  }

  console.log(`\nTotal: ${totalPatched} hadiths${dryRun ? ' (dry run — no files written)' : ' updated'}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
