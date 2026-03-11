/**
 * merge-article-patches.ts
 *
 * Merges article-content-patch-*.json files into articles.json.
 * Each patch file maps { slug: htmlContent }.
 *
 * Usage: npx tsx scripts/articles/merge-article-patches.ts [--dry-run]
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
  content: string
  [key: string]: unknown
}

const articles: Article[] = JSON.parse(readFileSync(ARTICLES_FILE, 'utf8'))
const articleMap = new Map(articles.map((a) => [a.slug, a]))

let totalPatched = 0
let totalSkipped = 0

const patchFiles = readdirSync(PATCH_DIR)
  .filter((f) => f.startsWith('article-content-patch-') && f.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('No patch files found in', PATCH_DIR)
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
  for (const [slug, content] of Object.entries(patch)) {
    const article = articleMap.get(slug)
    if (!article) {
      console.warn(`  ${file}: slug "${slug}" not found — skipping`)
      totalSkipped++
      continue
    }
    if (!content || content.trim().length < 100) {
      totalSkipped++
      continue
    }
    const existingWords = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    const newWords = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    if (newWords > existingWords) {
      article.content = content
      article.updated_at = new Date().toISOString().split('T')[0]
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
  console.log(`\nMerged ${totalPatched} articles (${totalSkipped} skipped)`)
} else {
  console.log(`\n[DRY RUN] Would merge ${totalPatched} articles (${totalSkipped} skipped)`)
}
