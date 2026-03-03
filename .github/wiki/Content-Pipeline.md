# Content Pipeline

## Overview

Islam.wiki sources all content from authoritative Islamic text databases and APIs. Data is normalized into structured JSON, reviewed for accuracy, and committed to the repository.

## Data Sources

All texts are used with proper licensing or under public domain. Content licensing for all Islamic texts has been fully settled.

## Data Structure

### Quran
- `data/quran/surahs.json` -- surah metadata (name, revelation type, ayah count)
- `data/quran/ayahs/` -- per-surah ayah files with Arabic text
- `data/quran/tafsir/` -- tafsir entries keyed by surah:ayah
- `data/quran/translators.json` -- available translations metadata

### Hadith
- `data/hadith/collections.json` -- collection metadata
- `data/hadith/{collection}/` -- per-collection directories
  - `meta.json` -- books and chapter structure
  - `{book-number}.json` -- individual hadith with Arabic, English, grading

## Adding New Content

1. Create or modify scripts in `scripts/`
2. Run the data pipeline to generate JSON
3. Validate output against the expected schema
4. Commit the updated data files
