#!/usr/bin/env node
/**
 * Enrich web/data/books/classical.json with:
 *  - source_url_primary, source_type, source_status (from source-mapping.json)
 *  - category_primary, category_secondary (from category-assignments.json)
 *  - canonical, canonical_slug (from category-assignments.json)
 *  - subject field fixes: quran-sciences → quran_sciences, spirituality → ethics
 *
 * Run: node scripts/books/enrich-classical.js
 */

const fs = require('fs');
const path = require('path');

const CLASSICAL_PATH  = path.join(__dirname, '../../web/data/books/classical.json');
const SOURCE_MAP_PATH = path.join(__dirname, 'source-mapping.json');
const CAT_PATH        = path.join(__dirname, 'category-assignments.json');

// --------------------------------------------------------------------------
// Load inputs
// --------------------------------------------------------------------------
const classical   = JSON.parse(fs.readFileSync(CLASSICAL_PATH, 'utf8'));
const sourceMap   = JSON.parse(fs.readFileSync(SOURCE_MAP_PATH, 'utf8'));
const categories  = JSON.parse(fs.readFileSync(CAT_PATH, 'utf8'));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function deriveSourceStatus(entry) {
  if (!entry) return 'no-source';
  if (entry.source_type === 'NO-SOURCE' || !entry.source_url) return 'no-source';
  if (entry.notes && entry.notes.includes('VERIFY')) return 'verify';
  return 'confirmed';
}

function fixSubject(subject) {
  if (subject === 'quran-sciences') return 'quran_sciences';
  if (subject === 'spirituality')   return 'ethics';
  return subject;
}

// --------------------------------------------------------------------------
// Stats
// --------------------------------------------------------------------------
let subjectFixes   = 0;
let sourceAdded    = 0;
let categoryAdded  = 0;
let noSource       = 0;
let verifyCount    = 0;

// --------------------------------------------------------------------------
// Enrich
// --------------------------------------------------------------------------
const enriched = classical.map(book => {
  const slug    = book.slug;

  // Fix subject inconsistencies
  const fixedSubject = fixSubject(book.subject);
  if (fixedSubject !== book.subject) subjectFixes++;

  // Source data
  const srcEntry = sourceMap[slug];
  let source_url_primary = srcEntry ? (srcEntry.source_url || null) : null;
  let source_type        = srcEntry ? (srcEntry.source_type || null) : null;
  let source_status      = deriveSourceStatus(srcEntry);

  // Normalise NO-SOURCE source_url
  if (source_url_primary === '—' || source_url_primary === '-') source_url_primary = null;
  if (source_type === 'NO-SOURCE') source_type = null;

  if (source_status === 'no-source') noSource++;
  if (source_status === 'verify')    verifyCount++;
  if (source_url_primary)            sourceAdded++;

  // Category data
  const cat = categories[slug];
  let category_primary   = cat ? cat.primary   : null;
  let category_secondary = cat ? cat.secondary : null;
  let canonical          = cat ? cat.canonical  : true;
  let canonical_slug     = cat ? cat.canonical_slug : null;

  if (category_primary) categoryAdded++;

  return {
    ...book,
    subject:           fixedSubject,
    source_url_primary,
    source_type,
    source_status,
    category_primary,
    category_secondary,
    canonical,
    canonical_slug,
  };
});

// --------------------------------------------------------------------------
// Write output
// --------------------------------------------------------------------------
fs.writeFileSync(CLASSICAL_PATH, JSON.stringify(enriched, null, 2));

// --------------------------------------------------------------------------
// Report
// --------------------------------------------------------------------------
console.log('=== ENRICH CLASSICAL.JSON COMPLETE ===');
console.log(`Total books: ${enriched.length}`);
console.log(`Subject fixes applied: ${subjectFixes}`);
console.log(`Books with source URL: ${sourceAdded}`);
console.log(`Books with category: ${categoryAdded}`);
console.log(`  - no-source: ${noSource}`);
console.log(`  - verify: ${verifyCount}`);
console.log(`  - confirmed: ${sourceAdded - verifyCount}`);
console.log(`Non-canonical (aliases): ${enriched.filter(b => !b.canonical).length}`);
console.log(`Written to: ${CLASSICAL_PATH}`);

// Category distribution
const byCat = {};
enriched.forEach(b => {
  const p = b.category_primary || 'unknown';
  byCat[p] = (byCat[p] || 0) + 1;
});
console.log('\nBy category:');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
  console.log(`  ${String(n).padStart(4)}  ${cat}`);
});

// Source type distribution
const byType = {};
enriched.forEach(b => {
  const t = b.source_type || 'none';
  byType[t] = (byType[t] || 0) + 1;
});
console.log('\nBy source type:');
Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
  console.log(`  ${String(n).padStart(4)}  ${t}`);
});
