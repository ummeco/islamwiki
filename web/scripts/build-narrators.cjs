#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

// Normalize variant spellings to canonical names
// Key = normalized, values = variants to merge in
const CANONICAL = {
  'Abu Huraira': ['Abu Hurairah', 'AbuHurayrah', 'Abu Hurairah (RA)', 'Abu Huraira (RA)', 'Abu Hurairah (ra)'],
  'Aisha': ["'Aisha", "'Aishah", 'Aisha, Ummul Mu\'minin', 'Aishah', 'A\'isha'],
  'Anas bin Malik': ['Anas', 'Anas ibn Malik'],
  'Ibn Abbas': ["Ibn 'Abbas", 'Abdullah ibn Abbas', "Abdullah ibn 'Abbas", 'Ibn Abbas (RA)'],
  'Ibn Umar': ["Ibn 'Umar", "'Abdullah bin 'Umar", 'Abdullah ibn Umar', "Ibn 'Umar (RA)"],
  'Ali ibn Abi Talib': ["'Ali", 'Ali ibn AbuTalib', 'Ali (RA)', 'Ali ibn Abu Talib'],
  'Jabir ibn Abdullah': ["Jabir bin 'Abdullah", 'Jabir', 'Jabir ibn Abdullah (RA)', "Jabir ibn 'Abdullah"],
  'Abdullah ibn Amr': ["'Abdullah bin 'Amr", 'Abdullah ibn Amr ibn al-\'As', "Abdullah ibn 'Amr", "'Abdullah bin 'Amr bin Al-'As"],
  'Abdullah ibn Masud': ["Abdullah ibn Mas'ud", "'Abdullah", "Ibn Mas'ud", 'Abdullah ibn Masud'],
  'Abu Musa al-Ashari': ['Abu Musa', "Abu Musa al-Ash'ari", 'Abu Musa Al-Ash\'ari'],
  'Abu Said al-Khudri': ['Abu Sa\'id Al-Khudri', 'Abu Sa\'id al-Khudri', 'Abu Said Khudri'],
  'Abu Dawud': [],
  'Umar ibn al-Khattab': ['Umar', 'Umar ibn al-Khattab', "Umar ibn al-Khat tab"],
  'Uthman ibn Affan': ['Uthman', 'Uthman ibn Affan'],
  'Nafi': ["Nafi'"],
  'Muadh ibn Jabal': ["Mu'adh ibn Jabal", "Muadh", "Mu'adh"],
  'Sahl ibn Sad': ["Sahl bin Sa'd", "Sahl ibn Sa'd"],
  'Al-Bara ibn Azib': ['Al-Bara', 'Al-Bara ibn Azib', "Al-Bara' ibn 'Azib"],
  'Abu Dharr': ["Abu Dharr al-Ghifari", "Abu Dhar"],
  'Salman al-Farsi': ['Salman', 'Salman al-Farisi'],
  'Hudhaifa ibn al-Yaman': ['Hudhaifa', 'Hudhayfah'],
  'Abu Bakr al-Siddiq': ['Abu Bakr', 'Abu Bakr (RA)', "Abu Bakr al-Siddiq"],
  'Muawiya ibn Abi Sufyan': ['Muawiya', "Mu'awiyah"],
  'Tirmidhi': [],
}

// Build reverse lookup: variant → canonical
const VARIANT_TO_CANONICAL = new Map()
for (const [canonical, variants] of Object.entries(CANONICAL)) {
  VARIANT_TO_CANONICAL.set(canonical, canonical)
  for (const v of variants) {
    VARIANT_TO_CANONICAL.set(v, canonical)
  }
}

function normalize(name) {
  return VARIANT_TO_CANONICAL.get(name) || name
}

function extractNarrator(ref) {
  if (!ref) return null
  const m = ref.match(/^Narrated ([^:]+):/)
  if (!m) return null
  return m[1].replace(/`/g, "'").trim()
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Known person slugs in scholars.json for cross-linking
const PERSON_SLUGS = {
  'Abu Huraira': 'abu-huraira',
  'Aisha': 'aisha-bint-abi-bakr',
  'Anas bin Malik': 'anas-ibn-malik',
  'Ibn Abbas': 'ibn-abbas',
  'Ibn Umar': 'ibn-umar',
  'Ali ibn Abi Talib': 'ali-ibn-abi-talib',
  'Jabir ibn Abdullah': 'jabir-ibn-abdallah',
  'Abu Bakr al-Siddiq': 'abu-bakr-al-siddiq',
  'Umar ibn al-Khattab': 'umar-ibn-al-khattab',
  'Uthman ibn Affan': 'uthman-ibn-affan',
  'Muadh ibn Jabal': 'muadh-ibn-jabal',
}

const hadithDir = path.join(__dirname, '../data/hadith')

const SKIP = new Set(['.p11-shards', 'raw', 'grades', 'all', 'sharh', 'musnad-ahmad.bak', 'books.json', 'collections.json'])

const collections = fs.readdirSync(hadithDir).filter(d => {
  if (SKIP.has(d)) return false
  const p = path.join(hadithDir, d)
  return fs.statSync(p).isDirectory()
})

// Map: canonical name → { count, perCollection: Map(colSlug, count) }
const narratorMap = new Map()

let totalProcessed = 0

for (const col of collections) {
  const colDir = path.join(hadithDir, col)
  const books = fs.readdirSync(colDir).filter(f => f.endsWith('.json'))

  for (const book of books) {
    let hadiths
    try {
      hadiths = JSON.parse(fs.readFileSync(path.join(colDir, book), 'utf8'))
    } catch {
      continue
    }
    if (!Array.isArray(hadiths)) continue

    for (const h of hadiths) {
      totalProcessed++
      const rawName = extractNarrator(h.sunnah_ref_en)
      if (!rawName) continue

      const name = normalize(rawName)
      if (!narratorMap.has(name)) {
        narratorMap.set(name, { count: 0, perCollection: new Map() })
      }
      const entry = narratorMap.get(name)
      entry.count++
      entry.perCollection.set(col, (entry.perCollection.get(col) || 0) + 1)
    }
  }
}

console.log('Total hadiths processed:', totalProcessed)
console.log('Unique narrators (normalized):', narratorMap.size)

// Sort by count
const sorted = [...narratorMap.entries()]
  .sort((a, b) => b[1].count - a[1].count)

console.log('\nTop 30 narrators (normalized):')
sorted.slice(0, 30).forEach(([name, d]) => {
  console.log(`  ${d.count.toString().padStart(5)}  ${name}`)
})

// Build final narrator objects (only include narrators with >= 3 hadiths)
const narrators = sorted
  .filter(([, d]) => d.count >= 3)
  .map(([name, d]) => ({
    name_en: name,
    slug: PERSON_SLUGS[name] || slugify(name),
    person_slug: PERSON_SLUGS[name] || null,
    hadith_count: d.count,
    collections: [...d.perCollection.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([col, count]) => ({ collection: col, count })),
  }))

const outPath = path.join(__dirname, '../data/people/narrators.json')
fs.writeFileSync(outPath, JSON.stringify(narrators, null, 2))
console.log(`\nWrote ${narrators.length} narrators to narrators.json`)
