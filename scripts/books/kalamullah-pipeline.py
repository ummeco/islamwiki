#!/usr/bin/env python3
"""
Kalamullah → Islam.wiki Books Pipeline (v2 — curated mapping)

Downloads PDFs from Internet Archive Kalamullah collection,
extracts text using PyMuPDF, splits into chapters, and writes
chapter JSON files to web/data/books/{slug}/*.json

Uses scripts/books/kalamullah-mapping.json for precise PDF→slug mapping.

Usage:
  python3 scripts/books/kalamullah-pipeline.py [--dry-run] [--slug SLUG] [--overwrite]

Options:
  --dry-run     Show what would be done, don't write
  --slug SLUG   Only process this book slug
  --overwrite   Overwrite existing chapters (default: skip books with 3+ real chapters)
  --list        List all mapped books and exit
"""

import os, re, sys, json, time, unicodedata, argparse, urllib.request, urllib.parse
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
BOOKS_DIR = REPO_ROOT / "web" / "data" / "books"
SCRIPTS_DIR = Path(__file__).parent
CACHE_DIR = SCRIPTS_DIR / ".cache"
PDFS_DIR = CACHE_DIR / "pdfs"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
PDFS_DIR.mkdir(parents=True, exist_ok=True)

ARCHIVE_ID = "islamicbooksfromkalamullahcollection"
ARCHIVE_BASE = f"https://archive.org/download/{ARCHIVE_ID}"
ARCHIVE_META = f"https://archive.org/metadata/{ARCHIVE_ID}"


def load_mapping() -> dict[str, str]:
    """Load curated PDF filename → slug mapping."""
    mapping_file = SCRIPTS_DIR / "kalamullah-mapping.json"
    with open(mapping_file) as f:
        raw = json.load(f)
    # Remove comment keys
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def get_archive_files() -> dict[str, dict]:
    """Get all files in archive collection. Returns {filename_without_ext: file_meta}."""
    cache = CACHE_DIR / "kalamullah-manifest.json"
    if cache.exists():
        meta = json.load(open(cache))
    else:
        print("Fetching archive manifest...")
        req = urllib.request.Request(ARCHIVE_META, headers={"User-Agent": "islamwiki/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            meta = json.loads(r.read())
        json.dump(meta, open(cache, "w"))

    files = {}
    for f in meta.get("files", []):
        name = f.get("name", "")
        if name.lower().endswith(".pdf"):
            key = name[:-4]  # strip .pdf
            files[key] = {
                "filename": name,
                "size": int(f.get("size", 0)),
                "url": f"{ARCHIVE_BASE}/{urllib.parse.quote(name)}",
            }
    return files


def download_pdf(file_meta: dict) -> Path | None:
    """Download PDF to local cache."""
    local = PDFS_DIR / file_meta["filename"]
    if local.exists() and local.stat().st_size > 5000:
        return local

    mb = file_meta["size"] / 1024 / 1024
    print(f"    Downloading {file_meta['filename']} ({mb:.1f}MB)...")
    try:
        req = urllib.request.Request(file_meta["url"], headers={"User-Agent": "islamwiki/1.0"})
        with urllib.request.urlopen(req, timeout=180) as r:
            data = r.read()
        local.write_bytes(data)
        return local
    except Exception as e:
        print(f"    FAIL: {e}")
        if local.exists():
            local.unlink()
        return None


def clean_text(text: str) -> str:
    """Clean extracted PDF text."""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove standalone page numbers
    text = re.sub(r"\n\s*\d{1,4}\s*\n", "\n", text)
    return text.strip()


def text_to_html(text: str) -> str:
    """Convert plain text to HTML paragraphs."""
    parts = []
    for para in re.split(r"\n{2,}", text):
        para = para.strip()
        if not para:
            continue
        if len(para) < 80 and re.match(r"^[A-Z\s\d]{5,}$", para):
            parts.append(f"<h3>{para.title()}</h3>")
        else:
            para = re.sub(r"\s+", " ", para)
            parts.append(f"<p>{para}</p>")
    return "\n".join(parts)


def extract_pdf(pdf_path: Path) -> list[tuple[str, str]]:
    """
    Extract (title, content) chapters from PDF.
    Returns list of (chapter_title, chapter_text).
    """
    import fitz

    try:
        doc = fitz.open(str(pdf_path))
    except Exception as e:
        print(f"    FAIL open PDF: {e}")
        return []

    pages = len(doc)
    print(f"    {pages} pages...")

    # Try TOC first — only if entries are real chapters (not per-page bookmarks)
    toc = doc.get_toc()
    top_toc = [(t, p - 1) for lv, t, p in toc if lv == 1 and t.strip()]
    use_toc = len(top_toc) >= 3 and len(top_toc) < pages * 0.5

    if use_toc:
        print(f"    Using TOC ({len(top_toc)} entries)")
        chapters = []
        for i, (title, start) in enumerate(top_toc):
            end = top_toc[i + 1][1] if i + 1 < len(top_toc) else pages
            text = ""
            for pg in range(start, min(end, pages)):
                text += doc[pg].get_text() + "\n\n"
            text = clean_text(text)
            if len(text.split()) >= 100:
                chapters.append((title.strip(), text))
        if chapters:
            doc.close()
            return chapters

    # Full text extraction + heuristic chapter split
    full_text = ""
    for pg in range(pages):
        full_text += doc[pg].get_text() + "\n\n"
    doc.close()

    full_text = clean_text(full_text)
    words = len(full_text.split())
    if words < 300:
        print(f"    SCANNED/EMPTY ({words} words)")
        return []

    print(f"    {words} words extracted")
    return heuristic_split(full_text)


CHAPTER_RE = re.compile(
    r"^(?:CHAPTER\s+\d+|Chapter\s+\d+|Chapter\s+[A-Z][a-z]+|\d+\.\s+[A-Z]|"
    r"(?:I{1,3}|IV|VI{0,3}|IX|X{0,3})\.\s+[A-Z]|"
    r"SECTION\s+\d+|Section\s+\d+).*$",
    re.MULTILINE,
)


def heuristic_split(text: str, target: int = 900) -> list[tuple[str, str]]:
    """Split text into chapters using headings or size-based chunking."""
    lines = text.split("\n")
    chapters = []
    current_title = "Introduction"
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if CHAPTER_RE.match(stripped) and len(stripped) < 120:
            content = "\n".join(current_lines).strip()
            if len(content.split()) >= 80:
                chapters.append((current_title, content))
            current_title = stripped
            current_lines = []
        else:
            current_lines.append(line)

    content = "\n".join(current_lines).strip()
    if len(content.split()) >= 80:
        chapters.append((current_title, content))

    if len(chapters) <= 1:
        # No headings found — chunk by size
        return size_split(text, target)

    return chapters


def size_split(text: str, target: int = 900) -> list[tuple[str, str]]:
    """Split text into roughly equal chunks."""
    words = text.split()
    if not words:
        return []
    chunks = []
    i = 0
    num = 0
    while i < len(words):
        chunk = " ".join(words[i: i + target])
        # Try to end on sentence boundary
        for end in ["? ", "! ", ". "]:
            pos = chunk.rfind(end)
            if pos > len(chunk) * 0.6:
                chunk = chunk[:pos + 1]
                break
        num += 1
        chunks.append((f"Part {num}", chunk))
        i += len(chunk.split())
    return chunks


def chapters_to_json(raw_chapters: list[tuple[str, str]], start_num: int = 1) -> list[dict]:
    """Convert (title, text) pairs to chapter JSON dicts."""
    result = []
    for i, (title, text) in enumerate(raw_chapters):
        result.append({
            "number": start_num + i,
            "title_en": title,
            "title_ar": "",
            "content_en": text_to_html(text),
        })
    return result


def has_real_chapters(slug: str) -> bool:
    """Check if a book already has real (non-synthetic) chapters."""
    book_dir = BOOKS_DIR / slug
    if not book_dir.exists():
        return False
    files = sorted(book_dir.glob("*.json"))
    if len(files) < 3:
        return False
    # Check if first chapter looks AI-generated (very short, "Introduction" title)
    try:
        ch = json.load(open(files[0]))
        title = ch.get("title_en", "")
        content = ch.get("content_en", "")
        wc = len(re.sub("<[^>]+>", "", content).split())
        # Synthetic chapters tend to have generic titles + moderate length
        if title in ("Introduction", "Author Biography and Historical Context",
                     "Introduction to the Author and His Methodology") and wc < 800:
            return False  # likely synthetic
    except Exception:
        pass
    return True


def write_chapters(slug: str, chapters: list[dict], overwrite: bool) -> int:
    """Write chapters to web/data/books/{slug}/. Returns count written."""
    book_dir = BOOKS_DIR / slug
    book_dir.mkdir(exist_ok=True)

    existing = sorted(book_dir.glob("*.json"))
    if existing and not overwrite:
        return 0  # skip

    for f in existing:
        f.unlink()

    for ch in chapters:
        path = book_dir / f"{ch['number']:03d}.json"
        json.dump(ch, open(path, "w"), ensure_ascii=False, indent=2)

    return len(chapters)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--slug")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--list", action="store_true")
    args = parser.parse_args()

    mapping = load_mapping()
    archive_files = get_archive_files()

    # Build slug → list of PDF filenames (preserving volume order)
    slug_to_pdfs: dict[str, list[str]] = {}
    for pdf_name, slug in mapping.items():
        if pdf_name not in archive_files:
            # Try case-insensitive match
            lower_map = {k.lower(): k for k in archive_files}
            actual = lower_map.get(pdf_name.lower())
            if actual:
                pdf_name = actual
            else:
                print(f"  MISSING in archive: {pdf_name}")
                continue
        slug_to_pdfs.setdefault(slug, []).append(pdf_name)

    if args.list:
        print(f"{'Slug':<50} {'PDFs'}")
        print("-" * 80)
        for slug in sorted(slug_to_pdfs):
            pdfs = slug_to_pdfs[slug]
            real = has_real_chapters(slug)
            tag = "(real)" if real else "(synthetic)"
            for pdf in pdfs:
                print(f"  {slug:<50} {tag} ← {pdf}")
        print(f"\nTotal: {len(slug_to_pdfs)} books from {sum(len(v) for v in slug_to_pdfs.values())} PDFs")
        return

    # Filter by slug if requested
    if args.slug:
        if args.slug not in slug_to_pdfs:
            print(f"ERROR: slug '{args.slug}' not in mapping")
            sys.exit(1)
        slug_to_pdfs = {args.slug: slug_to_pdfs[args.slug]}

    print(f"\nProcessing {len(slug_to_pdfs)} books...")
    total_written = 0
    skipped = 0
    failed = []

    for slug, pdf_names in sorted(slug_to_pdfs.items()):
        print(f"\n{'─' * 60}")
        print(f"Book: {slug}")
        print(f"PDFs: {', '.join(pdf_names)}")

        # Check if already has real content
        if not args.overwrite and has_real_chapters(slug):
            print(f"  SKIP — already has real chapters")
            skipped += 1
            continue

        # Collect chapters from all volumes
        all_chapters_raw = []
        any_scanned = False

        for pdf_name in sorted(pdf_names):  # sort ensures Vol 1 before Vol 2
            file_meta = archive_files[pdf_name]
            print(f"\n  Volume: {pdf_name}")

            if args.dry_run:
                print(f"    DRY-RUN: would download {file_meta['filename']}")
                continue

            pdf_path = download_pdf(file_meta)
            if not pdf_path:
                failed.append(f"{slug}: download failed for {pdf_name}")
                continue

            chapters = extract_pdf(pdf_path)
            if not chapters:
                any_scanned = True
                failed.append(f"{slug}: no extractable text in {pdf_name}")
                continue

            all_chapters_raw.extend(chapters)

        if args.dry_run:
            continue

        if not all_chapters_raw:
            if any_scanned:
                print(f"  SKIP — all PDFs are scanned images")
            continue

        # Number chapters sequentially across volumes
        chapters_json = chapters_to_json(all_chapters_raw)
        print(f"\n  Total chapters: {len(chapters_json)}")

        written = write_chapters(slug, chapters_json, overwrite=True)
        total_written += written
        print(f"  Written: {written} chapters to web/data/books/{slug}/")

        time.sleep(0.3)

    print(f"\n{'=' * 60}")
    print(f"Done: {total_written} chapters written, {skipped} skipped, {len(failed)} failures")
    if failed:
        print("Failures:")
        for f in failed:
            print(f"  {f}")


if __name__ == "__main__":
    main()
