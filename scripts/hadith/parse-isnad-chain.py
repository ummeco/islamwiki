#!/usr/bin/env python3
"""
DQ-5.1: Isnad Chain Parser for Islam.wiki
Parses Arabic isnad text → structured narrator chain array.

Usage:
  python3 parse-isnad-chain.py --collection bukhari --book 001 [--limit 10]
  python3 parse-isnad-chain.py --collection bukhari --all
  python3 parse-isnad-chain.py --collection all --all --output /tmp/isnad-output/

Output format per hadith:
  isnad_chain: [
    {"name_ar": "...", "name_en": "...", "slug": "...", "type": "direct|companion|prophet"},
    ...
  ]
"""

import json
import re
import os
import argparse
from pathlib import Path

# Project root
ROOT = Path(__file__).parent.parent.parent / "web" / "data"
HADITH_DIR = ROOT / "hadith"
PEOPLE_DIR = ROOT / "people"

# Transmission keywords in Arabic
TRANSMISSION_WORDS = [
    "حَدَّثَنَا", "حَدَّثَنِي", "حَدَّثَهُ",
    "أَخْبَرَنَا", "أَخْبَرَنِي", "أَخْبَرَهُ",
    "أَنْبَأَنَا", "أَنْبَأَنِي",
    "أَخْبَرَ", "حَدَّثَ",
    "سَمِعَ", "سَمِعْتُ", "سَمِعَنَا",
    "قَرَأْتُ عَلَى", "قَرَأَ عَلَى",
]

# Connectors between narrators
CONNECTOR_WORDS = ["عَنْ", "عَنِ", "عَنْه", "أَنَّ", "أَنَّهُ"]

# Prophet markers
PROPHET_MARKERS = [
    "رَسُولَ اللَّهِ", "النَّبِيِّ", "النَّبِيُّ",
    "رَسُولُ اللَّهِ", "صلى الله عليه وسلم",
]

# Companion markers
COMPANION_ENDINGS = ["الأَنْصَارِيُّ", "الصَّحَابِيُّ", "رَضِيَ اللَّهُ عَنْهُ"]


def load_narrators():
    """Load narrators.json and build lookup tables."""
    with open(PEOPLE_DIR / "narrators.json", encoding="utf-8") as f:
        narrators = json.load(f)

    # Build lookup by name_ar (normalized, no diacritics)
    by_name_ar = {}
    by_name_en = {}
    for n in narrators:
        name_ar = n.get("name_ar", "")
        name_en = n.get("name_en", "")
        slug = n.get("slug", "")
        if name_ar:
            normalized = strip_diacritics(name_ar)
            by_name_ar[normalized] = n
        if name_en:
            by_name_en[name_en.lower()] = n

    return narrators, by_name_ar, by_name_en


def strip_diacritics(text):
    """Remove Arabic diacritical marks (harakat)."""
    # Unicode ranges for Arabic diacritics
    diacritics = "\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0653\u0654\u0655\u0670"
    for d in diacritics:
        text = text.replace(d, "")
    return text.strip()


def split_on_transmission(isnad_ar):
    """Split isnad text on transmission word boundaries to extract segments."""
    # Remove Prophet markers from the text for parsing
    for marker in PROPHET_MARKERS:
        isnad_ar = isnad_ar.replace(marker, "")

    # Split on transmission keywords
    # Pattern: (keyword) (name) (connector) (name) ...
    parts = []
    text = isnad_ar

    # Find all transmission words and their positions
    positions = []
    for word in TRANSMISSION_WORDS:
        for m in re.finditer(re.escape(word), text):
            positions.append((m.start(), m.end(), word))

    positions.sort()

    if not positions:
        return []

    segments = []
    for i, (start, end, word) in enumerate(positions):
        if i + 1 < len(positions):
            segment = text[end:positions[i + 1][0]].strip()
        else:
            segment = text[end:].strip()
        # Clean up
        segment = re.sub(r'\s+', ' ', segment).strip()
        # Remove trailing sentence content (after قَالَ at end)
        qala_pos = segment.find("قَالَ")
        if qala_pos > 10:
            segment = segment[:qala_pos].strip()
        if segment:
            segments.append(segment)

    return segments


def extract_names_from_segment(segment):
    """Extract narrator name(s) from a segment of text."""
    # Split on عَنْ / عَنِ connectors
    parts = re.split(r'\s+عَنِ?\s+|\s+،\s+', segment)
    names = []
    for p in parts:
        p = p.strip()
        # Remove trailing phrases like "قَالَ"
        p = re.sub(r'\s+قَالَ.*$', '', p).strip()
        # Remove "أَنَّ" and similar
        p = re.sub(r'^أَنَّ\s+', '', p).strip()
        # A name is typically 2-5 Arabic words
        words = p.split()
        if 1 <= len(words) <= 8:
            names.append(p)
    return names


def match_narrator(name_ar, by_name_ar, by_name_en):
    """Try to match an Arabic name to a known narrator."""
    normalized = strip_diacritics(name_ar)

    # Direct match
    if normalized in by_name_ar:
        n = by_name_ar[normalized]
        return {
            "name_ar": n.get("name_ar", name_ar),
            "name_en": n.get("name_en", ""),
            "slug": n.get("slug", ""),
            "matched": True,
        }

    # Partial match: check if the full known name appears within the extracted segment
    # (e.g. segment "ابن عمر يقول" matches known "ابن عمر")
    # Intentionally NOT matching if extracted name is a fragment of a known name,
    # as that causes false positives (e.g. "سفيان" matching "معاوية بن أبي سفيان")
    for known_ar, n in by_name_ar.items():
        if known_ar and known_ar in normalized:
            if len(known_ar) > 8:  # avoid short common-word false matches
                return {
                    "name_ar": n.get("name_ar", name_ar),
                    "name_en": n.get("name_en", ""),
                    "slug": n.get("slug", ""),
                    "matched": True,
                }

    # No match — return unmatched entry
    return {
        "name_ar": name_ar,
        "name_en": "",
        "slug": "",
        "matched": False,
    }


def detect_narrator_type(name_ar, index, total):
    """Detect type: companion (first in chain or has ra markers), prophet (last)."""
    if any(m in name_ar for m in PROPHET_MARKERS):
        return "prophet"
    if index == total - 1:
        return "companion"
    return "narrator"


def parse_isnad(isnad_ar, by_name_ar, by_name_en):
    """Parse a single isnad string into a chain of narrators."""
    if not isnad_ar or len(isnad_ar) < 20:
        return []

    chain = []

    # Strip diacritics for robust splitting — diacritical regex fails to match
    # the same Arabic words with harakāt in the data
    stripped = strip_diacritics(isnad_ar)

    # Split into segments per transmission event
    segments = split_on_transmission(isnad_ar)

    all_names = []
    for seg in segments:
        names = extract_names_from_segment(seg)
        for name in names:
            if name and name not in all_names:
                all_names.append(name)

    # Also extract names from عن connectors in the full text (diacritics-stripped)
    # Pattern: حدثنا X عن Y عن Z
    # Split on transmission + connector words using bare (no-diacritic) Arabic
    parts = re.split(
        r'حدثنا\s+|أخبرنا\s+|حدثني\s+|أخبرني\s+|سمع\s+|سمعت\s+'
        r'|قرأت على\s+|وعن\s+|عني\s+|عن\s+',
        stripped
    )

    simple_names = []
    for part in parts:
        part = part.strip()
        # Strip trailing punctuation
        part = re.sub(r'[،,،\.؛;]+$', '', part).strip()
        # Remove trailing transmission/phrase (bare Arabic, no diacritics)
        part = re.sub(r'\s+قال.*$', '', part).strip()
        part = re.sub(r'\s+أن.*$', '', part).strip()
        part = re.sub(r'\s+أخبر.*$', '', part).strip()
        # Remove companion honorifics/epithets that pad the name
        part = re.sub(r'\s*-\s*رضى الله.*$', '', part).strip()
        part = re.sub(r'\s*رضى الله.*$', '', part).strip()
        part = re.sub(r'\s*رضي الله.*$', '', part).strip()
        part = re.sub(r'\s*صلى الله.*$', '', part).strip()
        part = re.sub(r'\s*[-–]+\s*$', '', part).strip()
        # Strip remaining trailing punctuation
        part = re.sub(r'[،,،\.؛;:]+$', '', part).strip()
        words = part.split()
        # Names are 1-6 words
        if 1 <= len(words) <= 6 and part:
            simple_names.append(part)

    # Deduplicate preserving order
    seen = set()
    final_names = []
    for name in simple_names:
        norm = strip_diacritics(name)
        # Also strip trailing commas for dedup key
        norm_clean = re.sub(r'[،,،\.؛;]+$', '', norm).strip()
        if norm_clean not in seen and len(norm_clean) > 3:
            seen.add(norm_clean)
            # Clean name before storing
            clean_name = re.sub(r'[،,،\.؛;]+$', '', name).strip()
            final_names.append(clean_name)

    # Build chain with narrator lookups
    for i, name in enumerate(final_names):
        entry = match_narrator(name, by_name_ar, by_name_en)
        entry["position"] = i
        entry["type"] = detect_narrator_type(name, i, len(final_names))
        # Remove internal fields
        del entry["matched"]
        chain.append(entry)

    return chain


def process_book(collection, book_file, by_name_ar, by_name_en, limit=None, force=False):
    """Process a single book file, adding isnad_chain to each hadith."""
    book_path = HADITH_DIR / collection / book_file
    if not book_path.exists():
        print(f"  Skipping {book_path} — not found")
        return 0, 0

    with open(book_path, encoding="utf-8") as f:
        hadiths = json.load(f)

    # limit only restricts parsing, not writing — we always write back all hadiths
    process_slice = hadiths[:limit] if limit else hadiths

    updated = 0
    for h in process_slice:
        isnad_ar = h.get("isnad_ar", "")
        # Skip if chain exists unless --force
        if not force and h.get("isnad_chain"):
            continue
        if isnad_ar:
            chain = parse_isnad(isnad_ar, by_name_ar, by_name_en)
            if chain:
                h["isnad_chain"] = chain
                updated += 1

    # Write back all hadiths (not just the processed slice)
    with open(book_path, "w", encoding="utf-8") as f:
        json.dump(hadiths, f, ensure_ascii=False)

    return len(process_slice), updated


def main():
    parser = argparse.ArgumentParser(description="Parse isnad chains for Islam.wiki hadiths")
    parser.add_argument("--collection", default="bukhari", help="Collection name or 'all'")
    parser.add_argument("--book", default=None, help="Book file (e.g. 001.json)")
    parser.add_argument("--all", action="store_true", help="Process all books in collection")
    parser.add_argument("--limit", type=int, default=None, help="Limit hadiths per book (for testing)")
    parser.add_argument("--dry-run", action="store_true", help="Print stats without writing")
    parser.add_argument("--force", action="store_true", help="Reparse even if isnad_chain already exists")
    args = parser.parse_args()

    print("Loading narrator lookup tables...")
    narrators, by_name_ar, by_name_en = load_narrators()
    print(f"  {len(narrators)} narrators loaded, {len(by_name_ar)} Arabic name lookups")

    collections = []
    # Exclude utility dirs that aren't collections
    EXCLUDED_DIRS = {"all", "grades", "raw", "sharh"}
    if args.collection == "all":
        collections = [d.name for d in HADITH_DIR.iterdir() if d.is_dir() and d.name not in EXCLUDED_DIRS]
    else:
        collections = [args.collection]

    total_hadiths = 0
    total_updated = 0

    for collection in sorted(collections):
        coll_dir = HADITH_DIR / collection
        if not coll_dir.is_dir():
            print(f"Collection not found: {collection}")
            continue

        if args.book:
            books = [args.book if args.book.endswith(".json") else args.book + ".json"]
        elif args.all:
            books = sorted(f.name for f in coll_dir.glob("*.json"))
        else:
            books = ["001.json"]

        print(f"\nProcessing {collection} ({len(books)} books)...")
        for book_file in books:
            n_hadiths, n_updated = process_book(
                collection, book_file, by_name_ar, by_name_en, args.limit, args.force
            )
            total_hadiths += n_hadiths
            total_updated += n_updated
            if n_updated:
                print(f"  {book_file}: {n_updated}/{n_hadiths} chains parsed")

    print(f"\nDone: {total_updated}/{total_hadiths} hadiths got isnad_chain")

    # Show sample output
    if total_updated > 0:
        sample_coll = collections[0]
        sample_book = sorted((HADITH_DIR / sample_coll).glob("*.json"))[0]
        with open(sample_book) as f:
            hadiths = json.load(f)
        for h in hadiths:
            if h.get("isnad_chain"):
                print(f"\nSample chain (hadith n={h['n']}):")
                for entry in h["isnad_chain"][:5]:
                    print(f"  {entry}")
                break


if __name__ == "__main__":
    main()
