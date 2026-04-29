# API Reference

Islam.wiki exposes a public read-only API for Quran and Hadith data. Authentication is not required for public endpoints.

**Base URL:** `https://islam.wiki/api`

## Quran

### `GET /api/quran/surahs`

Returns metadata for all 114 surahs.

**Response (array):**

```json
[
  {
    "number": 1,
    "slug": "al-fatiha",
    "name_ar": "الفاتحة",
    "name_en": "Al-Fatiha",
    "name_transliteration": "Al-Fatihah",
    "revelation_type": "meccan",
    "verses_count": 7,
    "juz_start": 1
  }
]
```

### `GET /api/quran/[surah]`

Returns all ayahs for a surah with Arabic text and translations.

**Path parameter:** surah number (1-114) or slug (e.g., `al-fatiha`)

**Query parameters:**

| Parameter | Description | Default |
| --- | --- | --- |
| `translation` | Translation key | `en.saheeh` |
| `tafsir` | Tafsir key | (none) |

Available translation keys: `en.saheeh`, `en.pickthall`, `en.yusufali`, `en.hilali`, `ar.muyassar`, `id.indonesian`.

Available tafsir keys: `en.ibn-kathir`, `en.jalalayn`.

### `GET /api/quran/[surah]/[ayah]`

Returns a single ayah with full text, translations, and optional tafsir.

## Hadith

### `GET /api/hadith/collections`

Returns a list of all available Hadith collections.

### `GET /api/hadith/[collection]`

Returns book structure for a collection.

**Path parameter:** collection slug (e.g., `bukhari`, `muslim`, `abu-dawud`)

### `GET /api/hadith/[collection]/[book]/[number]`

Returns a single hadith entry.

**Response:**

```json
{
  "id": 1,
  "collection": "bukhari",
  "book": 1,
  "number": 1,
  "text_ar": "...",
  "text_en": "...",
  "narrator": "Umar ibn al-Khattab",
  "grade": "sahih",
  "grade_source": "al-Bukhari"
}
```

## Search

### `GET /api/search`

Full-text search across all content types. See [[Search]] for full documentation.

**Query parameters:**

| Parameter | Required | Description |
| --- | --- | --- |
| `q` | Yes | Search query |
| `type` | No | Filter: `hadith`, `ayah`, `people`, `books`, `articles` |
| `page` | No | Page number (default: 1) |

## Rate limits

Public API: 120 requests per minute per IP. For bulk data needs, see [[Content-Sources]] — the raw data files are available directly from the repository.

## See Also

- [[Search]] -- search index structure and filter options
- [[Content-Sources]] -- raw data availability
