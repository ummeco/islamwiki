#!/usr/bin/env python3
"""
Phase K: Build reverse hadith_refs on all Quran ayahs.

Scans all hadiths' quran_refs and populates the reverse:
  web/data/quran/ayahs/{surah}.json → each ayah gets hadith_refs: ["BU001-001", ...]

Usage:
    cd /Users/admin/Sites/ummeco/islamwiki
    python3 scripts/hadith/fill-hadith-refs-reverse.py
"""
import json, os
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../web/data')
HADITH_DIR = os.path.join(DATA_DIR, 'hadith')
QURAN_DIR = os.path.join(DATA_DIR, 'quran/ayahs')

COLLECTIONS = ['bukhari','muslim','abu-dawud','tirmidhi','nasai','ibn-majah',
               'muwatta','darimi','musnad-ahmad','riyadh-salihin','bulugh-maram','shamail']

# Build index: "surah:ayah" → list of iw_ids
ayah_to_hadiths: dict[str, list[str]] = defaultdict(list)

print('Scanning hadith quran_refs...')
total_links = 0
for coll in COLLECTIONS:
    d = os.path.join(HADITH_DIR, coll)
    if not os.path.isdir(d): continue
    for fname in sorted(os.listdir(d)):
        if not fname.endswith('.json'): continue
        try: data = json.load(open(os.path.join(d, fname)))
        except: continue
        if not isinstance(data, list): continue
        for h in data:
            if not isinstance(h, dict): continue
            iw_id = h.get('iw_id', '')
            if not iw_id: continue
            for ref in h.get('quran_refs', []):
                if ':' in str(ref):
                    ayah_to_hadiths[str(ref)].append(iw_id)
                    total_links += 1

print(f'Total hadith→ayah links: {total_links}')
print(f'Unique ayahs referenced: {len(ayah_to_hadiths)}')

# Write hadith_refs to ayah files
print('Writing hadith_refs to ayah files...')
ayahs_updated = 0
hadiths_written = 0

for surah_num in range(1, 115):
    path = os.path.join(QURAN_DIR, f'{surah_num:03d}.json')
    if not os.path.exists(path): continue

    ayahs = json.load(open(path, encoding='utf-8'))
    changed = False
    for ayah in ayahs:
        if not isinstance(ayah, dict): continue
        ayah_n = ayah.get('n') or ayah.get('cn')
        key = f'{surah_num}:{ayah_n}'
        new_refs = sorted(set(ayah_to_hadiths.get(key, [])))
        existing = ayah.get('hadith_refs', [])
        merged = sorted(set(existing) | set(new_refs))
        if set(merged) != set(existing):
            ayah['hadith_refs'] = merged
            ayahs_updated += 1
            hadiths_written += len(merged)
            changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(ayahs, f, ensure_ascii=False, indent=2)
            f.write('\n')

print(f'Updated {ayahs_updated} ayahs with hadith_refs')
print(f'Total hadith refs written to ayahs: {hadiths_written}')

# Top ayahs by hadith references
top = sorted(ayah_to_hadiths.items(), key=lambda x: len(x[1]), reverse=True)[:20]
print('\nTop 20 most-referenced Quran ayahs:')
for ayah_key, hids in top:
    print(f'  {ayah_key}: {len(hids)} hadiths')
