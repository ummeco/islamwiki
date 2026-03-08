/**
 * Hadith data integrity verification script.
 * Run: npx tsx scripts/verify-hadith.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(__dirname, '..', 'data', 'hadith')

interface VerifyResult {
  collection: string
  books: number
  totalHadiths: number
  withArabic: number
  withEnglish: number
  withGrade: number
  emptyBooks: string[]
  missingFiles: string[]
  errors: string[]
}

function verify(): void {
  const collectionsPath = join(DATA_DIR, 'collections.json')
  const booksPath = join(DATA_DIR, 'books.json')

  if (!existsSync(collectionsPath) || !existsSync(booksPath)) {
    console.error('Missing collections.json or books.json')
    process.exit(1)
  }

  const collections = JSON.parse(readFileSync(collectionsPath, 'utf-8')) as Array<{
    id: number; slug: string; name_en: string; total_hadiths: number
  }>
  const allBooks = JSON.parse(readFileSync(booksPath, 'utf-8')) as Array<{
    id: number; collection_id: number; number: number; slug: string; name_en: string;
    hadith_count: number; file?: string
  }>

  const results: VerifyResult[] = []
  let totalErrors = 0

  for (const col of collections) {
    const result: VerifyResult = {
      collection: col.name_en,
      books: 0,
      totalHadiths: 0,
      withArabic: 0,
      withEnglish: 0,
      withGrade: 0,
      emptyBooks: [],
      missingFiles: [],
      errors: [],
    }

    const colBooks = allBooks.filter((b) => b.collection_id === col.id)
    result.books = colBooks.length

    const colDir = join(DATA_DIR, col.slug)
    if (!existsSync(colDir)) {
      result.errors.push(`Directory missing: ${col.slug}/`)
      results.push(result)
      totalErrors++
      continue
    }

    const existingFiles = new Set(readdirSync(colDir).filter((f) => f.endsWith('.json')))

    for (const book of colBooks) {
      const fileName = book.file ?? `${String(book.number).padStart(3, '0')}.json`
      if (!existingFiles.has(fileName)) {
        result.missingFiles.push(fileName)
        continue
      }

      try {
        const data = JSON.parse(readFileSync(join(colDir, fileName), 'utf-8')) as Array<{
          n?: number; ar?: string; iwh_en?: string; sunnah_ref_en?: string; grade?: string
        }>

        if (data.length === 0) {
          result.emptyBooks.push(`${fileName} (${book.name_en})`)
        }

        result.totalHadiths += data.length
        for (const h of data) {
          if (h.ar && h.ar.trim()) result.withArabic++
          if ((h.iwh_en && h.iwh_en.trim()) || (h.sunnah_ref_en && h.sunnah_ref_en.trim())) result.withEnglish++
          if (h.grade && h.grade.trim()) result.withGrade++
        }
      } catch (e) {
        result.errors.push(`Parse error: ${fileName}: ${e}`)
        totalErrors++
      }
    }

    // Check declared count vs actual
    if (result.totalHadiths !== col.total_hadiths) {
      result.errors.push(`Count mismatch: declared ${col.total_hadiths}, found ${result.totalHadiths}`)
    }

    results.push(result)
  }

  // Print report
  console.log('\n=== HADITH DATA INTEGRITY REPORT ===\n')

  for (const r of results) {
    const arPct = r.totalHadiths ? Math.round((r.withArabic / r.totalHadiths) * 100) : 0
    const enPct = r.totalHadiths ? Math.round((r.withEnglish / r.totalHadiths) * 100) : 0
    const grPct = r.totalHadiths ? Math.round((r.withGrade / r.totalHadiths) * 100) : 0

    console.log(`${r.collection}`)
    console.log(`  Books: ${r.books} | Hadiths: ${r.totalHadiths}`)
    console.log(`  Arabic: ${arPct}% | English: ${enPct}% | Graded: ${grPct}%`)

    if (r.missingFiles.length > 0) {
      console.log(`  MISSING FILES: ${r.missingFiles.join(', ')}`)
    }
    if (r.emptyBooks.length > 0) {
      console.log(`  EMPTY BOOKS: ${r.emptyBooks.join(', ')}`)
    }
    if (r.errors.length > 0) {
      for (const err of r.errors) console.log(`  ERROR: ${err}`)
    }
    console.log()
  }

  const totalHadiths = results.reduce((s, r) => s + r.totalHadiths, 0)
  const totalArabic = results.reduce((s, r) => s + r.withArabic, 0)
  const totalEnglish = results.reduce((s, r) => s + r.withEnglish, 0)

  console.log('=== SUMMARY ===')
  console.log(`Collections: ${results.length}`)
  console.log(`Total hadiths: ${totalHadiths.toLocaleString()}`)
  console.log(`Arabic coverage: ${Math.round((totalArabic / totalHadiths) * 100)}%`)
  console.log(`English coverage: ${Math.round((totalEnglish / totalHadiths) * 100)}%`)
  console.log(`Errors: ${totalErrors}`)

  if (totalErrors > 0) process.exit(1)
}

verify()
