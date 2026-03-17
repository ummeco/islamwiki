/**
 * merge-wiki-lang-patches.ts
 *
 * Merges ID/AR language patches into pages.json.
 * Scans web/data/wiki/ for files matching: wiki-id-*.json or wiki-ar-*.json
 * Each patch file: { slug: { title_id?, content_id?, title_ar?, content_ar? } }
 *
 * Usage:
 *   npx tsx scripts/wiki/merge-wiki-lang-patches.ts [--dry-run]
 *   npx tsx scripts/wiki/merge-wiki-lang-patches.ts --from=/tmp/wiki-id-batch1.json
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data/wiki')
const PAGES_FILE = join(DATA_DIR, 'pages.json')

const dryRun = process.argv.includes('--dry-run')
const fromArg = process.argv.find((a) => a.startsWith('--from='))
const fromFile = fromArg ? fromArg.split('=')[1] : null

interface WikiPage {
  id: number
  slug: string
  title: string
  title_id?: string
  title_ar?: string
  content: string
  content_id?: string
  content_ar?: string
  category: string
  status: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

interface LangPatch {
  title_id?: string
  content_id?: string
  title_ar?: string
  content_ar?: string
}

const pages: WikiPage[] = JSON.parse(readFileSync(PAGES_FILE, 'utf8'))
const pageMap = new Map(pages.map((p) => [p.slug, p]))

let totalPatched = 0
let totalSkipped = 0

function applyPatch(file: string, patch: Record<string, LangPatch | string>) {
  let batchPatched = 0
  for (const [slug, rawData] of Object.entries(patch)) {
    const page = pageMap.get(slug)
    if (!page) {
      console.warn(`  ${file}: slug "${slug}" not found — skipping`)
      totalSkipped++
      continue
    }

    // Support both { slug: { content_id, title_id } } and { slug: "string" } (legacy)
    const data: LangPatch = typeof rawData === 'string' ? { content_id: rawData } : rawData

    let changed = false

    if (data.title_id && data.title_id.trim().length > 2) {
      page.title_id = data.title_id.trim()
      changed = true
    }
    if (data.title_ar && data.title_ar.trim().length > 2) {
      page.title_ar = data.title_ar.trim()
      changed = true
    }
    if (data.content_id && data.content_id.trim().length > 100) {
      page.content_id = data.content_id.trim()
      changed = true
    }
    if (data.content_ar && data.content_ar.trim().length > 100) {
      page.content_ar = data.content_ar.trim()
      changed = true
    }

    if (changed) {
      page.updated_at = new Date().toISOString().split('T')[0]
      batchPatched++
      totalPatched++
    } else {
      totalSkipped++
    }
  }
  console.log(`  ${file}: ${batchPatched} pages updated`)
}

let patchFiles: string[]

if (fromFile) {
  patchFiles = [fromFile]
  console.log(`Processing single file: ${fromFile}`)
} else {
  patchFiles = readdirSync(DATA_DIR)
    .filter(
      (f) =>
        (f.startsWith('wiki-id-') || f.startsWith('wiki-ar-')) &&
        f.endsWith('.json')
    )
    .sort()
    .map((f) => join(DATA_DIR, f))

  if (patchFiles.length === 0) {
    console.log('No wiki lang patch files found in', DATA_DIR)
    process.exit(0)
  }
}

for (const file of patchFiles) {
  let patch: Record<string, LangPatch | string>
  try {
    patch = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`  ${file}: INVALID JSON — ${e}`)
    continue
  }
  applyPatch(file, patch)
}

if (!dryRun && totalPatched > 0) {
  writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2))
  console.log(`\nMerged ${totalPatched} pages into pages.json (${totalSkipped} skipped)`)
} else if (dryRun) {
  console.log(`\n[DRY RUN] Would merge ${totalPatched} pages (${totalSkipped} skipped)`)
} else {
  console.log('\nNothing to merge.')
}
