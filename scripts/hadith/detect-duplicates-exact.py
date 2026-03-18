#!/usr/bin/env python3
"""
FEAT-2: Exact duplicate detection across hadith collections.

Normalizes matn_ar text, hashes it, finds hadiths sharing the same normalized
text across different books/collections → these are duplicates.

Also identifies the famous "muttafaq 'alayhi" (Bukhari+Muslim) hadiths.

Usage:
    cd /Users/admin/Sites/ummeco/islamwiki
    python3 scripts/hadith/detect-duplicates-exact.py
"""
import json, os, re, hashlib
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../web/data')
HADITH_DIR = os.path.join(DATA_DIR, 'hadith')

COLLECTIONS = ['bukhari','muslim','abu-dawud','tirmidhi','nasai','ibn-majah',
               'muwatta','darimi','musnad-ahmad','riyadh-salihin','bulugh-maram','shamail']

TASHKEEL = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]')
ALEF = re.compile(r'[أإآٱ]')
TATWEEL = re.compile(r'\u0640')


def normalize(text: str) -> str:
    if not text or not isinstance(text, str):
        return ''
    t = TASHKEEL.sub('', text)
    t = ALEF.sub('ا', t)
    t = TATWEEL.sub('', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]


# Load all hadiths into memory
print('Loading all hadiths...')
all_hadiths = {}  # iw_id → {data, coll, book}
hash_to_ids = defaultdict(list)  # hash → [iw_id, ...]

for coll in COLLECTIONS:
    d = os.path.join(HADITH_DIR, coll)
    if not os.path.isdir(d): continue
    for fname in sorted(os.listdir(d)):
        if not fname.endswith('.json'): continue
        path = os.path.join(d, fname)
        try: data = json.load(open(path, encoding='utf-8'))
        except: continue
        if not isinstance(data, list): continue
        for h in data:
            if not isinstance(h, dict): continue
            iw_id = h.get('iw_id', '')
            if not iw_id: continue
            # Use matn_ar_clean > matn_ar > ar
            matn = h.get('matn_ar_clean') or h.get('matn_ar') or h.get('ar', '')
            norm = normalize(matn)
            if len(norm) < 20:  # too short to be meaningful
                continue
            h_hash = text_hash(norm)
            all_hadiths[iw_id] = {'coll': coll, 'book': fname, 'hash': h_hash, 'norm': norm, 'path': path}
            hash_to_ids[h_hash].append(iw_id)

print(f'Loaded {len(all_hadiths)} hadiths with meaningful Arabic text')

# Find duplicates
duplicate_groups = {h: ids for h, ids in hash_to_ids.items() if len(ids) > 1}
print(f'Found {len(duplicate_groups)} duplicate groups ({sum(len(v) for v in duplicate_groups.values())} hadiths)')

# Build iw_id → duplicate_list map
id_to_duplicates = {}
for h_hash, ids in duplicate_groups.items():
    for iw_id in ids:
        others = [x for x in ids if x != iw_id]
        id_to_duplicates[iw_id] = others

# Count muttafaq 'alayhi (Bukhari + Muslim)
muttafaq_count = 0
for h_hash, ids in duplicate_groups.items():
    colls = set(all_hadiths[i]['coll'] for i in ids)
    if 'bukhari' in colls and 'muslim' in colls:
        muttafaq_count += 1
print(f"Muttafaq 'alayhi groups (Bukhari+Muslim): {muttafaq_count}")

# Update hadith files in-place
print('Writing duplicates[] to hadith files...')
# Group by path
path_to_updates = defaultdict(dict)  # path → {iw_id: [dup_ids]}
for iw_id, dup_ids in id_to_duplicates.items():
    path = all_hadiths[iw_id]['path']
    path_to_updates[path][iw_id] = dup_ids

updated_hadiths = 0
for path, updates in path_to_updates.items():
    try: data = json.load(open(path, encoding='utf-8'))
    except: continue
    if not isinstance(data, list): continue
    changed = False
    for h in data:
        if not isinstance(h, dict): continue
        iw_id = h.get('iw_id', '')
        if iw_id in updates:
            existing = set(h.get('duplicates', []))
            new_dups = set(updates[iw_id])
            merged = sorted(existing | new_dups)
            if set(merged) != existing:
                h['duplicates'] = merged
                updated_hadiths += 1
                changed = True
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')

print(f'Updated {updated_hadiths} hadiths with duplicates[]')

# Sample output
print('\nSample duplicate groups:')
for i, (h_hash, ids) in enumerate(list(duplicate_groups.items())[:5]):
    colls = [all_hadiths[x]['coll']+'/'+all_hadiths[x]['book'] for x in ids[:4]]
    print(f'  Group {i+1}: {", ".join(ids[:4])}')
    print(f'    Sources: {", ".join(colls[:4])}')
    print(f'    Text: {all_hadiths[ids[0]]["norm"][:80]}...')
