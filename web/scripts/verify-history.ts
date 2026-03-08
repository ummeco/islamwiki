/**
 * History data integrity verification script.
 * Run: npx tsx scripts/verify-history.ts
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SEERAH_DIR = join(__dirname, '..', 'data', 'seerah')
const CONTENT_DIR = join(SEERAH_DIR, 'content')

interface SeerahEvent {
  id: number
  slug: string
  title_en: string
  title_ar: string
  description_en: string
  year_ah?: number | null
  date_ah?: string | null
  place_name?: string | null
  place_lat?: number | null
  place_lng?: number | null
}

const PERIODS = [
  'Rashidun Caliphate',
  'Umayyad Dynasty',
  'Abbasid Dynasty',
  'Crusades Era',
  'Mongol Invasions',
  'Mamluk Sultanate',
  'Ottoman Empire',
  'Colonial Era',
  'Modern Era',
  'Contemporary',
]

function inferPeriod(yearAh: number | undefined | null): string {
  if (yearAh == null) return 'Unknown'
  if (yearAh <= 40) return 'Rashidun Caliphate'
  if (yearAh <= 132) return 'Umayyad Dynasty'
  if (yearAh <= 656) return 'Abbasid Dynasty'
  if (yearAh <= 690) return 'Crusades Era'
  if (yearAh <= 784) return 'Mamluk Sultanate'
  if (yearAh <= 1342) return 'Ottoman Empire'
  if (yearAh <= 1400) return 'Colonial Era'
  return 'Modern Era'
}

function verify(): void {
  const eventsPath = join(SEERAH_DIR, 'events.json')
  if (!existsSync(eventsPath)) {
    console.error('Missing data/seerah/events.json')
    process.exit(1)
  }

  const allEvents: SeerahEvent[] = JSON.parse(readFileSync(eventsPath, 'utf-8'))
  // History events: year_ah > 11 (post-Prophetic)
  const historyEvents = allEvents.filter((e) => e.year_ah == null || e.year_ah > 11)

  console.log(`\n=== History Data Verification ===\n`)
  console.log(`Total seerah events: ${allEvents.length}`)
  console.log(`History events (year_ah > 11 or null): ${historyEvents.length}`)

  // Chronology check
  let chronoErrors = 0
  for (let i = 1; i < historyEvents.length; i++) {
    const prev = historyEvents[i - 1]
    const curr = historyEvents[i]
    if (prev.year_ah != null && curr.year_ah != null && curr.year_ah < prev.year_ah) {
      chronoErrors++
      if (chronoErrors <= 5) {
        console.log(`  Chronology issue: "${prev.title_en}" (${prev.year_ah} AH) before "${curr.title_en}" (${curr.year_ah} AH)`)
      }
    }
  }
  console.log(`Chronology errors: ${chronoErrors}`)

  // Period distribution
  const periodCounts: Record<string, number> = {}
  PERIODS.forEach((p) => (periodCounts[p] = 0))
  periodCounts['Unknown'] = 0

  historyEvents.forEach((e) => {
    const period = inferPeriod(e.year_ah)
    periodCounts[period] = (periodCounts[period] || 0) + 1
  })

  console.log(`\nPeriod distribution:`)
  for (const [period, count] of Object.entries(periodCounts)) {
    if (count > 0) console.log(`  ${period}: ${count}`)
  }

  // Content file check
  let withContent = 0
  let withoutContent = 0
  const missingContent: string[] = []

  historyEvents.forEach((e) => {
    const contentPath = join(CONTENT_DIR, `${e.slug}.md`)
    if (existsSync(contentPath)) {
      const content = readFileSync(contentPath, 'utf-8')
      if (content.trim().length > 100) {
        withContent++
      } else {
        withoutContent++
        missingContent.push(e.slug)
      }
    } else {
      withoutContent++
      missingContent.push(e.slug)
    }
  })

  console.log(`\nContent coverage:`)
  console.log(`  With content: ${withContent} (${((withContent / historyEvents.length) * 100).toFixed(1)}%)`)
  console.log(`  Without content: ${withoutContent}`)

  // Data quality
  const withDates = historyEvents.filter((e) => e.year_ah != null).length
  const withPlaces = historyEvents.filter((e) => e.place_name).length
  const withCoords = historyEvents.filter((e) => e.place_lat != null && e.place_lng != null).length
  const withArabic = historyEvents.filter((e) => e.title_ar).length

  console.log(`\nData quality:`)
  console.log(`  With year_ah: ${withDates} (${((withDates / historyEvents.length) * 100).toFixed(1)}%)`)
  console.log(`  With place_name: ${withPlaces} (${((withPlaces / historyEvents.length) * 100).toFixed(1)}%)`)
  console.log(`  With coordinates: ${withCoords} (${((withCoords / historyEvents.length) * 100).toFixed(1)}%)`)
  console.log(`  With Arabic title: ${withArabic} (${((withArabic / historyEvents.length) * 100).toFixed(1)}%)`)

  console.log(`\n=== Verification Complete ===\n`)

  if (chronoErrors > 0) {
    console.log(`WARNING: ${chronoErrors} chronology issues found`)
  }
}

verify()
