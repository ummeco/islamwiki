#!/usr/bin/env python3
"""
Translate Jami at-Tirmidhi iwh_id field to proper Bahasa Indonesia.
Processes files 001.json through 049.json (49 files, ~3,998 hadiths).

Uses Anthropic API (claude-haiku-4-5) for high-quality translation.
Sends hadiths in batches to minimize API calls.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

DATA_DIR = "/Users/admin/Sites/ummeco/islamwiki/web/data/hadith/tirmidhi"


def get_api_key():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if key:
        return key
    vault_path = os.path.expanduser("~/.claude/vault.env")
    if os.path.exists(vault_path):
        with open(vault_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""


SYSTEM_PROMPT = """You are a professional Islamic scholar and Bahasa Indonesia translator specializing in hadith literature.

Your task: Translate hadith texts from English to fluent, formal Bahasa Indonesia.

Translation rules:
- Use formal, scholarly Bahasa Indonesia
- Keep proper names unchanged: Aisha, Abu Hurairah, Ibn Umar, Ibn Abbas, Anas, Jabir, etc.
- Keep: Allah, Rasulullah, Nabi, ﷺ symbol
- "may Allah be pleased with him" → "radhiyallahu 'anhu"
- "may Allah be pleased with her" → "radhiyallahu 'anha"
- "may Allah be pleased with them both" → "radhiyallahu 'anhuma"
- "peace be upon him" → keep ﷺ symbol (do not translate)
- "Narrated by X" → "Diriwayatkan oleh X"
- "X narrated that" → "X meriwayatkan bahwa"
- "X reported" → "X meriwayatkan"
- Keep Islamic terms in Arabic when standard: Junub, Izar, I'tikaf, Tawaf, Hajj, Umrah, Salat, Wudhu, Ghusl, Tayammum, Zakat, Sadaqah, etc.
- Translate the complete text — no English words remaining
- Maintain the meaning and accuracy of the hadith

Output ONLY the translated text, nothing else."""


def translate_batch(hadiths_en: list, api_key: str) -> list:
    """Translate a batch of hadith texts using Claude API."""
    numbered = "\n\n".join(
        f"[{i+1}] {text}" for i, text in enumerate(hadiths_en)
    )

    prompt = f"""Translate each of the following hadith texts to Bahasa Indonesia.
Output ONLY the translations numbered [1], [2], etc. in the same order. No other text.

{numbered}"""

    payload = json.dumps({
        "model": "claude-haiku-4-5",
        "max_tokens": 4096,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            text = result["content"][0]["text"].strip()
            return parse_numbered_translations(text, len(hadiths_en))
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  API error {e.code}: {body[:200]}", file=sys.stderr)
        raise


def parse_numbered_translations(text: str, expected: int) -> list:
    """Parse numbered translation output like [1] text [2] text..."""
    import re
    parts = re.split(r'\[(\d+)\]', text)
    results = {}
    i = 1
    while i < len(parts):
        try:
            num = int(parts[i])
            content = parts[i+1].strip() if i+1 < len(parts) else ""
            results[num] = content
            i += 2
        except (ValueError, IndexError):
            i += 1

    out = []
    for idx in range(1, expected + 1):
        out.append(results.get(idx, ""))
    return out


def process_file(filepath: str, api_key: str, batch_size: int = 10):
    """Process a single JSON file, translating all iwh_id fields."""
    with open(filepath) as f:
        data = json.load(f)

    total = len(data)
    print(f"  {total} hadiths", end="", flush=True)

    texts = [h.get("iwh_en", "") for h in data]

    all_translations = []
    for start in range(0, total, batch_size):
        batch = texts[start:start + batch_size]

        for attempt in range(3):
            try:
                translations = translate_batch(batch, api_key)
                all_translations.extend(translations)
                print(".", end="", flush=True)
                break
            except Exception as e:
                if attempt < 2:
                    print(f"r", end="", flush=True)
                    time.sleep(3 * (attempt + 1))
                else:
                    print(f"E", end="", flush=True)
                    all_translations.extend([""] * len(batch))

    modified = 0
    for i, hadith in enumerate(data):
        translation = all_translations[i] if i < len(all_translations) else ""
        if translation:
            hadith["iwh_id"] = translation
            modified += 1

    print(f" [{modified} translated]")

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return modified


def main():
    api_key = get_api_key()
    if not api_key:
        print("ERROR: No ANTHROPIC_API_KEY found in environment or vault", file=sys.stderr)
        sys.exit(1)

    print(f"API key: {api_key[:20]}...")
    print(f"Processing Jami at-Tirmidhi — 49 files\n")

    files = [f"{i:03d}.json" for i in range(1, 50)]
    total_translated = 0

    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"SKIP {filename} (not found)")
            continue

        print(f"Processing {filename}...", end=" ", flush=True)
        try:
            count = process_file(filepath, api_key)
            total_translated += count
        except Exception as e:
            print(f"\n  ERROR: {e}", file=sys.stderr)

        time.sleep(0.5)

    print(f"\nDone. Tirmidhi hadiths translated: {total_translated}")


if __name__ == "__main__":
    main()
