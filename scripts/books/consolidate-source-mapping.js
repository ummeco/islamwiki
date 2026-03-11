#!/usr/bin/env node
/**
 * Consolidate all source-mapping batch files into a single source-mapping.json
 *
 * Priority order for source URLs:
 * 1. al-maktaba.org (HTML, best quality)
 * 2. shamela.ws (HTML, good quality)
 * 3. archive.org (PDF/text, acceptable)
 * 4. kalamullah.com (PDF, acceptable)
 * 5. NO-SOURCE (no source found)
 *
 * Output format: { [slug]: { source_url, source_lang, source_type, notes, batch } }
 */

const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname);
const CLASSICAL_JSON = path.join(__dirname, '../../web/data/books/classical.json');

// Load classical.json to get all canonical slugs
const classical = JSON.parse(fs.readFileSync(CLASSICAL_JSON, 'utf8'));
const canonicalSlugs = new Set(classical.map(b => b.slug));

// Priority scores for source URLs (higher = better)
function sourceScore(url, type) {
  if (!url || url === '—' || url === '-' || type === 'NO-SOURCE') return 0;
  if (url.includes('al-maktaba.org/book/')) return 5;
  if (url.includes('shamela.ws/book/')) return 4;
  if (url.includes('archive.org')) return 3;
  if (url.includes('kalamullah.com')) return 2;
  if (url.includes('islamhouse.com')) return 2;
  if (url.includes('islamway.net')) return 1;
  return 1;
}

// Parse a batch file (pipe-delimited format)
// Format: SLUG | Title | Source Lang | Source Type | Source URL | Notes
function parseBatchFile(filepath, batchName) {
  const entries = [];
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filepath} not found`);
    return entries;
  }
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('|').map(p => p.trim());
    if (parts.length < 5) continue;
    const [slug, title, lang, type, url, ...notesParts] = parts;
    const notes = notesParts.join('|').trim();
    if (!slug || slug.includes(' ')) continue; // skip if slug has spaces (malformed)
    if (!url) continue;
    entries.push({ slug, title, lang, type, url, notes, batch: batchName });
  }
  return entries;
}

// Load all batch files
const batches = [
  { file: path.join(BOOKS_DIR, 'source-mapping-batch1.md'), name: 'batch1' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch2.md'), name: 'batch2' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch3.md'), name: 'batch3' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch3-supplement.md'), name: 'batch3-supp' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch4.md'), name: 'batch4' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch5-modern.md'), name: 'batch5' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch6-gapfill.md'), name: 'batch6-gapfill' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch7-improvements.md'), name: 'batch7-improvements' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch8-101-200.md'), name: 'batch8-101-200' },
  { file: path.join(BOOKS_DIR, 'source-mapping-batch9-201-300.md'), name: 'batch9-201-300' },
];

const allEntries = [];
for (const { file, name } of batches) {
  const entries = parseBatchFile(file, name);
  console.log(`${name}: ${entries.length} entries`);
  allEntries.push(...entries);
}

// Merge by slug, keeping the highest-priority source
const merged = {};
for (const entry of allEntries) {
  const { slug, title, lang, type, url, notes, batch } = entry;
  const score = sourceScore(url, type);

  if (!merged[slug] || score > merged[slug].score) {
    merged[slug] = { slug, title, lang, source_type: type, source_url: url, notes, batch, score };
  } else if (score === merged[slug].score && url !== merged[slug].source_url) {
    // Same priority — keep existing but add alt
    const existing = merged[slug];
    if (!existing.alt_url) {
      existing.alt_url = url;
      existing.alt_notes = `${batch}: ${notes}`;
    }
  }
}

// Identify canonical slugs with no source found
const covered = new Set(Object.keys(merged));
const missing = classical.filter(b => !covered.has(b.slug));
const noSource = Object.values(merged).filter(e =>
  e.source_type === 'NO-SOURCE' || !e.source_url || e.source_url === '—'
);

console.log('\n=== CONSOLIDATION RESULTS ===');
console.log(`Total canonical slugs: ${canonicalSlugs.size}`);
console.log(`Slugs with source data: ${covered.size}`);
console.log(`Slugs with NO-SOURCE flag: ${noSource.length}`);
console.log(`Missing (no entry at all): ${missing.length}`);

if (missing.length > 0) {
  console.log('\nMissing slugs:');
  missing.forEach(b => console.log(`  ${b.slug} | ${b.title_en} | ${b.language_original}`));
}

if (noSource.length > 0) {
  console.log('\nNO-SOURCE flagged:');
  noSource.forEach(e => console.log(`  ${e.slug}`));
}

// Build the final output object (remove score field)
const output = {};
for (const [slug, entry] of Object.entries(merged)) {
  const { score, ...clean } = entry;
  output[slug] = clean;
}

// Add stub entries for completely missing slugs
for (const book of missing) {
  output[book.slug] = {
    slug: book.slug,
    title: book.title_en,
    lang: book.language_original,
    source_type: 'NO-SOURCE',
    source_url: null,
    notes: `MISSING: not found in any batch file. Lang: ${book.language_original}`,
    batch: 'none',
  };
}

// Apply hard overrides from corrections.json (highest priority — fixes known wrong IDs)
const correctionsPath = path.join(BOOKS_DIR, 'source-mapping-corrections.json');
if (fs.existsSync(correctionsPath)) {
  const corrections = JSON.parse(fs.readFileSync(correctionsPath, 'utf8'));
  let correctionCount = 0;
  for (const [slug, fix] of Object.entries(corrections)) {
    if (slug.startsWith('_')) continue; // skip meta keys
    if (output[slug]) {
      const prev = output[slug].source_url;
      output[slug] = { ...output[slug], ...fix, batch: 'corrections', prev_url: prev };
    } else {
      output[slug] = { slug, ...fix, batch: 'corrections' };
    }
    correctionCount++;
  }
  console.log(`\nApplied ${correctionCount} hard corrections from source-mapping-corrections.json`);
}

// Write output
const outPath = path.join(BOOKS_DIR, 'source-mapping.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nWrote ${Object.keys(output).length} entries to source-mapping.json`);

// Summary stats
const byType = {};
for (const entry of Object.values(output)) {
  const key = entry.source_type || 'unknown';
  byType[key] = (byType[key] || 0) + 1;
}
console.log('\nBy source type:');
Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  console.log(`  ${k}: ${v}`);
});

const byHost = {};
for (const entry of Object.values(output)) {
  let host = 'none';
  if (entry.source_url) {
    if (entry.source_url.includes('al-maktaba.org')) host = 'al-maktaba.org';
    else if (entry.source_url.includes('shamela.ws')) host = 'shamela.ws';
    else if (entry.source_url.includes('archive.org')) host = 'archive.org';
    else if (entry.source_url.includes('kalamullah.com')) host = 'kalamullah.com';
    else if (entry.source_url.includes('islamhouse.com')) host = 'islamhouse.com';
    else host = 'other';
  }
  byHost[host] = (byHost[host] || 0) + 1;
}
console.log('\nBy host:');
Object.entries(byHost).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  console.log(`  ${k}: ${v}`);
});
