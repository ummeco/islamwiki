/**
 * merge-narrator-bios.ts
 *
 * Merges narrator-bio-patch-*.json files into narrators.json.
 * Each patch file maps { slug: bio_short_en }.
 *
 * Usage: npx tsx scripts/people/merge-narrator-bios.ts [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const NARRATORS_FILE = join(process.cwd(), 'web/data/people/narrators.json')
const PATCH_DIR = join(process.cwd(), 'web/data/people')

const dryRun = process.argv.includes('--dry-run')

interface Narrator {
  name_en: string
  slug: string
  person_slug?: string
  hadith_count?: number
  collections?: unknown[]
  bio_short_en?: string
  [key: string]: unknown
}

const narrators: Narrator[] = JSON.parse(readFileSync(NARRATORS_FILE, 'utf8'))
const narratorMap = new Map(narrators.map((n) => [n.slug, n]))

let totalPatched = 0
let totalSkipped = 0

const patchFiles = readdirSync(PATCH_DIR)
  .filter((f) => f.startsWith('narrator-bio-patch-') && f.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('No narrator bio patch files found in', PATCH_DIR)
  process.exit(0)
}

for (const file of patchFiles) {
  const patchPath = join(PATCH_DIR, file)
  let patch: Record<string, string>
  try {
    patch = JSON.parse(readFileSync(patchPath, 'utf8'))
  } catch (e) {
    console.error(`  ${file}: INVALID JSON — ${e}`)
    continue
  }

  let batchPatched = 0
  for (const [slug, bio] of Object.entries(patch)) {
    const narrator = narratorMap.get(slug)
    if (!narrator) {
      console.warn(`  ${file}: slug "${slug}" not found — skipping`)
      totalSkipped++
      continue
    }
    if (!bio || bio.trim().length < 50) {
      totalSkipped++
      continue
    }
    if (!narrator.bio_short_en) {
      narrator.bio_short_en = bio
      batchPatched++
      totalPatched++
    } else {
      totalSkipped++
    }
  }

  console.log(`  ${file}: ${batchPatched} narrator bios added`)
}

if (!dryRun && totalPatched > 0) {
  writeFileSync(NARRATORS_FILE, JSON.stringify(narrators, null, 2))
  console.log(`\nMerged ${totalPatched} narrator bios (${totalSkipped} skipped)`)
} else {
  console.log(`\n[DRY RUN] Would merge ${totalPatched} narrator bios (${totalSkipped} skipped)`)
}
