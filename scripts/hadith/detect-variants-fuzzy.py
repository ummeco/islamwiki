#!/usr/bin/env python3
"""
FEAT-2 Phase B: Fuzzy near-duplicate detection across hadith collections.

Finds hadiths with the same meaning expressed in slightly different wording
(riwayah bil-ma'na — narration by meaning). These are called "variants" (turuq).

Method:
1. Normalize Arabic text (strip tashkeel, normalize alef, remove tatweel)
2. Extract word set + first-10-word key for each hadith
3. Group hadiths sharing same narrator + similar first-10-word signature
4. Within groups: compute Jaccard word-set similarity
5. Similarity > 0.65 across different collections → variant

Also identifies muttafaq 'alayhi (Bukhari+Muslim) pairs specifically.

Usage:
    cd /Users/admin/Sites/ummeco/islamwiki
    python3 scripts/hadith/detect-variants-fuzzy.py

Runtime: ~5-15 minutes for all 70k hadiths (word-set approach is O(n) per group).
"""
import json, os, re, hashlib
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../web/data')
HADITH_DIR = os.path.join(DATA_DIR, 'hadith')

COLLECTIONS = ['bukhari', 'muslim', 'abu-dawud', 'tirmidhi', 'nasai', 'ibn-majah',
               'muwatta', 'darimi', 'musnad-ahmad', 'riyadh-salihin', 'bulugh-maram', 'shamail']

TASHKEEL = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]')
ALEF = re.compile(r'[أإآٱ]')
TATWEEL = re.compile(r'\u0640')
# Common Arabic stop words to exclude from similarity comparison
STOP_WORDS = {
    'و', 'في', 'من', 'إلى', 'على', 'عن', 'أن', 'إن', 'ما', 'لا', 'هو', 'هي',
    'ان', 'قال', 'قالت', 'كان', 'كانت', 'ثم', 'هذا', 'هذه', 'التي', 'الذي',
    'بن', 'عن', 'له', 'لها', 'بـ', 'لـ',
}
# Minimum similarity to call variants
VARIANT_THRESHOLD = 0.65
# Minimum text length to consider
MIN_TEXT_LEN = 30


def normalize(text: str) -> str:
    if not text or not isinstance(text, str):
        return ''
    t = TASHKEEL.sub('', text)
    t = ALEF.sub('ا', t)
    t = TATWEEL.sub('', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def word_set(text: str) -> frozenset:
    """Return set of meaningful words (excluding stop words)."""
    words = normalize(text).split()
    return frozenset(w for w in words if w not in STOP_WORDS and len(w) > 2)


def first_n_words_key(text: str, n: int = 8) -> str:
    """First N words after normalization — used for rough grouping."""
    words = normalize(text).split()
    return ' '.join(words[:n])


def jaccard(a: frozenset, b: frozenset) -> float:
    if not a or not b:
        return 0.0
    intersection = len(a & b)
    union = len(a | b)
    return intersection / union if union > 0 else 0.0


def extract_narrator(hadith: dict) -> str:
    """Extract the main narrator (sahabah) from isnad or sunnah_ref_en."""
    # Try isnad_chain first
    chain = hadith.get('isnad_chain', [])
    if chain:
        # Last item in chain is typically the sahabah narrator (closest to Prophet)
        return normalize(chain[-1]) if chain else ''
    # Fallback: sunnah_ref_en often contains narrator name
    ref = hadith.get('sunnah_ref_en', '') or hadith.get('narrator_en', '')
    if ref:
        # Extract first word or two
        return normalize(ref.split(',')[0][:30])
    return ''


# ─── Load all hadiths ───────────────────────────────────────────────────────

print('Loading all hadiths...')
all_hadiths = {}  # iw_id → {coll, book, path, words, first_key, narrator}

for coll in COLLECTIONS:
    d = os.path.join(HADITH_DIR, coll)
    if not os.path.isdir(d):
        continue
    for fname in sorted(os.listdir(d)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(d, fname)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(data, list):
            continue
        for h in data:
            if not isinstance(h, dict):
                continue
            iw_id = h.get('iw_id', '')
            if not iw_id:
                continue
            matn = h.get('matn_ar_clean') or h.get('matn_ar') or h.get('ar', '')
            norm = normalize(matn)
            if len(norm) < MIN_TEXT_LEN:
                continue
            words = word_set(norm)
            first_key = first_n_words_key(norm)
            narrator = extract_narrator(h)
            all_hadiths[iw_id] = {
                'coll': coll,
                'book': fname,
                'path': path,
                'words': words,
                'first_key': first_key,
                'narrator': narrator,
            }

print(f'Loaded {len(all_hadiths)} hadiths with meaningful Arabic text')

# ─── Group by first-8-word key ──────────────────────────────────────────────

print('Grouping by first-8-word signature...')
first_key_groups = defaultdict(list)  # first_key → [iw_id, ...]
for iw_id, data in all_hadiths.items():
    key = data['first_key']
    if key:
        first_key_groups[key].append(iw_id)

# Find groups with multiple hadiths from different collections
candidate_groups = {k: v for k, v in first_key_groups.items()
                    if len(v) > 1 and len(set(all_hadiths[i]['coll'] for i in v)) > 1}
print(f'Candidate groups (multiple collections, same opening): {len(candidate_groups)}')

# ─── Compute variants within each candidate group ───────────────────────────

print('Computing Jaccard similarity within candidate groups...')
id_to_variants = defaultdict(set)  # iw_id → set of variant iw_ids
variant_pairs = 0

for first_key, ids in candidate_groups.items():
    if len(ids) > 50:
        # Skip extremely large groups (very common opening phrases) — too slow
        continue
    # Pairwise comparison within group
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            id_a, id_b = ids[i], ids[j]
            coll_a = all_hadiths[id_a]['coll']
            coll_b = all_hadiths[id_b]['coll']
            if coll_a == coll_b:
                continue  # Skip same-collection pairs
            sim = jaccard(all_hadiths[id_a]['words'], all_hadiths[id_b]['words'])
            if sim >= VARIANT_THRESHOLD:
                id_to_variants[id_a].add(id_b)
                id_to_variants[id_b].add(id_a)
                variant_pairs += 1

print(f'Variant pairs found: {variant_pairs}')
print(f'Hadiths with variants: {len(id_to_variants)}')

# ─── Count muttafaq 'alayhi ─────────────────────────────────────────────────

muttafaq = 0
for iw_id, variants in id_to_variants.items():
    if all_hadiths[iw_id]['coll'] == 'bukhari':
        if any(all_hadiths[v]['coll'] == 'muslim' for v in variants):
            muttafaq += 1

print(f"Muttafaq 'alayhi (Bukhari+Muslim variant pairs): {muttafaq}")

# ─── Write variants[] to hadith files ───────────────────────────────────────

if variant_pairs == 0:
    print('No variants found — skipping write phase')
else:
    print('Writing variants[] to hadith files...')
    # Group by path
    from collections import defaultdict as dd
    path_to_updates = dd(dict)  # path → {iw_id: [variant_ids]}
    for iw_id, variant_ids in id_to_variants.items():
        path = all_hadiths[iw_id]['path']
        path_to_updates[path][iw_id] = sorted(variant_ids)

    updated_hadiths = 0
    for path, updates in path_to_updates.items():
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(data, list):
            continue
        changed = False
        for h in data:
            if not isinstance(h, dict):
                continue
            iw_id = h.get('iw_id', '')
            if iw_id in updates:
                existing = set(h.get('variants', []))
                new_variants = set(updates[iw_id])
                merged = sorted(existing | new_variants)
                if set(merged) != existing:
                    h['variants'] = merged
                    updated_hadiths += 1
                    changed = True
        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write('\n')

    print(f'Updated {updated_hadiths} hadiths with variants[]')

# ─── Sample output ───────────────────────────────────────────────────────────

print('\nSample variant groups:')
shown = 0
for iw_id, variants in list(id_to_variants.items())[:10]:
    coll = all_hadiths[iw_id]['coll']
    variant_colls = [all_hadiths[v]['coll'] for v in list(variants)[:3]]
    print(f'  {iw_id} ({coll}) ↔ {list(variants)[:3]} ({variant_colls})')
    shown += 1
    if shown >= 5:
        break
