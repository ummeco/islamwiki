#!/usr/bin/env python3
"""
Islam.wiki Books — Post-Extraction Cleaner
==========================================
Cleans extracted chapter content_en in all chapter JSON files.

Steps applied:
  1. strip_pdf_artifacts — remove page numbers, running headers, broken hyphenation
  2. apply_word_standardization — fix term variants per docs/word-standardization.md
  3. ensure_html_paragraphs — wrap bare text in <p> tags

Usage:
  python scripts/books/post-extract-clean.py --slug kitab-at-tawhid
  python scripts/books/post-extract-clean.py --all
  python scripts/books/post-extract-clean.py --all --dry-run
"""

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent / "web"
BOOKS_DIR = REPO_ROOT / "data" / "books"
CLASSICAL_JSON = BOOKS_DIR / "classical.json"

# ---------------------------------------------------------------------------
# Word standardization — ERROR-level terms (auto-replaceable)
# These are from docs/word-standardization.md TERM_ERRORS list
# ---------------------------------------------------------------------------
TERM_REPLACEMENTS: list[tuple[str, str]] = [
    # Quran
    (r"\bQuran\b", "Qur'an"),
    (r"\bKoran\b", "Qur'an"),
    (r"\bAl-Quran\b", "the Qur'an"),
    (r"\bQuranic\b", "Qur'anic"),
    # Prayer
    (r"\bsalah\b", "salah"),          # normalise british/american
    (r"\bSalah\b", "Salah"),
    (r"\bsalat\b", "salah"),
    (r"\bSalat\b", "Salah"),
    (r"\bnamaz\b", "salah"),
    (r"\bNamaz\b", "Salah"),
    # Pilgrimage
    (r"\bhajj\b", "Hajj"),
    (r"\bHaj\b", "Hajj"),
    # Fasting
    (r"\bRamadan\b", "Ramadan"),
    (r"\bRamazan\b", "Ramadan"),
    # Alms
    (r"\bzakat\b", "zakah"),
    (r"\bZakat\b", "Zakah"),
    # Da'wah
    (r"\bdawah\b", "da'wah"),
    (r"\bDawah\b", "Da'wah"),
    # Hadith
    (r"\bhadis\b", "hadith"),
    (r"\bHadis\b", "Hadith"),
    # Sunnah
    (r"\bsunna\b", "Sunnah"),
    (r"\bSunna\b", "Sunnah"),
    # Caliphate titles
    (r"\bCaliph\b", "Caliph"),
    # Companions
    (r"\bSahaba\b", "Sahabah"),
    (r"\bCompanion\b", "Companion"),
    # God
    (r"\bAllah swt\b", "Allah"),
    (r"\bAllah SWT\b", "Allah"),
    (r"\bGod \(Allah\)", "Allah"),
]


# ---------------------------------------------------------------------------
# Strip PDF artifacts
# ---------------------------------------------------------------------------
def strip_pdf_artifacts(text: str) -> str:
    """Remove common PDF-extraction noise from HTML content."""
    # Remove standalone page numbers (lines that are just a number)
    text = re.sub(r'<p>\s*\d{1,4}\s*</p>', '', text)
    # Remove running headers (short all-caps lines, common in classical books)
    text = re.sub(r'<p>[A-Z\s]{4,40}</p>\s*', '', text)
    # Fix broken hyphenation across line breaks: word-\n→ word → word
    text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
    text = re.sub(r'(\w)-\s*<br\s*/?>\s*(\w)', r'\1\2', text)
    # Remove excessive whitespace inside tags
    text = re.sub(r'(<p>)\s+', r'\1', text)
    text = re.sub(r'\s+(</p>)', r'\1', text)
    # Remove empty paragraphs
    text = re.sub(r'<p>\s*</p>', '', text)
    # Collapse multiple spaces
    text = re.sub(r'  +', ' ', text)
    return text.strip()


# ---------------------------------------------------------------------------
# Apply word standardization
# ---------------------------------------------------------------------------
def apply_word_standardization(text: str) -> str:
    """Apply term replacements from word-standardization.md."""
    for pattern, replacement in TERM_REPLACEMENTS:
        text = re.sub(pattern, replacement, text)
    return text


# ---------------------------------------------------------------------------
# Ensure valid HTML paragraph wrapping
# ---------------------------------------------------------------------------
def ensure_html_paragraphs(text: str) -> str:
    """Wrap bare text blocks in <p> tags if not already wrapped."""
    stripped = text.strip()
    if not stripped:
        return text
    # Already has block-level tags — return as-is (don't double-wrap)
    if re.match(r'^\s*<(p|div|h[1-6]|ul|ol|blockquote|table)', stripped, re.IGNORECASE):
        return text
    # Split on blank lines, wrap each paragraph
    paragraphs = re.split(r'\n\s*\n', stripped)
    wrapped = []
    for para in paragraphs:
        para = para.strip()
        if para:
            wrapped.append(f'<p>{para}</p>')
    return '\n'.join(wrapped)


# ---------------------------------------------------------------------------
# Clean a single chapter file
# ---------------------------------------------------------------------------
def clean_chapter_file(chapter_path: Path, dry_run: bool = False) -> bool:
    """Load, clean, and write back a chapter JSON file. Returns True if changed."""
    try:
        data: dict = json.loads(chapter_path.read_text('utf-8'))
    except (json.JSONDecodeError, OSError) as e:
        print(f"  ERROR reading {chapter_path.name}: {e}")
        return False

    content = data.get('content_en', '')
    if not content or not isinstance(content, str):
        return False

    original = content
    content = strip_pdf_artifacts(content)
    content = apply_word_standardization(content)
    content = ensure_html_paragraphs(content)

    if content == original:
        return False

    if not dry_run:
        data['content_en'] = content
        chapter_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + '\n',
            encoding='utf-8'
        )
    return True


# ---------------------------------------------------------------------------
# Process a single book
# ---------------------------------------------------------------------------
def clean_book(slug: str, dry_run: bool = False) -> tuple[int, int]:
    """Returns (files_changed, files_scanned)."""
    book_dir = BOOKS_DIR / slug
    if not book_dir.exists():
        print(f"  ⚠ No directory: {slug}")
        return 0, 0

    files = sorted([
        f for f in book_dir.iterdir()
        if f.suffix == '.json' and f.name not in ('meta.json', 'index.json')
    ])

    changed = 0
    for f in files:
        if clean_chapter_file(f, dry_run=dry_run):
            changed += 1
            if dry_run:
                print(f"  (dry-run) Would change: {f.name}")

    return changed, len(files)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description='Clean extracted chapter content_en fields')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--slug', help='Process a single book by slug')
    group.add_argument('--all', action='store_true', help='Process all canonical books')
    parser.add_argument('--dry-run', action='store_true', help="Don't write changes")
    args = parser.parse_args()

    dry_prefix = '[DRY-RUN] ' if args.dry_run else ''
    total_changed = 0
    total_scanned = 0

    if args.slug:
        print(f"{dry_prefix}Cleaning {args.slug}…")
        changed, scanned = clean_book(args.slug, dry_run=args.dry_run)
        print(f"  {changed}/{scanned} files changed")
        total_changed = changed
        total_scanned = scanned
    else:
        books = json.loads(CLASSICAL_JSON.read_text('utf-8'))
        canonical = [b for b in books if b.get('canonical') is not False]
        print(f"{dry_prefix}Cleaning {len(canonical)} canonical books…\n")

        for book in canonical:
            slug = book['slug']
            changed, scanned = clean_book(slug, dry_run=args.dry_run)
            if changed > 0:
                print(f"  {slug}: {changed}/{scanned} changed")
            total_changed += changed
            total_scanned += scanned

    print(f"\n{'='*50}")
    print(f"Total files scanned:  {total_scanned}")
    print(f"Total files changed:  {total_changed}")
    if args.dry_run:
        print("(no files written — dry-run mode)")
    print(f"{'='*50}")


if __name__ == '__main__':
    main()
