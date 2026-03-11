/**
 * merge-wiki-patches.ts
 *
 * Merges all wiki patch files into pages.json.
 * Scans for: content-patch-*.json and wiki-expansion-patch.json
 * Each patch file maps { slug: htmlContent }.
 *
 * Usage: npx tsx scripts/wiki/merge-wiki-patches.ts [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data/wiki')
const PAGES_FILE = join(DATA_DIR, 'pages.json')

const dryRun = process.argv.includes('--dry-run')

interface WikiPage {
  id: number
  slug: string
  title: string
  content: string
  category: string
  status: string
  created_at: string
  updated_at: string
}

const pages: WikiPage[] = JSON.parse(readFileSync(PAGES_FILE, 'utf8'))
const pageMap = new Map(pages.map((p) => [p.slug, p]))

let totalPatched = 0
let totalSkipped = 0

const patchFiles = readdirSync(DATA_DIR)
  .filter((f) => (f.startsWith('content-patch-') || f.startsWith('wiki-expansion-patch')) && f.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('No patch files found in', DATA_DIR)
  process.exit(0)
}

for (const file of patchFiles) {
  const patchFile = join(DATA_DIR, file)

  let patch: Record<string, string>
  try {
    patch = JSON.parse(readFileSync(patchFile, 'utf8'))
  } catch (e) {
    console.error(`  ${file}: INVALID JSON — ${e}`)
    continue
  }

  let batchPatched = 0
  for (const [slug, content] of Object.entries(patch)) {
    const page = pageMap.get(slug)
    if (!page) {
      console.warn(`  ${file}: slug "${slug}" not found in pages.json — skipping`)
      totalSkipped++
      continue
    }
    if (!content || content.trim().length < 100) {
      console.warn(`  ${file}: slug "${slug}" has empty/short content — skipping`)
      totalSkipped++
      continue
    }
    // Only update if new content is longer than existing
    const existingWords = (page.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    const newWords = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    if (newWords > existingWords) {
      page.content = content
      page.updated_at = new Date().toISOString().split('T')[0]
      batchPatched++
      totalPatched++
    } else {
      totalSkipped++
    }
  }

  console.log(`  ${file}: ${batchPatched} pages updated`)
}

if (!dryRun && totalPatched > 0) {
  writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2))
  console.log(`\nMerged ${totalPatched} pages into pages.json (${totalSkipped} skipped)`)
} else {
  console.log(`\n[DRY RUN] Would merge ${totalPatched} pages (${totalSkipped} skipped)`)
}
