#!/usr/bin/env python3
"""
Translate Sahih al-Bukhari iwh_id field to proper Bahasa Indonesia.
Processes files 001.json through 033.json.

Uses Google Translate via deep_translator, then post-processes to:
- Restore ﷺ symbol (Google often converts to SAW or ص)
- Normalize Islamic terminology
- Fix narrator suffix forms (radhiyallahu)
"""

import json
import os
import re
import time
import sys

DATA_DIR = "/Users/admin/Sites/ummeco/islamwiki/web/data/hadith/bukhari"

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("ERROR: deep_translator not installed. Run: pip install deep-translator")
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# Pre-translation: protect tokens that Google Translate mangles
# ─────────────────────────────────────────────────────────────────────────────

# Placeholders for the ﷺ symbol (Google converts to ص. or SAW or removes it)
PBUH_PLACEHOLDER = "PBUH_SYMBOL"

# Narrator suffix forms to protect/normalize
RADHIYALLAHU_MAP = {
    r"\(may Allah be pleased with him and his father\)": "[RADHI_ANHU_WABIH]",
    r"\(may Allah be pleased with them both\)": "[RADHI_ANHUMA]",
    r"\(may Allah be pleased with her and her father\)": "[RADHI_ANHA_WABIH]",
    r"\(may Allah be pleased with him\)": "[RADHI_ANHU]",
    r"\(may Allah be pleased with her\)": "[RADHI_ANHA]",
    r"\(may Allah be pleased with them\)": "[RADHI_ANHUM]",
    r"\(Allah be pleased with him\)": "[RADHI_ANHU]",
    r"\(Allah be pleased with her\)": "[RADHI_ANHA]",
    r"\(Allah be pleased with them both\)": "[RADHI_ANHUMA]",
    r"may Allah be pleased with him and his father": "[RADHI_ANHU_WABIH]",
    r"may Allah be pleased with them both": "[RADHI_ANHUMA]",
    r"may Allah be pleased with him": "[RADHI_ANHU]",
    r"may Allah be pleased with her": "[RADHI_ANHA]",
    r"may Allah be pleased with them": "[RADHI_ANHUM]",
}

RADHIYALLAHU_RESTORE = {
    "[RADHI_ANHU_WABIH]": "(radhiyallahu 'anhu wa abih)",
    "[RADHI_ANHUMA]": "(radhiyallahu 'anhuma)",
    "[RADHI_ANHA_WABIH]": "(radhiyallahu 'anha wa abih)",
    "[RADHI_ANHU]": "(radhiyallahu 'anhu)",
    "[RADHI_ANHA]": "(radhiyallahu 'anha)",
    "[RADHI_ANHUM]": "(radhiyallahu 'anhum)",
}

# Prophet references to protect (Google may over-translate these)
PROPHET_PROTECTED = [
    # Protect "the Prophet ﷺ" → placeholder
    (r"the Prophet\s*[ﷺ(ﷺ)]*", "Nabi PBUH_SYMBOL"),
    (r"The Prophet\s*[ﷺ(ﷺ)]*", "Nabi PBUH_SYMBOL"),
    (r"Allah['']s Messenger\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"Allah['']s Apostle\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"Allah['']s Messenger\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"the Messenger of Allah\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"The Messenger of Allah\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"Messenger of Allah\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    (r"the Apostle of Allah\s*[ﷺ(ﷺ)]*", "Rasulullah PBUH_SYMBOL"),
    # Also handle ﷺ that appears alone after names
    (r"ﷺ", "PBUH_SYMBOL"),
    (r"\(ﷺ\)", "PBUH_SYMBOL"),
]


def pre_process(text: str) -> str:
    """
    Pre-process text before Google Translate:
    1. Replace ﷺ with placeholder
    2. Replace narrator suffix phrases with placeholders
    3. Replace Islamic proper nouns to ensure they survive translation
    """
    # Replace narrator suffix phrases with placeholders
    for pattern, placeholder in RADHIYALLAHU_MAP.items():
        text = re.sub(pattern, placeholder, text)

    # Replace ﷺ symbol and Prophet references
    for pattern, replacement in PROPHET_PROTECTED:
        text = re.sub(pattern, replacement, text)

    return text


def post_process(text: str) -> str:
    """
    Post-process text after Google Translate:
    1. Restore ﷺ symbol
    2. Restore radhiyallahu forms
    3. Normalize Islamic terms that Google may have altered
    """
    # Restore ﷺ symbol
    text = text.replace("PBUH_SYMBOL", "ﷺ")
    text = text.replace("Pbuh_Symbol", "ﷺ")
    text = text.replace("pbuh_symbol", "ﷺ")
    text = text.replace("Pbuh Symbol", "ﷺ")
    text = text.replace("pbuh symbol", "ﷺ")

    # Restore radhiyallahu forms
    for placeholder, replacement in RADHIYALLAHU_RESTORE.items():
        text = text.replace(placeholder, replacement)
        # Also handle case variations from Google
        text = text.replace(placeholder.lower(), replacement)
        text = text.replace(placeholder.upper(), replacement)
        text = text.replace(placeholder.replace('[', '[').replace(']', ']'), replacement)

    # Fix Nabi ﷺ references that Google might have modified
    # Google often changes "Nabi" to "Nabi" or "Nabi saw" etc — normalize
    text = re.sub(r'Nabi\s+saw\b', 'Nabi ﷺ', text, flags=re.IGNORECASE)
    text = re.sub(r'Nabi\s+saw\.', 'Nabi ﷺ', text, flags=re.IGNORECASE)
    text = re.sub(r'Rasulullah\s+saw\b', 'Rasulullah ﷺ', text, flags=re.IGNORECASE)
    text = re.sub(r'Rasulullah\s+saw\.', 'Rasulullah ﷺ', text, flags=re.IGNORECASE)

    # Fix brackets that got corrupted: [ RADHI... ] → restore
    for placeholder, replacement in RADHIYALLAHU_RESTORE.items():
        # Handle spaces added inside brackets by Google
        corrupted = placeholder.replace('[', '[ ').replace(']', ' ]')
        text = text.replace(corrupted, replacement)

    # Normalize some common Islamic terms Google tends to mistranslate
    replacements = [
        ("shalat", "salat"),
        ("Shalat", "Salat"),
        ("wudu", "wudhu"),
        ("wudu'", "wudhu"),
        ("wudhu'", "wudhu"),
        ("Al Quran", "Al-Qur'an"),
        ("Al-Quran", "Al-Qur'an"),
        ("Alquran", "Al-Qur'an"),
        ("surga", "surga"),
        ("neraka", "neraka"),
        (" SAW ", " ﷺ "),
        (" SAW,", " ﷺ,"),
        (" SAW.", " ﷺ."),
        (" SAW:", " ﷺ:"),
        ("(SAW)", "ﷺ"),
        ("(saw)", "ﷺ"),
        (" saw ", " ﷺ "),
        (" saw,", " ﷺ,"),
        (" saw.", " ﷺ."),
        (" saw:", " ﷺ:"),
        ("ص.", "ﷺ"),
        ("صلى الله عليه وسلم", "ﷺ"),
        ("Allah SWT", "Allah"),
        ("Allah swt", "Allah"),
        ("(SWT)", ""),
        ("SWT", ""),
    ]
    for old, new in replacements:
        text = text.replace(old, new)

    # Clean up extra spaces
    text = re.sub(r'  +', ' ', text)
    text = text.strip()

    return text


def translate_text(text: str, translator: GoogleTranslator, retries: int = 3) -> str:
    """Translate a single text with retry logic."""
    if not text or not text.strip():
        return text

    processed = pre_process(text)

    for attempt in range(retries):
        try:
            translated = translator.translate(processed)
            if translated:
                return post_process(translated)
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # exponential backoff
            else:
                print(f"\n  Translation failed after {retries} attempts: {e}", file=sys.stderr)
                return text  # Return original on failure

    return text


def process_file(filepath: str, translator: GoogleTranslator, delay: float = 0.3) -> int:
    """Process a single JSON file."""
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    modified = 0
    total = len(data)

    for idx, hadith in enumerate(data):
        iwh_en = hadith.get("iwh_en", "")
        if not iwh_en:
            continue

        # Show progress
        if (idx + 1) % 20 == 0:
            print(f"    {idx+1}/{total}...", end="", flush=True)

        translated = translate_text(iwh_en, translator)
        if translated and translated != hadith.get("iwh_id", ""):
            hadith["iwh_id"] = translated
            modified += 1

        # Rate limiting — Google Translate has limits
        if delay > 0:
            time.sleep(delay)

    # Write updated data
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return modified


def main():
    translator = GoogleTranslator(source="en", target="id")

    # Quick test
    test = translate_text(
        "Abu Huraira (may Allah be pleased with him) reported that the Prophet ﷺ said: "
        "The best of you are those who learn the Quran and teach it.",
        translator
    )
    print(f"Test: {test[:100]}")
    print()

    files = [f"{i:03d}.json" for i in range(1, 34)]
    total_modified = 0

    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"SKIP {filename}")
            continue

        with open(filepath) as f:
            data = json.load(f)
        total_hadiths = len(data)

        print(f"Processing {filename} ({total_hadiths} hadiths)...", end=" ", flush=True)
        count = process_file(filepath, translator, delay=0.4)
        total_modified += count
        print(f"[{count} translated]")

        # Pause between files
        time.sleep(1.0)

    print(f"\nDone. Total hadiths translated: {total_modified}")


if __name__ == "__main__":
    main()
