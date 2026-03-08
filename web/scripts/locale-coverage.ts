/**
 * Locale coverage tracker.
 * Scans message files and reports translation completeness.
 * Run: npx tsx scripts/locale-coverage.ts
 * Output: data/.locale-coverage.json
 */

import fs from 'fs'
import path from 'path'

const MESSAGES_DIR = path.join(__dirname, '../lib/i18n/messages')
const OUTPUT = path.join(__dirname, '../data/.locale-coverage.json')

interface CoverageEntry {
  locale: string
  totalKeys: number
  translatedKeys: number
  missingKeys: string[]
  percentage: number
}

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function getValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

const enPath = path.join(MESSAGES_DIR, 'en.json')
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
const allKeys = flattenKeys(en)

const localeFiles = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json'))
const coverage: CoverageEntry[] = []

for (const file of localeFiles) {
  const locale = file.replace('.json', '')
  const messages = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf-8'))
  const missingKeys: string[] = []

  for (const key of allKeys) {
    const value = getValue(messages, key)
    if (typeof value !== 'string' || value.trim().length === 0) {
      missingKeys.push(key)
    }
  }

  const translatedKeys = allKeys.length - missingKeys.length
  coverage.push({
    locale,
    totalKeys: allKeys.length,
    translatedKeys,
    missingKeys: locale === 'en' ? [] : missingKeys,
    percentage: Math.round((translatedKeys / allKeys.length) * 100),
  })
}

fs.writeFileSync(OUTPUT, JSON.stringify(coverage, null, 2))

console.log('\nLocale Coverage Report:')
console.log('='.repeat(50))
for (const entry of coverage) {
  console.log(`  ${entry.locale}: ${entry.percentage}% (${entry.translatedKeys}/${entry.totalKeys})`)
  if (entry.missingKeys.length > 0) {
    console.log(`    Missing: ${entry.missingKeys.join(', ')}`)
  }
}
console.log(`\nWritten to ${OUTPUT}`)
