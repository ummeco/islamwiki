#!/usr/bin/env python3
"""
Islam.wiki Book Processing Agent Template
==========================================
A 7-step pipeline template that agents use to process a book end-to-end.
Each wave of book-processing agents follows this template.

Steps:
  1. load_chapters()     — read all chapter JSON files for a book
  2. detect_synthetic()  — flag chapters that appear agent-generated (too uniform, no proper nouns)
  3. write_source_md()   — save extracted source text to source/ directory for audit trail
  4. clean_extracted()   — strip PDF artifacts, fix hyphenation, apply word-standardization
  5. write_chapter()     — write updated chapter JSON back to disk
  6. run_qa()            — run qa-standardize.py on the book; fail if errors remain
  7. update_metadata()   — update classical.json has_text_* and qa_passed flags

Usage (as standalone for a single book):
  python scripts/books/book-agent-template.py --slug al-adhkar-nawawi
  python scripts/books/book-agent-template.py --slug al-adhkar-nawawi --step clean

When called by a wave agent, import and call process_book(slug, ...).
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

# ─── Paths ────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent.parent / "web"
BOOKS_DIR = REPO_ROOT / "data" / "books"
CLASSICAL_JSON = BOOKS_DIR / "classical.json"
GLOSSARY_FILE = Path(__file__).parent.parent.parent / ".claude" / "docs" / "translation-glossary-id.md"
WORD_STD_FILE = Path(__file__).parent.parent.parent / ".claude" / "docs" / "word-standardization.md"

# ─── Word Standardization (inline — mirrors qa-standardize.py) ───────────────

REPLACEMENTS: list[tuple[str, str]] = [
    (r"\bQur'an\b", "Quran"),
    (r"\bQur'ān\b", "Quran"),
    (r"\bKoran\b", "Quran"),
    (r"\bhadeeth\b", "hadith"),
    (r"\bsaheeh\b", "sahih"),
    (r"\bda'eef\b", "da'if"),
    (r"\bmawdoo'\b", "mawdu'"),
    (r"\bmarfoo'\b", "marfu'"),
    (r"\bmawqoof\b", "mawquf"),
    (r"\bsalat\b", "salah"),
    (r"\bnamaz\b", "salah"),
    (r"\bzakat\b", "zakah"),
    (r"\bwudhu\b", "wudu"),
    (r"\bwudoo'\b", "wudu"),
    (r"\bazan\b", "adhan"),
    (r"\bathan\b", "adhan"),
    (r"\bqibla\b(?!h)", "qiblah"),
    (r"\baqida\b", "aqeedah"),
    (r"\baqidah\b", "aqeedah"),
    (r"\btawheed\b", "tawhid"),
    (r"\bmazhab\b", "madhab"),
    (r"\bmadhhab\b", "madhab"),
    (r"\bSharia\b(?!h)", "Shariah"),
    (r"\bShari'ah\b", "Shariah"),
    (r"\bAn-Nawawi\b", "Al-Nawawi"),
    (r"\bAsh-Shafi'i\b", "Al-Shafi'i"),
    (r"\bAt-Tirmidhi\b", "Al-Tirmidhi"),
    (r"\bAn-Nasa'i\b", "Al-Nasa'i"),
    (r"\bIbn Taimiyyah\b", "Ibn Taymiyyah"),
    (r"\bIbn Tamiyyah\b", "Ibn Taymiyyah"),
    (r"\bIbnul Qayyim\b", "Ibn al-Qayyim"),
    (r"\bsirah\b", "seerah"),
    (r"\bda'wah\b", "dawah"),
    (r"\bdu'aa\b", "dua"),
    (r"\bumma\b(?!h)", "ummah"),
    (r"\btaqwaa\b", "taqwa"),
    (r"\bzikr\b", "dhikr"),
]

# Stub markers that indicate synthetic/placeholder content
STUB_PATTERNS = [
    r"\bTODO\b", r"\bFIXME\b", r"placeholder", r"lorem ipsum",
    r"\[Translation needed\]", r"\[Content needed\]",
    r"Insert translation here", r"Content coming soon",
    r"This chapter discusses", r"In this chapter, we explore",  # generic AI filler
]

# Synthetic content flags (too uniform, no specifics)
SYNTHETIC_FLAGS = [
    r"It is important to note that",
    r"This is a comprehensive guide",
    r"In this section, we will discuss",
    r"The Islamic perspective on",
    r"According to Islamic teachings",
    r"Islam teaches us that",
]


# ─── Step 1: Load Chapters ────────────────────────────────────────────────────

def load_chapters(slug: str) -> list[dict]:
    """Load all chapter JSON files for a book, sorted by number."""
    book_dir = BOOKS_DIR / slug
    if not book_dir.exists():
        raise FileNotFoundError(f"Book directory not found: {book_dir}")

    chapter_files = sorted(
        f for f in book_dir.iterdir()
        if f.suffix == ".json" and f.name not in ("meta.json", "index.json")
    )

    chapters = []
    for f in chapter_files:
        data = json.loads(f.read_text("utf-8"))
        data["_file"] = str(f)
        chapters.append(data)

    return chapters


# ─── Step 2: Detect Synthetic Content ────────────────────────────────────────

def detect_synthetic(chapters: list[dict]) -> list[dict]:
    """
    Flag chapters that appear to be AI-generated placeholders.
    Sets _synthetic: True on flagged chapters. Does NOT modify content.
    """
    flagged = []
    for ch in chapters:
        content = ch.get("content_en") or ""
        flag_count = sum(
            1 for pat in SYNTHETIC_FLAGS
            if re.search(pat, content, re.IGNORECASE)
        )
        stub_count = sum(
            1 for pat in STUB_PATTERNS
            if re.search(pat, content, re.IGNORECASE)
        )

        # Short content (<200 words) with no proper nouns is suspicious
        word_count = len(re.sub(r"<[^>]+>", " ", content).split())
        has_proper_nouns = bool(re.search(
            r"\b(Al-|Ibn |Abu |Imam |Sheikh |Shaykh )[A-Z]", content
        ))

        is_synthetic = (
            stub_count > 0
            or flag_count >= 2
            or (word_count < 200 and not has_proper_nouns and word_count > 0)
        )

        ch["_synthetic"] = is_synthetic
        if is_synthetic:
            flagged.append(ch.get("number", ch.get("_file", "?")))

    if flagged:
        print(f"  ⚠ Synthetic/stub content detected in chapters: {flagged}")
        print(f"    These must be replaced with real source text before marking qa_passed.")

    return chapters


# ─── Step 3: Write Source Markdown ───────────────────────────────────────────

def write_source_md(slug: str, chapters: list[dict], source_lang: str = "en") -> Path:
    """
    Save extracted source text to source/ directory for audit trail.
    Creates: web/data/books/{slug}/source/source-{lang}.md
    """
    source_dir = BOOKS_DIR / slug / "source"
    source_dir.mkdir(exist_ok=True)

    content_field = f"content_{source_lang}"
    lines = [f"# {slug} — Source Text ({source_lang.upper()})\n"]
    lines.append(f"_Extracted source. Do not edit — re-run extraction to update._\n\n")

    for ch in chapters:
        num = ch.get("number", "?")
        title = ch.get(f"title_{source_lang}") or ch.get("title_en", f"Chapter {num}")
        content = ch.get(content_field) or ""
        clean = re.sub(r"<[^>]+>", " ", content).strip()
        lines.append(f"## Chapter {num}: {title}\n\n{clean}\n\n")

    out_file = source_dir / f"source-{source_lang}.md"
    out_file.write_text("".join(lines), encoding="utf-8")
    print(f"  ✓ Source text saved: {out_file.relative_to(REPO_ROOT.parent)}")
    return out_file


# ─── Step 4: Clean Extracted Text ────────────────────────────────────────────

def strip_pdf_artifacts(text: str) -> str:
    """Remove common PDF extraction artifacts."""
    if not text:
        return text

    # Remove page number patterns (standalone numbers on their own line in HTML)
    text = re.sub(r"<p>\s*\d{1,4}\s*</p>", "", text)

    # Remove running headers (short lines < 60 chars that repeat)
    text = re.sub(r"<p>([^<]{3,60})</p>", lambda m: (
        "" if len(m.group(1).split()) <= 6 and m.group(1).isupper() else m.group(0)
    ), text)

    # Fix broken hyphenation across line breaks
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    text = re.sub(r"(\w)-\s*</p>\s*<p>(\w)", r"\1\2 ", text)

    # Remove excessive whitespace
    text = re.sub(r"\s{3,}", " ", text)
    text = re.sub(r"<p>\s+</p>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def apply_word_standardization(text: str) -> str:
    """Apply standard term replacements from word-standardization.md."""
    for pattern, replacement in REPLACEMENTS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def ensure_html_paragraphs(text: str) -> str:
    """Wrap bare text in <p> tags if not already HTML."""
    if not text or not text.strip():
        return text
    # Already has HTML tags
    if re.search(r"<p[^>]*>", text):
        return text
    # Wrap paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    return "\n".join(f"<p>{p}</p>" for p in paragraphs)


def clean_extracted(chapter: dict) -> dict:
    """Run all cleaning steps on a chapter's content fields."""
    chapter = dict(chapter)

    for lang in ("en", "ar", "id"):
        field = f"content_{lang}"
        if chapter.get(field):
            text = chapter[field]
            text = strip_pdf_artifacts(text)
            if lang == "en":
                text = apply_word_standardization(text)
                text = ensure_html_paragraphs(text)
            chapter[field] = text

    return chapter


# ─── Step 5: Write Chapter ───────────────────────────────────────────────────

def write_chapter(chapter: dict) -> None:
    """Write updated chapter JSON back to disk. Strips internal _* fields."""
    file_path = chapter.get("_file")
    if not file_path:
        raise ValueError("Chapter has no _file path set — cannot write")

    # Strip internal tracking fields
    clean = {k: v for k, v in chapter.items() if not k.startswith("_")}

    Path(file_path).write_text(
        json.dumps(clean, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )


# ─── Step 6: Run QA ──────────────────────────────────────────────────────────

def run_qa(slug: str) -> dict:
    """
    Run qa-standardize.py on a book and return the JSON report.
    Fails if there are un-fixed ERRORs.
    """
    qa_script = Path(__file__).parent / "qa-standardize.py"
    result = subprocess.run(
        [sys.executable, str(qa_script), "--slug", slug, "--report"],
        capture_output=True, text=True
    )

    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"  ✗ QA script returned non-JSON output: {result.stdout[:200]}")
        return {"errors": -1, "warnings": 0}

    errors = report.get("total_errors", 0)
    warnings = report.get("total_warnings", 0)

    if errors == 0:
        print(f"  ✅ QA passed — {warnings} warning(s)")
    else:
        print(f"  ❌ QA FAILED — {errors} error(s), {warnings} warning(s)")
        # Print chapter-level details
        for ch in report.get("results", [{}])[0].get("chapter_results", []):
            if ch.get("errors", 0) > 0:
                print(f"     {ch['file']}: {ch['errors']} errors")

    return report


# ─── Step 7: Update Metadata ─────────────────────────────────────────────────

def update_metadata(slug: str, qa_report: dict) -> None:
    """Update classical.json has_text_* and qa_passed flags for this book."""
    books = json.loads(CLASSICAL_JSON.read_text("utf-8"))

    book_dir = BOOKS_DIR / slug
    chapter_files = [
        f for f in book_dir.iterdir()
        if f.suffix == ".json" and f.name not in ("meta.json", "index.json")
    ]

    def count_lang(lang: str, min_words: int = 50) -> int:
        count = 0
        for f in chapter_files:
            ch = json.loads(f.read_text("utf-8"))
            content = ch.get(f"content_{lang}") or ""
            wc = len(re.sub(r"<[^>]+>", " ", content).split())
            if wc >= min_words:
                count += 1
        return count

    has_en = count_lang("en", 300) >= max(1, len(chapter_files) // 2)
    has_ar = count_lang("ar", 50) >= max(1, len(chapter_files) // 2)
    has_id = count_lang("id", 200) >= max(1, len(chapter_files) // 2)
    qa_passed = qa_report.get("total_errors", 1) == 0

    updated = []
    for book in books:
        if book["slug"] == slug:
            book = {
                **book,
                "has_text_en": has_en,
                "has_text_ar": has_ar,
                "has_text_id": has_id,
                "qa_passed": qa_passed,
            }
            if not qa_passed and qa_report.get("total_errors"):
                # Collect error messages from report
                errors = []
                for r in qa_report.get("results", []):
                    for ch in r.get("chapter_results", []):
                        if isinstance(ch, dict) and ch.get("errors"):
                            errors.append(ch.get("file", ""))
                book["qa_errors"] = errors[:10]  # cap at 10
        updated.append(book)

    CLASSICAL_JSON.write_text(
        json.dumps(updated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(f"  ✓ Metadata updated: has_text_en={has_en}, has_text_ar={has_ar}, "
          f"has_text_id={has_id}, qa_passed={qa_passed}")


# ─── Full Pipeline ────────────────────────────────────────────────────────────

def process_book(
    slug: str,
    run_clean: bool = True,
    run_source_backup: bool = True,
    write_back: bool = True,
    run_qa_check: bool = True,
    run_metadata_update: bool = True,
) -> bool:
    """
    Run the full 7-step pipeline for a book.
    Returns True if all steps passed, False if QA failed.
    """
    print(f"\n{'─'*60}")
    print(f"Processing: {slug}")
    print(f"{'─'*60}")

    try:
        # Step 1: Load
        print("Step 1: Loading chapters…")
        chapters = load_chapters(slug)
        print(f"  {len(chapters)} chapter(s) found")

        # Step 2: Detect synthetic
        print("Step 2: Checking for synthetic content…")
        chapters = detect_synthetic(chapters)

        # Step 3: Write source backup
        if run_source_backup:
            print("Step 3: Writing source backup…")
            write_source_md(slug, chapters, source_lang="en")

        # Step 4: Clean
        if run_clean:
            print("Step 4: Cleaning extracted text…")
            chapters = [clean_extracted(ch) for ch in chapters]

        # Step 5: Write back
        if write_back and run_clean:
            print("Step 5: Writing chapters to disk…")
            for ch in chapters:
                write_chapter(ch)
            print(f"  ✓ {len(chapters)} chapter(s) written")

        # Step 6: QA
        qa_report = {"total_errors": 0, "total_warnings": 0}
        if run_qa_check:
            print("Step 6: Running QA checks…")
            qa_report = run_qa(slug)

        # Step 7: Update metadata
        if run_metadata_update:
            print("Step 7: Updating classical.json metadata…")
            update_metadata(slug, qa_report)

        passed = qa_report.get("total_errors", 0) == 0
        print(f"\n{'✅ DONE' if passed else '❌ QA FAILED'}: {slug}")
        return passed

    except Exception as e:
        print(f"\n❌ ERROR processing {slug}: {e}")
        import traceback
        traceback.print_exc()
        return False


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Islam.wiki Book Processing Agent Template",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--slug", required=True, help="Book slug to process")
    parser.add_argument("--step", choices=["load", "detect", "source", "clean", "write", "qa", "meta", "all"],
                        default="all", help="Run a specific step only (default: all)")
    parser.add_argument("--no-write", action="store_true", help="Dry run — don't write files")
    args = parser.parse_args()

    if args.step == "all":
        success = process_book(
            slug=args.slug,
            run_clean=True,
            run_source_backup=True,
            write_back=not args.no_write,
            run_qa_check=True,
            run_metadata_update=not args.no_write,
        )
        sys.exit(0 if success else 1)

    # Step-by-step mode
    if args.step == "load":
        chapters = load_chapters(args.slug)
        print(f"Loaded {len(chapters)} chapters")
        for ch in chapters:
            print(f"  [{ch.get('_file','').split('/')[-1]}] ch.{ch.get('number','')} — "
                  f"{len((ch.get('content_en') or '').split())} words EN")

    elif args.step == "detect":
        chapters = load_chapters(args.slug)
        detect_synthetic(chapters)

    elif args.step == "source":
        chapters = load_chapters(args.slug)
        write_source_md(args.slug, chapters)

    elif args.step == "clean":
        chapters = load_chapters(args.slug)
        for i, ch in enumerate(chapters):
            chapters[i] = clean_extracted(ch)
        if not args.no_write:
            for ch in chapters:
                write_chapter(ch)
            print(f"Cleaned and wrote {len(chapters)} chapters")
        else:
            print(f"(dry run) Would clean {len(chapters)} chapters")

    elif args.step == "qa":
        run_qa(args.slug)

    elif args.step == "meta":
        qa_report = run_qa(args.slug)
        if not args.no_write:
            update_metadata(args.slug, qa_report)


if __name__ == "__main__":
    main()
