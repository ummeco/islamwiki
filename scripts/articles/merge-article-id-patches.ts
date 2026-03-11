/**
 * merge-article-id-patches.ts
 *
 * Merges article-content-id-patch-*.json files into articles.json.
 * Each patch file maps: { slug: { title_id, excerpt_id, content_id } }
 *
 * Usage: npx tsx scripts/articles/merge-article-id-patches.ts [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ARTICLES_FILE = join(process.cwd(), 'web/data/articles/articles.json')
const PATCH_DIR = join(process.cwd(), 'web/data/articles')

const dryRun = process.argv.includes('--dry-run')

interface Article {
  id: number
  slug: string
  title: string
  title_id?: string
  excerpt?: string
  excerpt_id?: string
  content?: string
  content_id?: string
  [key: string]: unknown
}

interface IdPatch {
  title_id?: string
  excerpt_id?: string
  content_id?: string
}

const articles: Article[] = JSON.parse(readFileSync(ARTICLES_FILE, 'utf8'))
const articleMap = new Map(articles.map((a) => [a.slug, a]))

let totalPatched = 0
let totalSkipped = 0

const patchFiles = readdirSync(PATCH_DIR)
  .filter((f) => f.startsWith('article-content-id-patch-') && f.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('No ID patch files found in', PATCH_DIR)
  process.exit(0)
}

for (const file of patchFiles) {
  const patchPath = join(PATCH_DIR, file)
  let patch: Record<string, IdPatch>
  try {
    patch = JSON.parse(readFileSync(patchPath, 'utf8'))
  } catch (e) {
    console.error(`  ${file}: INVALID JSON — ${e}`)
    continue
  }

  let batchPatched = 0
  for (const [slug, idData] of Object.entries(patch)) {
    const article = articleMap.get(slug)
    if (!article) {
      console.warn(`  ${file}: slug "${slug}" not found — skipping`)
      totalSkipped++
      continue
    }

    let changed = false

    if (idData.title_id && idData.title_id.trim().length > 5) {
      article.title_id = idData.title_id.trim()
      changed = true
    }
    if (idData.excerpt_id && idData.excerpt_id.trim().length > 10) {
      article.excerpt_id = idData.excerpt_id.trim()
      changed = true
    }
    if (idData.content_id && idData.content_id.replace(/<[^>]*>/g, '').trim().length > 100) {
      article.content_id = idData.content_id.trim()
      changed = true
    }

    if (changed) {
      batchPatched++
      totalPatched++
    } else {
      totalSkipped++
    }
  }

  console.log(`  ${file}: ${batchPatched} articles updated`)
}

if (!dryRun && totalPatched > 0) {
  writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2))
  console.log(`\nMerged Indonesian translations for ${totalPatched} articles (${totalSkipped} skipped)`)
} else if (dryRun) {
  console.log(`\n[DRY RUN] Would merge ${totalPatched} articles (${totalSkipped} skipped)`)
} else {
  console.log('\nNothing to merge.')
}
