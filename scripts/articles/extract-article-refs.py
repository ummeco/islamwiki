#!/usr/bin/env python3
"""
extract-article-refs.py

F1.1 + F1.2 — Parse all 500 articles in web/data/articles/articles.json and extract:
  - quran_refs: ["2:255", "3:102", ...] (deduplicated, sorted)
  - hadith_refs: ["bukhari", "muslim:456", ...] (deduplicated, sorted)

Adds both fields to each article object in articles.json in-place.

Usage:
    python3 scripts/articles/extract-article-refs.py
    python3 scripts/articles/extract-article-refs.py --dry-run   # print stats, no write
    python3 scripts/articles/extract-article-refs.py --verbose   # show matched refs per article
"""

import json
import re
import sys
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ARTICLES_PATH = REPO_ROOT / "web/data/articles/articles.json"
SURAHS_PATH   = REPO_ROOT / "web/data/quran/surahs.json"
SCHOLARS_PATH = REPO_ROOT / "web/data/people/scholars.json"

DRY_RUN = "--dry-run" in sys.argv
VERBOSE = "--verbose" in sys.argv

# ---------------------------------------------------------------------------
# Build surah name → number mapping from surahs.json
# ---------------------------------------------------------------------------

def build_surah_map(surahs: list[dict]) -> dict[str, int]:
    """
    Returns a dict mapping every known surah name/slug variant → surah number (1-114).

    Keys produced per surah (all lowercased, stripped of diacritics):
      - slug:                "al-fatiha"
      - name_transliteration: "Al-Fatiha"
      - name_en:             "The Opening"
      - common Arabic-prefix variants: Al-, An-, As-, At-, Az-, Ar-, Ash-
    """
    mapping: dict[str, int] = {}

    def add(key: str, num: int) -> None:
        k = key.strip().lower()
        if k:
            mapping[k] = num

    for s in surahs:
        n = s["number"]
        add(s["slug"], n)
        add(s["name_en"], n)

        # name_transliteration: "Al-Fatiha", "Ali 'Imran", "An-Nisa" …
        tlit = s.get("name_transliteration", "")
        add(tlit, n)

        # Also add without the Arabic article prefix for flexible matching
        # e.g. "Fatiha", "Baqarah", "Imran", "Nisa"
        bare = re.sub(r"^(Al|An|As|At|Az|Ar|Ash|Ali)[- ]+'?", "", tlit, flags=re.I).strip()
        add(bare, n)

        # Slug without article: "fatiha", "baqarah"
        slug_bare = re.sub(r"^(al|an|as|at|az|ar|ash)-", "", s["slug"])
        add(slug_bare, n)

    # Manual extras for common English names and alternate spellings not in surahs.json
    extras: dict[str, int] = {
        # Surah 1
        "al fatiha": 1, "fatiha": 1,
        # Surah 2
        "al baqarah": 2, "baqarah": 2,
        # Surah 3
        "al imran": 3, "ali imran": 3, "imran": 3, "aal imran": 3, "aal-imran": 3,
        # Surah 4
        "an nisa": 4, "nisa": 4,
        # Surah 5
        "al maidah": 5, "maidah": 5, "ma'idah": 5, "al ma'idah": 5,
        # Surah 9
        "at tawbah": 9, "tawbah": 9, "taubah": 9, "al tawbah": 9,
        # Surah 12
        "yusuf": 12,
        # Surah 14
        "ibrahim": 14,
        # Surah 17
        "al isra": 17, "isra": 17, "al-isra": 17, "bani isra'il": 17,
        # Surah 18
        "al kahf": 18, "kahf": 18,
        # Surah 19
        "maryam": 19,
        # Surah 20
        "ta ha": 20, "taha": 20,
        # Surah 21
        "al anbiya": 21, "anbiya": 21,
        # Surah 22
        "al hajj": 22, "hajj": 22,
        # Surah 24
        "an nur": 24, "nur": 24,
        # Surah 25
        "al furqan": 25, "furqan": 25,
        # Surah 28
        "al qasas": 28, "qasas": 28,
        # Surah 29
        "al ankabut": 29, "ankabut": 29,
        # Surah 30
        "ar rum": 30, "rum": 30,
        # Surah 31
        "luqman": 31,
        # Surah 33
        "al ahzab": 33, "ahzab": 33,
        # Surah 36
        "ya sin": 36, "yasin": 36,
        # Surah 37
        "as saffat": 37, "saffat": 37,
        # Surah 38
        "sad": 38,
        # Surah 39
        "az zumar": 39, "zumar": 39,
        # Surah 40
        "ghafir": 40,
        # Surah 42
        "ash shura": 42, "shura": 42,
        # Surah 43
        "az zukhruf": 43, "zukhruf": 43,
        # Surah 47
        "muhammad": 47,
        # Surah 48
        "al fath": 48, "fath": 48,
        # Surah 49
        "al hujurat": 49, "hujurat": 49,
        # Surah 50
        "qaf": 50,
        # Surah 51
        "adh dhariyat": 51, "dhariyat": 51,
        # Surah 55
        "ar rahman": 55, "rahman": 55,
        # Surah 56
        "al waqi'ah": 56, "waqiah": 56, "al waqia": 56,
        # Surah 57
        "al hadid": 57, "hadid": 57,
        # Surah 59
        "al hashr": 59, "hashr": 59,
        # Surah 60
        "al mumtahana": 60, "mumtahana": 60,
        # Surah 62
        "al jumu'ah": 62, "jumu'ah": 62, "juma": 62,
        # Surah 63
        "al munafiqun": 63, "munafiqun": 63,
        # Surah 64
        "at taghabun": 64, "taghabun": 64,
        # Surah 65
        "at talaq": 65, "talaq": 65,
        # Surah 66
        "at tahrim": 66, "tahrim": 66,
        # Surah 67
        "al mulk": 67, "mulk": 67,
        # Surah 73
        "al muzzammil": 73, "muzzammil": 73,
        # Surah 76
        "al insan": 76, "insan": 76,
        # Surah 78
        "an naba": 78, "naba": 78,
        # Surah 84
        "al inshiqaq": 84,
        # Surah 85
        "al buruj": 85, "buruj": 85,
        # Surah 87
        "al a'la": 87, "al ala": 87,
        # Surah 88
        "al ghashiyah": 88, "ghashiyah": 88,
        # Surah 93
        "ad duha": 93, "duha": 93,
        # Surah 94
        "ash sharh": 94, "inshirah": 94,
        # Surah 96
        "al alaq": 96, "alaq": 96, "iqra": 96,
        # Surah 97
        "al qadr": 97, "qadr": 97,
        # Surah 108
        "al kawthar": 108, "kawthar": 108,
        # Surah 109
        "al kafirun": 109, "kafirun": 109,
        # Surah 110
        "an nasr": 110, "nasr": 110,
        # Surah 111
        "al masad": 111, "lahab": 111,
        # Surah 112
        "al ikhlas": 112, "ikhlas": 112,
        # Surah 113
        "al falaq": 113, "falaq": 113,
        # Surah 114
        "an nas": 114, "nas": 114,
    }
    for k, v in extras.items():
        mapping.setdefault(k, v)

    return mapping


# ---------------------------------------------------------------------------
# Hadith collection name → canonical slug mapping
# ---------------------------------------------------------------------------

# Maps any mention (regex fragment) to a canonical slug id.
# Order matters: more specific patterns first.
HADITH_COLLECTION_PATTERNS: list[tuple[str, str]] = [
    # Sahih collections
    (r"sahih[\s\-]*(?:al[\s\-])?bukhari|al[\s\-]?bukhari|bukhari", "bukhari"),
    (r"sahih[\s\-]*muslim|muslim", "muslim"),
    # Sunan
    (r"sunan[\s\-]*(?:al[\s\-])?(?:abu[\s\-]?dawud|abi[\s\-]?dawud)|abu[\s\-]?dawud", "abu-dawud"),
    (r"sunan[\s\-]*(?:al[\s\-])?tirmidhi|jami[\s\']*[\s\-]*(?:al[\s\-])?tirmidhi|tirmidhi", "tirmidhi"),
    (r"sunan[\s\-]*(?:al[\s\-])?nasa['\u02bc]?i|sunan[\s\-]*nasai|nasai|nasa['\u02bc]i", "nasai"),
    (r"sunan[\s\-]*ibn[\s\-]?majah|ibn[\s\-]?majah", "ibn-majah"),
    # Muwatta
    (r"muwatta[\s\-]*(?:imam[\s\-])?malik|al[\s\-]?muwatta|muwatta", "muwatta"),
    # Musnad Ahmad
    (r"musnad[\s\-]*(?:imam[\s\-])?ahmad|musnad[\s\-]*ahmad(?:\s+ibn\s+hanbal)?", "musnad-ahmad"),
    # Riyadh al-Salihin / Bulugh al-Maram
    (r"riyadh[\s\-]*(?:al[\s\-])?salihin|riyad[\s\-]*(?:us[\s\-]|al[\s\-])?salihin", "riyadh-salihin"),
    (r"bulugh[\s\-]*(?:al[\s\-])?maram", "bulugh-maram"),
    # Darimi
    (r"sunan[\s\-]*(?:al[\s\-])?darimi|al[\s\-]?darimi|darimi", "darimi"),
    # Shamail
    (r"shamail[\s\-]*(?:al[\s\-])?muhammadiyya|shamail|shama['i]l", "shamail"),
]

# Pre-compile patterns as a list of (compiled_re, slug)
_COMPILED_HADITH_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(pat, re.IGNORECASE), slug)
    for pat, slug in HADITH_COLLECTION_PATTERNS
]


# ---------------------------------------------------------------------------
# Quran reference extraction (F1.1)
# ---------------------------------------------------------------------------

def build_surah_name_regex(surah_map: dict[str, int]) -> re.Pattern:
    """
    Build a single regex that matches any known surah name from the map.
    Sorted by length descending so longer names match first.
    """
    names = sorted(surah_map.keys(), key=len, reverse=True)
    # Escape each name for regex use
    escaped = [re.escape(name) for name in names]
    return re.compile(r"\b(" + "|".join(escaped) + r")\b", re.IGNORECASE)


def extract_quran_refs(text: str, surah_map: dict[str, int], surah_name_re: re.Pattern) -> list[str]:
    """
    Extract Quran verse references from plain text (HTML already stripped).

    Detected patterns:
      1. "Quran 2:255" / "Quran (2:255)" / "Qur'an 47:19"
      2. "Al-Baqarah 2:255" — surah name immediately before N:M
      3. "(2:255)" / "[2:255]" — bare verse ref in parens/brackets
      4. "2:255" with context words: verse, ayah, ayat, aya
      5. "Surah/Surat Al-Baqarah, verse 255" — surah name + verse number
      6. "Al-Baqarah (verse 255)" — surah name + explicit verse
      7. Ranges: "2:255-256", "88:17-18" → expand to individual refs (or keep range as-is)

    Returns deduplicated, sorted list of "surah_number:ayah_number" strings.
    """
    found: set[str] = set()

    # ---- Pattern 1: "Quran N:M" or "Qur'an N:M" (explicit label) ----
    for m in re.finditer(
        r"\bQur['\u02bc]?an\s*\(?\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-\u2013]\s*(\d{1,3}))?\s*\)?",
        text, re.IGNORECASE
    ):
        s, a = int(m.group(1)), int(m.group(2))
        if 1 <= s <= 114 and 1 <= a:
            found.add(f"{s}:{a}")
            # If a range like 2:255-256, add all ayahs
            if m.group(3):
                end_a = int(m.group(3))
                for ay in range(a + 1, end_a + 1):
                    found.add(f"{s}:{ay}")

    # ---- Pattern 2: Surah name immediately before N:M ----
    # e.g. "Al-Baqarah 2:255", "An-Nisa 4:3"
    for m in re.finditer(
        r"\b((?:Al|An|As|At|Az|Ar|Ash|Ali)[- ][A-Za-z'\u2019 -]{2,30}?)\s+(\d{1,3})\s*:\s*(\d{1,3})",
        text, re.IGNORECASE
    ):
        name = m.group(1).strip().lower()
        s_from_name = surah_map.get(name)
        s_from_num  = int(m.group(2))
        ayah        = int(m.group(3))
        # Use whichever surah number is valid; prefer explicit number if consistent
        surah_num   = s_from_num if 1 <= s_from_num <= 114 else s_from_name
        if surah_num and 1 <= ayah:
            found.add(f"{surah_num}:{ayah}")

    # ---- Pattern 3: Bare "N:M" in parens or brackets — high confidence ----
    # (2:255) [3:102] — very strong signal
    for m in re.finditer(r"[(\[]\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-\u2013]\s*(\d{1,3}))?\s*[)\]]", text):
        s, a = int(m.group(1)), int(m.group(2))
        if 1 <= s <= 114 and 1 <= a:
            found.add(f"{s}:{a}")
            if m.group(3):
                end_a = int(m.group(3))
                for ay in range(a + 1, end_a + 1):
                    found.add(f"{s}:{ay}")

    # ---- Pattern 4: "N:M" near context words (verse, ayah, ayat) ----
    # Catches: "verse 2:255", "ayah 2:1", "see 3:110"
    context_words = r"(?:verse|ayah|ayat|aya|see|cf\.?|ibid\.?|chapter)"
    for m in re.finditer(
        rf"\b{context_words}\s*\(?\s*(\d{{1,3}})\s*:\s*(\d{{1,3}})\s*\)?",
        text, re.IGNORECASE
    ):
        s, a = int(m.group(1)), int(m.group(2))
        if 1 <= s <= 114 and 1 <= a:
            found.add(f"{s}:{a}")

    # ---- Pattern 5: "Surah/Surat [Name], verse N" ----
    # e.g. "Surah Al-Baqarah, verse 255"
    for m in re.finditer(
        r"\bsurat?\s+([\w'\- ]{2,35}?)\s*(?:,|:)?\s*(?:verse|ayah|ayat|aya)\s+(\d{1,3})",
        text, re.IGNORECASE
    ):
        name = m.group(1).strip().lower()
        ayah = int(m.group(2))
        surah_num = surah_map.get(name)
        if surah_num and 1 <= ayah:
            found.add(f"{surah_num}:{ayah}")

    # ---- Pattern 6: "Surah Name (verse N)" / "Name (ayah N)" ----
    for m in re.finditer(
        r"\b((?:Al|An|As|At|Az|Ar|Ash|Ali)[- ][A-Za-z'\u2019 -]{2,30}?)\s*\(?(?:verse|ayah|ayat|aya)\s+(\d{1,3})\)?",
        text, re.IGNORECASE
    ):
        name = m.group(1).strip().lower()
        ayah = int(m.group(2))
        surah_num = surah_map.get(name)
        if surah_num and 1 <= ayah:
            found.add(f"{surah_num}:{ayah}")

    # ---- Pattern 7: Plain "N:M" anywhere — validate surah range strictly ----
    # Only accept if surah 1–114; helps reduce false positives from time stamps etc.
    # We apply this last and only if there's no broader context clue that it's NOT a verse.
    for m in re.finditer(r"(?<![:/\d])(\d{1,3})\s*:\s*(\d{1,3})(?!\s*[AP]M)(?![:\d])", text):
        s, a = int(m.group(1)), int(m.group(2))
        # Strict: surah 1-114, ayah 1-286 (max is 2:286)
        if 1 <= s <= 114 and 1 <= a <= 286:
            # Skip patterns that look like timestamps, page refs, hadith numbers e.g. "1:30 PM"
            start = m.start()
            prefix = text[max(0, start - 8):start].lower()
            if re.search(r"\d\s*$", prefix):
                # preceded by another digit — likely part of a longer number, skip
                continue
            found.add(f"{s}:{a}")

    return sorted(found, key=lambda ref: tuple(int(x) for x in ref.split(":")))


# ---------------------------------------------------------------------------
# Scholar name extraction (F1.3)
# ---------------------------------------------------------------------------

def load_scholar_names(scholars_path: Path) -> list[tuple[str, str]]:
    """
    Load scholars.json and return list of (name, slug) sorted by name length
    descending so longer/more-specific names match before shorter fragments.
    Only includes scholars with name_en >= 8 chars to avoid false positives.
    """
    with open(scholars_path, encoding="utf-8") as f:
        scholars = json.load(f)

    entries: list[tuple[str, str]] = []
    seen_slugs: set[str] = set()

    # Exclude very common single-word names that generate false positives
    EXCLUDE_NAMES = {
        "ahmad", "ali", "umar", "uthman", "husayn", "hassan", "ibrahim",
        "musa", "isa", "dawud", "sulayman", "yahya", "zayd", "jabir",
        "muslim", "malik", "bukhari", "tirmidhi", "nasai",
    }

    for s in scholars:
        slug = s.get("slug", "")
        name_en = s.get("name_en", "")
        if not slug or not name_en:
            continue
        if len(name_en) < 8:
            continue
        name_lower = name_en.lower()
        if name_lower in EXCLUDE_NAMES:
            continue
        if slug not in seen_slugs:
            seen_slugs.add(slug)
            entries.append((name_en, slug))
        # Also check name_en_alt
        for alt in s.get("name_en_alt", []):
            if alt and len(alt) >= 8 and alt.lower() not in EXCLUDE_NAMES:
                entries.append((alt, slug))

    # Sort by length descending (longest first for specificity)
    entries.sort(key=lambda x: -len(x[0]))
    return entries


def extract_scholar_refs(text: str, scholar_entries: list[tuple[str, str]]) -> list[str]:
    """
    Extract scholar slugs whose names appear in article text.
    Returns deduplicated list of slugs in order of first appearance.
    """
    found: list[str] = []
    seen_slugs: set[str] = set()

    for name, slug in scholar_entries:
        if slug in seen_slugs:
            continue
        # Word-boundary aware match
        escaped = re.escape(name)
        if re.search(r"(?<!\w)" + escaped + r"(?!\w)", text, re.IGNORECASE):
            seen_slugs.add(slug)
            found.append(slug)

    return found


# ---------------------------------------------------------------------------
# Hadith reference extraction (F1.2)
# ---------------------------------------------------------------------------

def extract_hadith_refs(text: str) -> list[str]:
    """
    Extract hadith collection references from plain text.

    Detected patterns (with optional hadith number):
      1. "Sahih al-Bukhari, hadith 1234"  → "bukhari:1234"
      2. "Bukhari #1234"                  → "bukhari:1234"
      3. "Muslim 456"                     → "muslim:456"
      4. "(Bukhari)"                      → "bukhari"
      5. "[Muslim]"                       → "muslim"
      6. "Sunan Abu Dawud"                → "abu-dawud"
      7. "narrated in Tirmidhi"           → "tirmidhi"
      8. "Musnad Ahmad"                   → "musnad-ahmad"

    Returns deduplicated, sorted list of "slug" or "slug:number" strings.
    """
    found: dict[str, set[int]] = {}  # slug → set of hadith numbers (empty = mention without number)

    def add_ref(slug: str, number: int | None = None) -> None:
        if slug not in found:
            found[slug] = set()
        if number is not None:
            found[slug].add(number)

    for pattern_re, slug in _COMPILED_HADITH_PATTERNS:
        for m in pattern_re.finditer(text):
            # Look for an optional hadith number immediately after the match
            after = text[m.end():m.end() + 40]
            num_match = re.match(
                r"[\s,]*(?:hadith|#|no\.?|narration|report|number|num\.?)?\s*#?\s*(\d{1,6})\b",
                after, re.IGNORECASE
            )
            if num_match:
                add_ref(slug, int(num_match.group(1)))
            else:
                add_ref(slug, None)

    # Build result list
    result: list[str] = []
    for slug in sorted(found.keys()):
        numbers = found[slug]
        if numbers:
            for n in sorted(numbers):
                result.append(f"{slug}:{n}")
        else:
            result.append(slug)

    return result


# ---------------------------------------------------------------------------
# HTML → plain text
# ---------------------------------------------------------------------------

def strip_html(html: str) -> str:
    """Remove HTML tags and decode common entities."""
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&nbsp;", " ").replace("&#39;", "'").replace("&quot;", '"')
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Load surahs
    with open(SURAHS_PATH, encoding="utf-8") as f:
        surahs: list[dict] = json.load(f)
    surah_map = build_surah_map(surahs)
    surah_name_re = build_surah_name_regex(surah_map)
    print(f"Loaded {len(surahs)} surahs → {len(surah_map)} name mappings")

    # Load scholars
    scholar_entries = load_scholar_names(SCHOLARS_PATH)
    print(f"Loaded {len(scholar_entries)} scholar name entries")

    # Load articles
    with open(ARTICLES_PATH, encoding="utf-8") as f:
        articles: list[dict] = json.load(f)
    print(f"Loaded {len(articles)} articles from {ARTICLES_PATH}")

    # Stats
    total_quran_refs   = 0
    total_hadith_refs  = 0
    total_scholar_refs = 0
    articles_with_quran   = 0
    articles_with_hadith  = 0
    articles_with_scholar = 0

    for article in articles:
        content_en = article.get("content", "") or ""
        plain = strip_html(content_en)

        q_refs = extract_quran_refs(plain, surah_map, surah_name_re)
        h_refs = extract_hadith_refs(plain)
        s_refs = extract_scholar_refs(plain, scholar_entries)

        article["quran_refs"]   = q_refs
        article["hadith_refs"]  = h_refs
        article["scholar_refs"] = s_refs

        total_quran_refs   += len(q_refs)
        total_hadith_refs  += len(h_refs)
        total_scholar_refs += len(s_refs)
        if q_refs:
            articles_with_quran += 1
        if h_refs:
            articles_with_hadith += 1
        if s_refs:
            articles_with_scholar += 1

        if VERBOSE:
            if q_refs or h_refs or s_refs:
                print(f"\n[{article['slug']}]")
                if q_refs:
                    print(f"  quran_refs:   {q_refs}")
                if h_refs:
                    print(f"  hadith_refs:  {h_refs}")
                if s_refs:
                    print(f"  scholar_refs: {s_refs[:5]}{'...' if len(s_refs) > 5 else ''}")

    # Summary
    print(f"\n--- Results ---")
    print(f"Articles with quran_refs:   {articles_with_quran}/{len(articles)}")
    print(f"Articles with hadith_refs:  {articles_with_hadith}/{len(articles)}")
    print(f"Articles with scholar_refs: {articles_with_scholar}/{len(articles)}")
    print(f"Total quran refs found:     {total_quran_refs}")
    print(f"Total hadith refs found:    {total_hadith_refs}")
    print(f"Total scholar refs found:   {total_scholar_refs}")

    if DRY_RUN:
        print("\n[dry-run] No files written.")
        return

    # Write back
    with open(ARTICLES_PATH, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"\nWrote updated articles to {ARTICLES_PATH}")


if __name__ == "__main__":
    main()
