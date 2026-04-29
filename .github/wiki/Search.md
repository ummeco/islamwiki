# Search

Islam.wiki uses [Meilisearch](https://www.meilisearch.com) for full-text search across all content types. This page covers the index structure, field configuration, and how to query the search API.

## Indexes

| Index | Content | Primary key |
| --- | --- | --- |
| `hadith` | All 70,000+ hadith entries | `id` |
| `quran_ayahs` | All 6,236 ayahs with translations | `id` |
| `people` | Scholar and biography entries | `slug` |
| `books` | Book and chapter content | `id` |
| `articles` | Encyclopedic articles and wiki pages | `slug` |

## Searchable attributes (by index)

### hadith index

- `text_en` (weighted highest)
- `text_ar`
- `narrator`
- `collection` (filterable)
- `grade` (filterable)
- `book_name`

### quran_ayahs index

- `text_en` (all translations, weighted highest)
- `text_ar`
- `surah_name_en`
- `surah_number` (filterable)
- `juz` (filterable)

### people index

- `name_en` (weighted highest)
- `name_ar`
- `bio_summary`
- `generation` (filterable: `sahabi`, `tabi`, `tabi_tabi`)
- `era`

## Filter allowlist

Meilisearch filter expressions are validated against an explicit allowlist in the application layer. Only the following attributes can be used as filter parameters:

```
collection, grade, surah_number, juz, generation, language, category
```

Attempts to filter on unlisted attributes are rejected before reaching Meilisearch. This blocks geo-coordinate attack vectors and protects internal metadata fields.

## Ranking rules

Default Meilisearch ranking rules apply, with `exactness` elevated for name searches. Typo tolerance is enabled with a minimum word length of 4 characters.

## Query endpoint

Search is handled server-side via a Next.js API route. Clients do not connect to Meilisearch directly.

```
GET /api/search?q=<query>&type=<hadith|ayah|people|books|articles>&page=<n>
```

Response format:

```json
{
  "hits": [...],
  "totalHits": 142,
  "page": 1,
  "hitsPerPage": 20,
  "type": "hadith"
}
```

## Local development

Meilisearch runs as a Docker container via the `search` nSelf plugin. Start it with the Ummat backend:

```bash
cd ~/Sites/ummeco/ummat/backend && nself start
```

The search API will be available at `http://localhost:7700`. The master key is set in `.env.local`.

Re-index after data updates:

```bash
cd islamwiki/web && pnpm run index
```

## See Also

- [[Content-Sources]] -- what is indexed
- [[API-Reference]] -- full API endpoint reference
- [[Architecture]] -- system architecture
