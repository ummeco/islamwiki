#!/usr/bin/env python3
"""
Islam.wiki Books QA Standardizer
=================================
Validates and optionally auto-fixes book chapter JSON files against:
  - word-standardization.md (term spellings, scholar names)
  - HTML validity (well-formed <p> tags, no bare text)
  - Word counts (EN ≥300, ID ≥200, AR ≥50 if present)
  - Required fields (number, title_en, content_en)
  - No stubs (TODO/FIXME/placeholder/lorem ipsum)
  - Source provenance fields consistency

Usage:
  python scripts/books/qa-standardize.py --slug kitab-at-tawhid
  python scripts/books/qa-standardize.py --all
  python scripts/books/qa-standardize.py --all --report
  python scripts/books/qa-standardize.py --slug kitab-at-tawhid --autofix
  python scripts/books/qa-standardize.py --all --metadata-only
"""

import argparse
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

# ─── Paths ────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent.parent / "web"
BOOKS_DIR = REPO_ROOT / "data" / "books"
CLASSICAL_JSON = BOOKS_DIR / "classical.json"

# ─── Word Standardization Rules ───────────────────────────────────────────────

# ERROR: must fix (clear wrong spelling)
TERM_ERRORS: list[tuple[str, str]] = [
    # Quran-related
    (r"\bQur'an\b", "Quran"),
    (r"\bQur'ān\b", "Quran"),
    (r"\bKoran\b", "Quran"),
    (r"\bsura\b(?!h)", "surah"),
    (r"\bsoorah\b", "surah"),
    # Hadith sciences
    (r"\bhadeeth\b", "hadith"),
    (r"\bhadeef\b", "hadith"),
    (r"\bsaheeh\b", "sahih"),
    (r"\bda'eef\b", "da'if"),
    (r"\bda'eef\b", "da'if"),
    (r"\bmawdoo'\b", "mawdu'"),
    (r"\bmarfoo'\b", "marfu'"),
    (r"\bmawqoof\b", "mawquf"),
    # Prayer
    (r"\bsalat\b", "salah"),
    (r"\bnamaz\b", "salah"),
    (r"\bzakat\b", "zakah"),
    (r"\bwudhu\b", "wudu"),
    (r"\bwudoo'\b", "wudu"),
    (r"\bazan\b", "adhan"),
    (r"\bathan\b", "adhan"),
    (r"\bqibla\b(?!h)", "qiblah"),
    # Theology
    (r"\baqida\b", "aqeedah"),
    (r"\baqidah\b", "aqeedah"),
    (r"\btawheed\b", "tawhid"),
    (r"\bbid'a\b(?!h)", "bid'ah"),
    (r"\bmazhab\b", "madhab"),
    (r"\bmadhhab\b", "madhab"),
    # Shariah
    (r"\bSharia\b(?!h)", "Shariah"),
    (r"\bShari'ah\b", "Shariah"),
    (r"\bShar'iah\b", "Shariah"),
    # Scholar names
    (r"(?<!Al-)(?<!al-)\bBukhari\b(?!\s+|$)", "Al-Bukhari"),  # only when standalone without Al-
    (r"\bAn-Nawawi\b", "Al-Nawawi"),
    (r"\bAsh-Shafi'i\b", "Al-Shafi'i"),
    (r"\bAt-Tirmidhi\b", "Al-Tirmidhi"),
    (r"\bAn-Nasa'i\b", "Al-Nasa'i"),
    (r"\bIbn Taimiyyah\b", "Ibn Taymiyyah"),
    (r"\bIbn Tamiyyah\b", "Ibn Taymiyyah"),
    (r"\bIbn Qayyim al-Jawziyyah\b", "Ibn al-Qayyim"),
    (r"\bIbnul Qayyim\b", "Ibn al-Qayyim"),
    (r"\bIbn Kudama\b", "Ibn Qudamah"),
    # Common terms
    (r"\bsirah\b", "seerah"),
    (r"\bsīrah\b", "seerah"),
    (r"\bda'wa\b(?!h)", "dawah"),
    (r"\bda'wah\b", "dawah"),
    (r"\bdu'a\b(?!,)", "dua"),
    (r"\bdu'aa\b", "dua"),
    (r"\bdhulm\b", "zulm"),
    (r"\bumma\b(?!h)", "ummah"),
    (r"\btaqwaa\b", "taqwa"),
    (r"\bzikr\b", "dhikr"),
    (r"\bdikr\b", "dhikr"),
]

# WARNING: flag but don't auto-fix (context-dependent)
TERM_WARNINGS: list[tuple[str, str]] = [
    (r"\bmosque\b", "prefer 'masjid' in scholarly text (mosque ok in layman context)"),
    (r"\bprayer\b", "prefer 'salah' in scholarly text (prayer ok in layman context)"),
    (r"\bfasting\b", "prefer 'sawm' in scholarly text"),
    (r"\bcaliph\b", "prefer 'khalifah' in scholarly text"),
    (r"\bscholars\b", "consider 'ulema' in scholarly text"),
    (r"\(pbuh\)", "use ﷺ not (pbuh)"),
    (r"\(s\.a\.w\.\)", "use ﷺ not (s.a.w.)"),
    (r"\(PBUH\)", "use ﷺ not (PBUH)"),
    (r"\(R\.A\.\)", "use (ra) not (R.A.)"),
    (r"TODO|FIXME|placeholder|lorem ipsum", "stub text found — must replace"),
    (r"Lorem ipsum", "stub text found — must replace"),
    (r"\[Translation needed\]", "stub marker found — must replace"),
    (r"\[Content needed\]", "stub marker found — must replace"),
]

# ─── HTML Validator ────────────────────────────────────────────────────────────

class HTMLStructureChecker(HTMLParser):
    """Checks that content is wrapped in valid <p> tags with no bare text."""

    def __init__(self) -> None:
        super().__init__()
        self.errors: list[str] = []
        self.open_tags: list[str] = []
        self.allowed_tags = {"p", "b", "strong", "i", "em", "br", "span", "a", "ul", "ol", "li", "blockquote"}

    def handle_starttag(self, tag: str, attrs: list) -> None:
        if tag not in self.allowed_tags:
            self.errors.append(f"disallowed tag <{tag}>")
        self.open_tags.append(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.open_tags and self.open_tags[-1] == tag:
            self.open_tags.pop()
        else:
            self.errors.append(f"mismatched closing tag </{tag}>")

    def handle_data(self, data: str) -> None:
        if data.strip() and (not self.open_tags or self.open_tags[-1] == "body"):
            self.errors.append("bare text outside of tags")

    def get_errors(self) -> list[str]:
        if self.open_tags:
            self.errors.append(f"unclosed tags: {self.open_tags}")
        return self.errors


def validate_html(content: str) -> list[str]:
    """Returns list of HTML errors."""
    if not content or not content.strip():
        return []
    checker = HTMLStructureChecker()
    try:
        checker.feed(content)
        return checker.get_errors()
    except Exception as e:
        return [f"HTML parse error: {e}"]


# ─── Word Count ────────────────────────────────────────────────────────────────

def word_count(text: str) -> int:
    """Count words in text, stripping HTML tags."""
    clean = re.sub(r"<[^>]+>", " ", text or "")
    return len(clean.split())


# ─── Term Checker ─────────────────────────────────────────────────────────────

def check_terms(text: str, is_autofix: bool = False) -> tuple[str, list[dict]]:
    """Apply term standardization. Returns (fixed_text, list_of_issues)."""
    issues = []
    result = text

    for pattern, replacement in TERM_ERRORS:
        if re.search(pattern, text, re.IGNORECASE):
            if is_autofix:
                result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
                issues.append({"level": "ERROR", "fixed": True,
                                "msg": f"'{pattern}' → '{replacement}'"})
            else:
                issues.append({"level": "ERROR", "fixed": False,
                                "msg": f"Non-standard term matching '{pattern}' — use '{replacement}'"})

    for pattern, note in TERM_WARNINGS:
        if re.search(pattern, text, re.IGNORECASE):
            issues.append({"level": "WARN", "fixed": False, "msg": note})

    return result, issues


# ─── Required Fields ──────────────────────────────────────────────────────────

REQUIRED_FIELDS = ["number", "title_en", "content_en"]

PROVENANCE_PAIRS = [
    ("en_translated_from_ar", "translation_credit"),
    ("id_translated_from_en", "translation_credit"),
    ("id_translated_from_ar", "translation_credit"),
]


def check_required_fields(chapter: dict) -> list[dict]:
    issues = []
    for field in REQUIRED_FIELDS:
        if field not in chapter or chapter[field] is None:
            issues.append({"level": "ERROR", "fixed": False,
                           "msg": f"Missing required field: '{field}'"})
        elif field == "content_en" and not str(chapter[field]).strip():
            issues.append({"level": "ERROR", "fixed": False,
                           "msg": "content_en is empty"})
    return issues


def check_provenance(chapter: dict) -> list[dict]:
    issues = []
    for flag_field, credit_field in PROVENANCE_PAIRS:
        if chapter.get(flag_field) and not chapter.get(credit_field):
            issues.append({"level": "WARN", "fixed": False,
                           "msg": f"'{flag_field}' is true but '{credit_field}' is not set"})
    if chapter.get("source_url") and not chapter.get("source_type"):
        issues.append({"level": "WARN", "fixed": False,
                       "msg": "source_url set but source_type not set"})
    return issues


# ─── Chapter QA ───────────────────────────────────────────────────────────────

def qa_chapter(chapter: dict, autofix: bool = False) -> tuple[dict, list[dict]]:
    """Run all QA checks on a chapter. Returns (possibly_fixed_chapter, issues)."""
    issues: list[dict] = []

    # Required fields
    issues.extend(check_required_fields(chapter))

    content_en = chapter.get("content_en") or ""
    content_id = chapter.get("content_id") or ""
    content_ar = chapter.get("content_ar") or ""

    # Word counts
    wc_en = word_count(content_en)
    if content_en.strip() and wc_en < 300:
        issues.append({"level": "ERROR", "fixed": False,
                       "msg": f"content_en too short: {wc_en} words (min 300)"})

    if content_id.strip():
        wc_id = word_count(content_id)
        if wc_id < 200:
            issues.append({"level": "WARN", "fixed": False,
                           "msg": f"content_id too short: {wc_id} words (min 200)"})

    if content_ar.strip():
        wc_ar = word_count(content_ar)
        if wc_ar < 50:
            issues.append({"level": "WARN", "fixed": False,
                           "msg": f"content_ar too short: {wc_ar} words (min 50)"})

    # HTML structure check on EN
    if content_en.strip():
        html_errors = validate_html(content_en)
        for e in html_errors[:3]:  # cap at 3 per chapter
            issues.append({"level": "WARN", "fixed": False,
                           "msg": f"HTML issue in content_en: {e}"})

    # Term standardization on EN text
    if content_en.strip():
        fixed_en, term_issues = check_terms(content_en, is_autofix=autofix)
        issues.extend(term_issues)
        if autofix:
            chapter = {**chapter, "content_en": fixed_en}

    # Stub detection in all fields
    stub_patterns = [
        r"\bTODO\b", r"\bFIXME\b", r"placeholder", r"lorem ipsum",
        r"\[Translation needed\]", r"\[Content needed\]",
        r"Insert translation here", r"Content coming soon",
    ]
    combined = f"{chapter.get('title_en','')} {content_en} {content_id}"
    for pat in stub_patterns:
        if re.search(pat, combined, re.IGNORECASE):
            issues.append({"level": "ERROR", "fixed": False,
                           "msg": f"Stub text detected: '{pat}'"})
            break

    # Provenance checks
    issues.extend(check_provenance(chapter))

    # QA passed flag
    has_errors = any(i["level"] == "ERROR" and not i.get("fixed") for i in issues)
    if autofix:
        chapter = {**chapter, "qa_passed": not has_errors,
                   "qa_errors": [i["msg"] for i in issues if i["level"] == "ERROR"]}

    return chapter, issues


# ─── Book QA ──────────────────────────────────────────────────────────────────

def qa_book(slug: str, autofix: bool = False, metadata_only: bool = False,
            verbose: bool = True) -> dict:
    """Run QA on all chapters of a book. Returns summary dict."""
    book_dir = BOOKS_DIR / slug
    if not book_dir.exists():
        return {"slug": slug, "error": "Directory not found", "chapters": 0,
                "errors": 1, "warnings": 0}

    chapter_files = sorted(
        f for f in book_dir.iterdir()
        if f.suffix == ".json" and f.name not in ("meta.json", "index.json")
    )

    if not chapter_files:
        return {"slug": slug, "error": "No chapter files", "chapters": 0,
                "errors": 1, "warnings": 0}

    if metadata_only:
        return {"slug": slug, "chapters": len(chapter_files), "errors": 0,
                "warnings": 0, "metadata_only": True}

    total_errors = 0
    total_warnings = 0
    chapter_results = []

    for cfile in chapter_files:
        try:
            raw = json.loads(cfile.read_text("utf-8"))
        except json.JSONDecodeError as e:
            chapter_results.append({"file": cfile.name, "errors": [f"JSON parse error: {e}"]})
            total_errors += 1
            continue

        fixed, issues = qa_chapter(raw, autofix=autofix)

        chapter_errors = [i for i in issues if i["level"] == "ERROR"]
        chapter_warns = [i for i in issues if i["level"] == "WARN"]
        total_errors += len(chapter_errors)
        total_warnings += len(chapter_warns)

        if autofix and fixed != raw:
            cfile.write_text(json.dumps(fixed, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")

        if verbose and (chapter_errors or chapter_warns):
            print(f"  [{cfile.name}]")
            for i in chapter_errors:
                prefix = "  ✓ FIXED" if i.get("fixed") else "  ✗ ERROR"
                print(f"    {prefix}: {i['msg']}")
            for i in chapter_warns:
                print(f"    ⚠ WARN:  {i['msg']}")

        chapter_results.append({
            "file": cfile.name,
            "errors": len(chapter_errors),
            "warnings": len(chapter_warns),
        })

    return {
        "slug": slug,
        "chapters": len(chapter_files),
        "errors": total_errors,
        "warnings": total_warnings,
        "chapter_results": chapter_results,
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Islam.wiki Books QA Standardizer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--slug", help="Process a single book slug")
    group.add_argument("--all", action="store_true", help="Process all canonical books")

    parser.add_argument("--autofix", action="store_true",
                        help="Auto-fix ERROR-level term violations (safe find/replace only)")
    parser.add_argument("--report", action="store_true",
                        help="Output JSON summary report to stdout")
    parser.add_argument("--metadata-only", action="store_true",
                        help="Only check metadata fields, skip content QA")
    parser.add_argument("--min-words", type=int, default=300,
                        help="Minimum EN word count (default: 300)")
    args = parser.parse_args()

    # Load canonical book list
    try:
        books_data = json.loads(CLASSICAL_JSON.read_text("utf-8"))
    except Exception as e:
        print(f"Error loading classical.json: {e}", file=sys.stderr)
        sys.exit(1)

    canonical_slugs = [b["slug"] for b in books_data if b.get("canonical") is not False]

    if args.slug:
        slugs = [args.slug]
    else:
        slugs = canonical_slugs

    results = []
    total_errors = 0
    total_warnings = 0
    books_with_errors = 0

    print(f"Running QA on {len(slugs)} book(s)…", file=sys.stderr)

    for i, slug in enumerate(slugs, 1):
        if not args.report:
            print(f"\n[{i}/{len(slugs)}] {slug}")
        result = qa_book(slug, autofix=args.autofix,
                         metadata_only=args.metadata_only,
                         verbose=not args.report)
        results.append(result)
        total_errors += result.get("errors", 0)
        total_warnings += result.get("warnings", 0)
        if result.get("errors", 0) > 0:
            books_with_errors += 1

    # Summary
    summary = {
        "books_checked": len(slugs),
        "books_with_errors": books_with_errors,
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "autofix": args.autofix,
        "results": results,
    }

    if args.report:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print(f"\n{'='*60}")
        print(f"Books checked:      {len(slugs)}")
        print(f"Books with errors:  {books_with_errors}")
        print(f"Total ERRORs:       {total_errors}")
        print(f"Total WARNINGs:     {total_warnings}")
        if args.autofix:
            print("Auto-fix applied:   YES")
        print(f"{'='*60}")
        if total_errors == 0:
            print("✅ All checks passed!")
        else:
            print("❌ Errors found — review and fix before marking qa_passed: true")
            sys.exit(1)


if __name__ == "__main__":
    main()
