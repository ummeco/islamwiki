#!/usr/bin/env python3
"""
Phase A: Programmatic Arabic text matching for quran_refs.

For each hadith, checks if any Quran ayah text (normalized, ≥8 chars) appears
as a substring in the hadith's Arabic text. These are definitive direct quotes.

Usage:
    cd /Users/admin/Sites/ummeco/islamwiki
    python3 scripts/hadith/fill-quran-refs-textmatch.py
"""

import json
import os
import glob
import re
import unicodedata

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../web/data')
QURAN_DIR = os.path.join(DATA_DIR, 'quran/ayahs')
HADITH_DIR = os.path.join(DATA_DIR, 'hadith')

COLLECTIONS = [
    'bukhari', 'muslim', 'abu-dawud', 'tirmidhi', 'nasai', 'ibn-majah',
    'muwatta', 'darimi', 'musnad-ahmad', 'riyadh-salihin', 'bulugh-maram', 'shamail'
]

TASHKEEL = re.compile(r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]')
ALEF_FORMS = re.compile(r'[أإآٱ]')
TATWEEL = re.compile(r'\u0640')


def normalize_arabic(text: str) -> str:
    """Strip tashkeel, normalize alef forms, remove tatweel."""
    if not text:
        return ''
    text = TASHKEEL.sub('', text)
    text = ALEF_FORMS.sub('ا', text)
    text = TATWEEL.sub('', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def load_quran_index() -> dict[str, list[tuple[int, int]]]:
    """
    Returns dict: normalized_ayah_text → [(surah, ayah), ...]
    Only includes ayahs with normalized text ≥ 8 chars to reduce false positives.
    """
    index = {}
    for surah_num in range(1, 115):
        path = os.path.join(QURAN_DIR, f'{surah_num:03d}.json')
        if not os.path.exists(path):
            continue
        ayahs = json.load(open(path, encoding='utf-8'))
        for ayah in ayahs:
            ayah_num = ayah.get('n') or ayah.get('cn')
            ar_text = ayah.get('ar_simple') or ayah.get('ar', '')
            norm = normalize_arabic(ar_text)
            if len(norm) < 8:
                continue
            # Use 8-char windows and full text for matching
            if norm not in index:
                index[norm] = []
            index[norm].append((surah_num, ayah_num))
    print(f'Quran index built: {len(index)} normalized ayah texts')
    return index


def find_refs_in_hadith(hadith_ar: str, quran_index: dict) -> list[str]:
    """Return list of 'surah:ayah' strings found in hadith Arabic text."""
    norm_hadith = normalize_arabic(hadith_ar)
    found = set()
    for ayah_norm, positions in quran_index.items():
        if ayah_norm in norm_hadith:
            for (surah, ayah) in positions:
                found.add(f'{surah}:{ayah}')
    return sorted(found, key=lambda x: (int(x.split(':')[0]), int(x.split(':')[1])))


def process_collection(coll: str, quran_index: dict) -> tuple[int, int, int]:
    """Process all books in a collection. Returns (books, hadiths, hadiths_with_refs)."""
    coll_dir = os.path.join(HADITH_DIR, coll)
    if not os.path.isdir(coll_dir):
        return 0, 0, 0

    book_files = sorted(f for f in os.listdir(coll_dir) if f.endswith('.json'))
    total_hadiths = 0
    matched_hadiths = 0

    for book_file in book_files:
        path = os.path.join(coll_dir, book_file)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue
        if not isinstance(data, list):
            continue

        changed = False
        for hadith in data:
            if not isinstance(hadith, dict):
                continue
            total_hadiths += 1
            ar_text = hadith.get('ar', '')
            if not ar_text:
                continue
            existing_refs = set(hadith.get('quran_refs', []))
            new_refs = find_refs_in_hadith(ar_text, quran_index)
            if new_refs:
                merged = sorted(
                    existing_refs | set(new_refs),
                    key=lambda x: (int(x.split(':')[0]), int(x.split(':')[1]))
                )
                if set(merged) != existing_refs:
                    hadith['quran_refs'] = merged
                    matched_hadiths += 1
                    changed = True

        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write('\n')

    return len(book_files), total_hadiths, matched_hadiths


def main():
    print('Loading Quran index...')
    quran_index = load_quran_index()

    total_books = 0
    total_hadiths = 0
    total_matched = 0

    for coll in COLLECTIONS:
        books, hadiths, matched = process_collection(coll, quran_index)
        total_books += books
        total_hadiths += hadiths
        total_matched += matched
        pct = 100 * matched / hadiths if hadiths else 0
        print(f'  {coll}: {hadiths} hadiths → {matched} matched ({pct:.1f}%)')

    print(f'\nTotal: {total_hadiths} hadiths, {total_matched} now have text-match refs ({100*total_matched/total_hadiths:.1f}%)')
    print(f'Remaining without refs: {total_hadiths - total_matched}')


if __name__ == '__main__':
    main()
