/**
 * build-quran-refs.ts
 *
 * Scans all 70k hadiths for Quran verse citations and populates the `quran_refs` array.
 * Looks in both `iwh_en` (English text) and `matn_ar` (Arabic text).
 *
 * Citation patterns detected:
 *   English: "2:255", "Surah Al-Baqarah, verse 255", "Q2:255", "(2:255)"
 *   Arabic: (various Unicode Arabic patterns)
 *
 * Output: patches each collection's JSON files with a `quran_refs` array.
 * Format: [{ surah: 2, ayah: 255 }]
 *
 * Usage: npx tsx scripts/hadith/build-quran-refs.ts [--collection bukhari] [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'web/data')
const HADITH_DIR = join(DATA_DIR, 'hadith')

interface QuranRef {
  surah: number
  ayah: number
}

interface HadithEntry {
  id: number
  number: number
  iwh_en?: string
  matn_ar?: string
  quran_refs?: QuranRef[]
  [key: string]: unknown
}

// Surah name → number lookup (abbreviated — top 30 most cited)
const SURAH_NAME_MAP: Record<string, number> = {
  'al-fatiha': 1, fatiha: 1, 'al-baqarah': 2, baqarah: 2,
  'al-imran': 3, imran: 3, 'an-nisa': 4, nisa: 4,
  'al-maidah': 5, maidah: 5, 'al-anam': 6, 'al-araf': 7,
  'al-anfal': 8, 'at-tawbah': 9, tawbah: 9, yunus: 10,
  yusuf: 12, ibrahim: 14, 'al-isra': 17, 'al-kahf': 18,
  'ta-ha': 20, 'al-nur': 24, 'al-furqan': 25, 'yasin': 36,
  'ya-sin': 36, 'as-saffat': 37, 'al-zumar': 39, ghafir: 40,
  'al-fath': 48, 'al-hujurat': 49, 'ar-rahman': 55, 'al-waqiah': 56,
  'al-mulk': 67, 'al-qalam': 68, 'al-muzzammil': 73, 'al-muddaththir': 74,
  'al-qiyamah': 75, 'an-naba': 78, 'al-naziat': 79, 'abasa': 80,
  'al-infitar': 82, 'al-ghashiyah': 88, 'al-fajr': 89, 'al-balad': 90,
  'ash-shams': 91, 'al-layl': 92, 'ad-duha': 93, 'ash-sharh': 94,
  'al-alaq': 96, 'al-qadr': 97, 'az-zalzalah': 99, 'al-adiyat': 100,
  'al-asr': 103, 'al-fil': 105, 'al-kawthar': 108, 'al-ikhlas': 112,
  'ikhlas': 112, 'al-falaq': 113, 'an-nas': 114,
}

// ── Extract Quran references from English text ──

const EN_PATTERNS = [
  // Bare reference: "2:255", "(2:255)", "[2:255]"
  /[\[(]?(\d{1,3}):(\d{1,3})[\])]?/g,
  // Q notation: "Q2:255", "Quran 2:255"
  /(?:Q|Quran\s+)(\d{1,3}):(\d{1,3})/gi,
  // Chapter X verse Y
  /[Cc]hapter\s+(\d{1,3})[,\s]+[Vv]erse\s+(\d{1,3})/g,
  // Surah name, verse N — covered by name lookup below
]

function extractFromEnglish(text: string): QuranRef[] {
  const refs: QuranRef[] = []

  for (const pattern of EN_PATTERNS) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const surah = parseInt(match[1])
      const ayah = parseInt(match[2])
      if (surah >= 1 && surah <= 114 && ayah >= 1) {
        refs.push({ surah, ayah })
      }
    }
  }

  // Surah name mentions: "Surah Al-Baqarah verse 255" or "Al-Baqarah:255"
  const namePattern = /(?:Surah\s+)?([A-Za-z'-]+)[,\s]+[Vv]erse\s+(\d{1,3})/g
  let match: RegExpExecArray | null
  while ((match = namePattern.exec(text)) !== null) {
    const name = match[1].toLowerCase().replace(/^al-?/, 'al-')
    const surahNum = SURAH_NAME_MAP[name] ?? SURAH_NAME_MAP[name.replace(/^al-/, '')]
    const ayah = parseInt(match[2])
    if (surahNum && ayah >= 1) {
      refs.push({ surah: surahNum, ayah })
    }
  }

  return refs
}

// ── Deduplicate refs ──

function dedupeRefs(refs: QuranRef[]): QuranRef[] {
  const seen = new Set<string>()
  return refs.filter((r) => {
    const key = `${r.surah}:${r.ayah}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Process a single hadith book file ──

function processBookFile(filePath: string, dryRun: boolean): number {
  const raw = readFileSync(filePath, 'utf8')
  const hadiths: HadithEntry[] = JSON.parse(raw)
  let patched = 0

  const updated = hadiths.map((h) => {
    // Skip if already populated
    if (h.quran_refs && h.quran_refs.length > 0) return h

    const refs: QuranRef[] = []
    if (h.iwh_en) refs.push(...extractFromEnglish(h.iwh_en))
    // matn_ar: Arabic pattern extraction (basic — surah:ayah numerals)
    if (h.matn_ar) {
      const arabicNumPattern = /(\d{1,3}):(\d{1,3})/g
      let m: RegExpExecArray | null
      while ((m = arabicNumPattern.exec(h.matn_ar)) !== null) {
        const s = parseInt(m[1])
        const a = parseInt(m[2])
        if (s >= 1 && s <= 114 && a >= 1) refs.push({ surah: s, ayah: a })
      }
    }

    const deduped = dedupeRefs(refs)
    if (deduped.length === 0) return h

    patched++
    return { ...h, quran_refs: deduped }
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
      console.log(`  ${collection}: ${collectionPatched} hadiths with Quran refs found`)
    }
    totalPatched += collectionPatched
  }

  console.log(`\nTotal: ${totalPatched} hadiths${dryRun ? ' would be' : ''} updated with quran_refs`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
