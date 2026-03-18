#!/usr/bin/env python3
"""
D1.1: Detect and flag muttafaq 'alayhi hadiths (agreed upon by Bukhari AND Muslim).

A hadith is muttafaq 'alayhi when it appears in BOTH Sahih al-Bukhari AND Sahih Muslim.
This script uses two complementary passes:

  Pass 1 — duplicates[] field cross-reference:
    For every Bukhari hadith, check if any of its `duplicates[]` IWH IDs belong to
    a Muslim hadith (using the iw-id-map.json reverse lookup). If yes → muttafaq.

  Pass 2 — Jaccard text similarity (≥0.85 on Arabic matn tokens):
    Build word-set indexes for all Bukhari and Muslim hadiths. For pairs not already
    linked via duplicates[], do a candidate search using first-8-word key bucketing
    and compute Jaccard on the matn tokens. Similarity ≥ 0.85 → muttafaq.

Output:
  - Sets `muttafaq_alayhi: true` on matching hadiths in BOTH collections.
  - Saves modified JSON files in place.
  - Prints statistics per pass and overall.

Usage:
    cd /Users/admin/Sites/ummeco/islamwiki
    python3 scripts/hadith/detect-muttafaq-alayhi.py

Runtime: ~1–3 minutes (Pass 1 is near-instant; Pass 2 indexes ~15k hadiths).
"""
import json
import os
import re
from collections import defaultdict

# ─── Paths ───────────────────────────────────────────────────────────────────

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.path.join(SCRIPT_DIR, '../../web/data')
HADITH_DIR  = os.path.join(DATA_DIR, 'hadith')
IW_MAP_PATH = os.path.join(HADITH_DIR, 'all/iw-id-map.json')

# ─── Arabic normalization ─────────────────────────────────────────────────────

TASHKEEL = re.compile(
    r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]'
)
ALEF     = re.compile(r'[أإآٱ]')
TATWEEL  = re.compile(r'\u0640')

# Common Arabic stop words — excluded from Jaccard computation
STOP_WORDS = {
    'و', 'في', 'من', 'إلى', 'على', 'عن', 'أن', 'إن', 'ما', 'لا', 'هو', 'هي',
    'ان', 'قال', 'قالت', 'كان', 'كانت', 'ثم', 'هذا', 'هذه', 'التي', 'الذي',
    'بن', 'له', 'لها',
}

JACCARD_THRESHOLD = 0.85   # high threshold: we want clear matches only
MIN_TEXT_LEN      = 30     # minimum normalized text length to compare


def normalize(text: str) -> str:
    if not text or not isinstance(text, str):
        return ''
    t = TASHKEEL.sub('', text)
    t = ALEF.sub('ا', t)
    t = TATWEEL.sub('', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def word_tokens(text: str) -> frozenset:
    """Return frozenset of meaningful Arabic words (no stop words, len > 2)."""
    return frozenset(
        w for w in normalize(text).split()
        if w not in STOP_WORDS and len(w) > 2
    )


def first_n_words_key(text: str, n: int = 8) -> str:
    """First N normalized words — used for fast candidate bucketing."""
    return ' '.join(normalize(text).split()[:n])


def jaccard(a: frozenset, b: frozenset) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union > 0 else 0.0


# ─── Load iw-id-map and build reverse lookup ─────────────────────────────────

print('Loading iw-id-map.json ...')
with open(IW_MAP_PATH, encoding='utf-8') as f:
    iw_id_map = json.load(f)   # "collection:cn" → "IWH-XXXXX"

# reverse: "IWH-XXXXX" → "collection"
iw_id_to_collection = {v: k.split(':')[0] for k, v in iw_id_map.items()}

print(f'  {len(iw_id_map):,} iw-id entries, {len(iw_id_to_collection):,} reverse entries')


# ─── Load Bukhari and Muslim hadiths from disk ────────────────────────────────

def load_collection(name: str) -> list[dict]:
    """Return list of (hadith_dict, file_path, index_in_file) tuples."""
    results = []
    coll_dir = os.path.join(HADITH_DIR, name)
    if not os.path.isdir(coll_dir):
        print(f'  WARNING: directory not found: {coll_dir}')
        return results
    for fname in sorted(os.listdir(coll_dir)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(coll_dir, fname)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception as e:
            print(f'  WARNING: could not parse {path}: {e}')
            continue
        if not isinstance(data, list):
            continue
        for idx, h in enumerate(data):
            if isinstance(h, dict) and h.get('iw_id'):
                results.append((h, path, idx))
    return results


print('Loading Bukhari ...')
bukhari_entries = load_collection('bukhari')
print(f'  {len(bukhari_entries):,} Bukhari hadiths loaded')

print('Loading Muslim ...')
muslim_entries = load_collection('muslim')
print(f'  {len(muslim_entries):,} Muslim hadiths loaded')


# ─── Build index: iw_id → entry for each collection ──────────────────────────

bukhari_by_id: dict[str, tuple] = {h['iw_id']: (h, path, idx) for h, path, idx in bukhari_entries}
muslim_by_id:  dict[str, tuple] = {h['iw_id']: (h, path, idx) for h, path, idx in muslim_entries}

# Track which iw_ids have been flagged (avoid double-counting in stats)
flagged_bukhari: set[str] = set()
flagged_muslim:  set[str] = set()

# Track which (bukhari_id, muslim_id) pairs we've already matched (for dedup between passes)
matched_pairs: set[tuple[str, str]] = set()


# ─── PASS 1: duplicates[] cross-reference ────────────────────────────────────

print('\n─── Pass 1: duplicates[] cross-reference ───')

pass1_bukhari = 0
pass1_muslim  = 0
pass1_pairs   = 0

for h, path, idx in bukhari_entries:
    dups = h.get('duplicates') or []
    for dup_id in dups:
        coll = iw_id_to_collection.get(dup_id)
        if coll == 'muslim' and dup_id in muslim_by_id:
            pair = (h['iw_id'], dup_id)
            if pair not in matched_pairs:
                matched_pairs.add(pair)
                pass1_pairs += 1
                if h['iw_id'] not in flagged_bukhari:
                    flagged_bukhari.add(h['iw_id'])
                    pass1_bukhari += 1
                if dup_id not in flagged_muslim:
                    flagged_muslim.add(dup_id)
                    pass1_muslim += 1

print(f'  Pass 1 pairs found : {pass1_pairs:,}')
print(f'  Bukhari hadiths    : {pass1_bukhari:,}')
print(f'  Muslim hadiths     : {pass1_muslim:,}')

# Also check the reverse: Muslim hadiths with duplicates pointing to Bukhari
for h, path, idx in muslim_entries:
    dups = h.get('duplicates') or []
    for dup_id in dups:
        coll = iw_id_to_collection.get(dup_id)
        if coll == 'bukhari' and dup_id in bukhari_by_id:
            pair = (dup_id, h['iw_id'])
            if pair not in matched_pairs:
                matched_pairs.add(pair)
                pass1_pairs += 1
                if dup_id not in flagged_bukhari:
                    flagged_bukhari.add(dup_id)
                    pass1_bukhari += 1
                if h['iw_id'] not in flagged_muslim:
                    flagged_muslim.add(h['iw_id'])
                    pass1_muslim += 1

print(f'  After reverse check:')
print(f'    Total pairs        : {pass1_pairs:,}')
print(f'    Bukhari hadiths    : {pass1_bukhari:,}')
print(f'    Muslim hadiths     : {pass1_muslim:,}')


# ─── PASS 2: Jaccard text similarity ─────────────────────────────────────────

print('\n─── Pass 2: Jaccard similarity (≥{}) ───'.format(JACCARD_THRESHOLD))

# Build word-set + first-key index for Bukhari
print('  Building Bukhari word-set index ...')
bukhari_index: dict[str, dict] = {}
for h, path, idx in bukhari_entries:
    matn = h.get('matn_ar_clean') or h.get('matn_ar') or h.get('ar', '')
    norm = normalize(matn)
    if len(norm) < MIN_TEXT_LEN:
        continue
    tokens = word_tokens(norm)
    if not tokens:
        continue
    bukhari_index[h['iw_id']] = {
        'tokens': tokens,
        'first_key': first_n_words_key(norm),
    }
print(f'    {len(bukhari_index):,} Bukhari hadiths indexed')

# Build word-set + first-key index for Muslim; also bucket by first-key
print('  Building Muslim word-set index and buckets ...')
muslim_index: dict[str, dict] = {}
muslim_by_first_key: defaultdict[str, list[str]] = defaultdict(list)

for h, path, idx in muslim_entries:
    matn = h.get('matn_ar_clean') or h.get('matn_ar') or h.get('ar', '')
    norm = normalize(matn)
    if len(norm) < MIN_TEXT_LEN:
        continue
    tokens = word_tokens(norm)
    if not tokens:
        continue
    iw_id = h['iw_id']
    first_key = first_n_words_key(norm)
    muslim_index[iw_id] = {
        'tokens': tokens,
        'first_key': first_key,
    }
    muslim_by_first_key[first_key].append(iw_id)
print(f'    {len(muslim_index):,} Muslim hadiths indexed')
print(f'    {len(muslim_by_first_key):,} first-key buckets')

# For each Bukhari hadith not yet matched, look up its first-key bucket in Muslim
print('  Cross-matching ...')

pass2_pairs   = 0
pass2_bukhari = 0
pass2_muslim  = 0

for b_id, b_data in bukhari_index.items():
    # Skip if already matched in Pass 1 (no need to re-examine)
    if b_id in flagged_bukhari:
        continue

    candidates = muslim_by_first_key.get(b_data['first_key'], [])
    for m_id in candidates:
        pair = (b_id, m_id)
        if pair in matched_pairs:
            continue
        m_data = muslim_index.get(m_id)
        if not m_data:
            continue
        score = jaccard(b_data['tokens'], m_data['tokens'])
        if score >= JACCARD_THRESHOLD:
            matched_pairs.add(pair)
            pass2_pairs += 1
            if b_id not in flagged_bukhari:
                flagged_bukhari.add(b_id)
                pass2_bukhari += 1
            if m_id not in flagged_muslim:
                flagged_muslim.add(m_id)
                pass2_muslim += 1

print(f'  Pass 2 new pairs   : {pass2_pairs:,}')
print(f'  New Bukhari        : {pass2_bukhari:,}')
print(f'  New Muslim         : {pass2_muslim:,}')


# ─── Summary before writing ───────────────────────────────────────────────────

total_pairs   = len(matched_pairs)
total_bukhari = len(flagged_bukhari)
total_muslim  = len(flagged_muslim)

print('\n─── Summary ───')
print(f'  Total muttafaq pairs   : {total_pairs:,}')
print(f'  Bukhari hadiths flagged: {total_bukhari:,}')
print(f'  Muslim hadiths flagged : {total_muslim:,}')


# ─── Write modified JSON files ────────────────────────────────────────────────

print('\n─── Writing modified files ───')

# Collect all files that need to be updated
# file_path → list_of_hadiths (the full list as read from disk)
file_data_cache: dict[str, list] = {}

def get_file_data(path: str) -> list:
    if path not in file_data_cache:
        with open(path, encoding='utf-8') as f:
            file_data_cache[path] = json.load(f)
    return file_data_cache[path]


# Flag Bukhari hadiths
bukhari_written  = 0
bukhari_files_written = set()
for h, path, idx in bukhari_entries:
    iw_id = h['iw_id']
    should_flag = iw_id in flagged_bukhari
    data = get_file_data(path)
    entry = data[idx]
    current = entry.get('muttafaq_alayhi', None)
    if should_flag and current is not True:
        entry['muttafaq_alayhi'] = True
        bukhari_written += 1
        bukhari_files_written.add(path)
    elif not should_flag and current is True:
        # Clear any previously set flag that no longer applies
        entry['muttafaq_alayhi'] = False
        bukhari_files_written.add(path)

# Flag Muslim hadiths
muslim_written  = 0
muslim_files_written = set()
for h, path, idx in muslim_entries:
    iw_id = h['iw_id']
    should_flag = iw_id in flagged_muslim
    data = get_file_data(path)
    entry = data[idx]
    current = entry.get('muttafaq_alayhi', None)
    if should_flag and current is not True:
        entry['muttafaq_alayhi'] = True
        muslim_written += 1
        muslim_files_written.add(path)
    elif not should_flag and current is True:
        entry['muttafaq_alayhi'] = False
        muslim_files_written.add(path)

# Write all modified files
all_modified_files = bukhari_files_written | muslim_files_written
for path in sorted(all_modified_files):
    data = file_data_cache[path]
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print(f'  Bukhari hadiths updated : {bukhari_written:,}  ({len(bukhari_files_written)} files)')
print(f'  Muslim hadiths updated  : {muslim_written:,}  ({len(muslim_files_written)} files)')
print(f'  Total files written     : {len(all_modified_files):,}')

print('\nDone. muttafaq_alayhi: true set on all matched hadiths in both collections.')
