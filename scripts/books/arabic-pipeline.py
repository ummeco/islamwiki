#!/usr/bin/env python3
"""
Islam.wiki Books — Arabic Text Acquisition Pipeline
====================================================
Fetches Arabic chapter text from al-maktaba.org (primary) or shamela.ws (fallback).

Features:
  - Arabic heading detection: كتاب / باب / فصل / مسألة
  - Chapter splitting preserving Arabic structure
  - Rate limiting with jitter, retry with exponential backoff
  - Resume support (skips books already processed)
  - Source status tracking (updates classical.json)

Usage:
  python scripts/books/arabic-pipeline.py --slug al-umm
  python scripts/books/arabic-pipeline.py --slug al-umm --step fetch
  python scripts/books/arabic-pipeline.py --slug al-umm --step split
  python scripts/books/arabic-pipeline.py --slug al-umm --step write
  python scripts/books/arabic-pipeline.py --slug al-umm --step all
  python scripts/books/arabic-pipeline.py --dry-run --slug al-umm

Source URL format in source-mapping.json:
  {
    "al-umm": {
      "lang": "ar",
      "source_type": "html",
      "source_url": "https://al-maktaba.org/book/11394",
      "notes": "8 volumes"
    }
  }
"""

import argparse
import json
import re
import sys
import time
import random
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).parent.parent.parent / "web"
SCRIPTS_DIR = Path(__file__).parent
BOOKS_DIR = REPO_ROOT / "data" / "books"
CLASSICAL_JSON = BOOKS_DIR / "classical.json"
SOURCE_MAPPING_JSON = SCRIPTS_DIR / "source-mapping.json"

# Rate limiting
MIN_DELAY = 1.5     # seconds between requests
MAX_DELAY = 3.5     # seconds between requests (with jitter)
MAX_RETRIES = 3
RETRY_BACKOFF = 2.0  # multiplier per retry

# Arabic chapter heading patterns (regex)
AR_HEADING_PATTERNS = [
    re.compile(r'^(كتاب\s+.{3,80})$', re.MULTILINE),      # كتاب (Book)
    re.compile(r'^(باب\s+.{3,80})$', re.MULTILINE),         # باب (Chapter/Section)
    re.compile(r'^(فصل\s+.{3,80})$', re.MULTILINE),         # فصل (Section)
    re.compile(r'^(مسألة\s+.{3,80})$', re.MULTILINE),       # مسألة (Issue)
    re.compile(r'^(الباب\s+.{3,80})$', re.MULTILINE),       # الباب
    re.compile(r'^(الفصل\s+.{3,80})$', re.MULTILINE),       # الفصل
]

# Minimum Arabic content per chapter (words)
MIN_AR_WORDS = 50


def rate_limited_get(url: str, retries: int = MAX_RETRIES) -> Optional[str]:
    """Fetch URL with rate limiting and retry. Returns HTML string or None."""
    delay = MIN_DELAY + random.uniform(0, MAX_DELAY - MIN_DELAY)
    time.sleep(delay)

    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; Islam.wiki/1.0; +https://islam.wiki)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en;q=0.9',
    }

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"    404 Not Found: {url}")
                return None
            if e.code == 429 or e.code >= 500:
                wait = RETRY_BACKOFF ** attempt * 5
                print(f"    HTTP {e.code}, retry {attempt+1}/{retries} in {wait:.0f}s…")
                time.sleep(wait)
                continue
            return None
        except Exception as e:
            wait = RETRY_BACKOFF ** attempt * 3
            print(f"    Error: {e}, retry {attempt+1}/{retries} in {wait:.0f}s…")
            time.sleep(wait)

    return None


def extract_arabic_text_maktaba(html: str) -> str:
    """Extract main Arabic content from al-maktaba.org page."""
    # Try to find the main content div
    # al-maktaba.org uses a .nass or #content div for the book text
    for pattern in [
        r'<div[^>]+class="[^"]*nass[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]+id="[^"]*content[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]+class="[^"]*text[^"]*"[^>]*>(.*?)</div>',
    ]:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            raw = match.group(1)
            return clean_arabic_html(raw)

    # Fallback: strip all HTML tags
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_arabic_text_shamela(html: str) -> str:
    """Extract main Arabic content from shamela.ws page."""
    match = re.search(
        r'<div[^>]+id="[^"]*book[^"]*"[^>]*>(.*?)</div>',
        html, re.DOTALL | re.IGNORECASE
    )
    if match:
        return clean_arabic_html(match.group(1))
    text = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', text).strip()


def clean_arabic_html(html: str) -> str:
    """Remove HTML tags while preserving paragraph structure."""
    # Convert <p>, <br>, <div> to newlines first
    html = re.sub(r'<br\s*/?>', '\n', html, flags=re.IGNORECASE)
    html = re.sub(r'</?(p|div|h[1-6])[^>]*>', '\n', html, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r'<[^>]+>', '', html)
    # Decode HTML entities
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>') \
               .replace('&nbsp;', ' ').replace('&#160;', ' ')
    # Collapse blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def detect_ar_chapters(text: str) -> list[dict]:
    """
    Split Arabic text into chapters using heading detection.
    Returns list of {'title': str, 'content': str} dicts.
    """
    # Find all heading positions
    splits: list[tuple[int, str]] = []
    for pattern in AR_HEADING_PATTERNS:
        for m in pattern.finditer(text):
            splits.append((m.start(), m.group(1).strip()))

    if not splits:
        # No headings found — treat entire text as single chapter
        return [{'title': 'Main Text', 'content': text.strip()}]

    # Sort by position
    splits.sort(key=lambda x: x[0])

    chapters: list[dict] = []
    for i, (start, title) in enumerate(splits):
        end = splits[i + 1][0] if i + 1 < len(splits) else len(text)
        content = text[start:end]
        # Remove the heading from the content body
        content = content[len(title):].strip()
        if len(content.split()) >= MIN_AR_WORDS:
            chapters.append({'title': title, 'content': content})

    return chapters if chapters else [{'title': 'Main Text', 'content': text.strip()}]


def wrap_arabic_paragraphs(text: str) -> str:
    """Wrap Arabic text paragraphs in <p> tags."""
    paragraphs = re.split(r'\n\s*\n', text.strip())
    wrapped = []
    for para in paragraphs:
        para = para.strip()
        if para and len(para.split()) >= 3:
            wrapped.append(f'<p>{para}</p>')
    return '\n'.join(wrapped)


def word_count_ar(text: str) -> int:
    """Approximate word count for Arabic text (space-separated tokens)."""
    # Strip HTML tags first
    plain = re.sub(r'<[^>]+>', ' ', text)
    return len(plain.split())


def get_existing_chapters(slug: str) -> dict[int, dict]:
    """Load existing chapter JSON files for a book. Returns {number: data} dict."""
    book_dir = BOOKS_DIR / slug
    existing = {}
    if not book_dir.exists():
        return existing
    for f in book_dir.iterdir():
        if f.suffix == '.json' and f.name not in ('meta.json', 'index.json'):
            try:
                data = json.loads(f.read_text('utf-8'))
                existing[data.get('number', 0)] = data
            except Exception:
                pass
    return existing


def write_chapter(slug: str, chapter_data: dict, dry_run: bool = False) -> None:
    """Write a chapter JSON file. Merges with existing file if present."""
    book_dir = BOOKS_DIR / slug
    number = chapter_data['number']
    filename = f"{number:03d}.json"
    filepath = book_dir / filename

    if filepath.exists():
        existing = json.loads(filepath.read_text('utf-8'))
        existing.update(chapter_data)
        final = existing
    else:
        final = chapter_data

    if not dry_run:
        book_dir.mkdir(parents=True, exist_ok=True)
        filepath.write_text(
            json.dumps(final, ensure_ascii=False, indent=2) + '\n',
            encoding='utf-8'
        )
    else:
        print(f"    (dry-run) Would write {filename} (ch {number}, {word_count_ar(chapter_data.get('content_ar',''))} ar words)")


def update_classical_json(slug: str, updates: dict, dry_run: bool = False) -> None:
    """Update a book's fields in classical.json."""
    if dry_run:
        return
    books = json.loads(CLASSICAL_JSON.read_text('utf-8'))
    for book in books:
        if book.get('slug') == slug:
            book.update(updates)
            break
    CLASSICAL_JSON.write_text(
        json.dumps(books, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8'
    )


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def step_fetch(slug: str, source_url: str, source_type: str, dry_run: bool) -> Optional[str]:
    """Step 1: Fetch HTML from source URL."""
    print(f"  Fetching {source_url}…")
    if dry_run:
        print("  (dry-run) Skipping actual fetch")
        return "<p>dry-run</p>"
    html = rate_limited_get(source_url)
    if not html:
        print(f"  ✗ Failed to fetch source")
        return None
    print(f"  ✓ Fetched {len(html):,} bytes")
    return html


def step_split(slug: str, html: str, source_url: str) -> list[dict]:
    """Step 2: Extract and split Arabic text into chapters."""
    if 'al-maktaba.org' in source_url or 'shamela.ws' in source_url:
        if 'al-maktaba.org' in source_url:
            raw_text = extract_arabic_text_maktaba(html)
        else:
            raw_text = extract_arabic_text_shamela(html)
    else:
        raw_text = clean_arabic_html(html)

    chapters = detect_ar_chapters(raw_text)
    print(f"  ✓ Detected {len(chapters)} Arabic chapters")
    return chapters


def step_write(slug: str, chapters: list[dict], existing_chapters: dict, dry_run: bool) -> int:
    """Step 3: Write chapters to JSON files. Returns count written."""
    written = 0
    for i, ch in enumerate(chapters, start=1):
        existing = existing_chapters.get(i, {})
        chapter_data = {
            **existing,
            'number': i,
            'title_en': existing.get('title_en', f'Chapter {i}'),
            'title_ar': ch['title'],
            'content_ar': wrap_arabic_paragraphs(ch['content']),
            'ar_is_source': True,
            'source_lang': 'ar',
        }
        write_chapter(slug, chapter_data, dry_run=dry_run)
        written += 1

    return written


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(slug: str, step: str = 'all', dry_run: bool = False) -> bool:
    """Run the Arabic pipeline for a single book. Returns True on success."""
    # Load source mapping
    if not SOURCE_MAPPING_JSON.exists():
        print(f"  ✗ source-mapping.json not found at {SOURCE_MAPPING_JSON}")
        return False

    mapping = json.loads(SOURCE_MAPPING_JSON.read_text('utf-8'))
    if slug not in mapping:
        print(f"  ✗ {slug} not in source-mapping.json — add entry first")
        return False

    source = mapping[slug]
    source_url = source.get('source_url', '')
    source_type = source.get('source_type', 'html')
    lang = source.get('lang', 'ar')

    if lang != 'ar':
        print(f"  ✗ source lang is '{lang}', not 'ar' — use a different pipeline")
        return False

    if not source_url:
        print(f"  ✗ No source_url for {slug}")
        update_classical_json(slug, {'source_status': 'no-source'}, dry_run=dry_run)
        return False

    print(f"\n{'='*50}")
    print(f"Book: {slug}")
    print(f"Source: {source_url}")
    print(f"{'='*50}")

    existing_chapters = get_existing_chapters(slug)

    # Step 1: Fetch
    if step in ('fetch', 'all'):
        html = step_fetch(slug, source_url, source_type, dry_run=dry_run)
        if not html:
            update_classical_json(slug, {'source_status': 'no-source'}, dry_run=dry_run)
            return False
    else:
        # For split/write-only steps, we can't proceed without fetching
        print("  ✗ Must run 'fetch' step first for split/write steps (no cached HTML)")
        return False

    # Step 2: Split
    if step in ('split', 'all'):
        chapters = step_split(slug, html, source_url)
        if not chapters:
            print("  ✗ No chapters extracted")
            return False
    else:
        return True  # fetch-only mode

    # Step 3: Write
    if step in ('write', 'all'):
        written = step_write(slug, chapters, existing_chapters, dry_run=dry_run)
        print(f"  ✓ Wrote {written} Arabic chapters")

        if not dry_run:
            update_classical_json(slug, {
                'has_text_ar': True,
                'source_status': 'confirmed',
            })

    return True


def main() -> None:
    parser = argparse.ArgumentParser(description='Fetch Arabic book text from al-maktaba.org/shamela.ws')
    parser.add_argument('--slug', required=True, help='Book slug to process')
    parser.add_argument(
        '--step',
        choices=['fetch', 'split', 'write', 'all'],
        default='all',
        help='Pipeline step to run (default: all)',
    )
    parser.add_argument('--dry-run', action='store_true', help="Don't write files")
    args = parser.parse_args()

    success = run_pipeline(args.slug, step=args.step, dry_run=args.dry_run)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
