# H-07 — Islam.wiki Citation Deep-Link URL Schema

**Contract ID:** H-07
**Provider:** Islam.wiki (`ummeco/islamwiki`)
**Consumer:** ChatIslam (`ummeco/chatislam`, P4-S20)
**Status:** STABLE (do not change URL shapes without coordinating with ChatIslam)
**Date:** 2026-05-03

---

## Summary

Defines canonical URL patterns for all linkable Islam.wiki resources.
ChatIslam uses these URLs to build inline citation badges in AI responses.

---

## TypeScript Types

```typescript
// lib/citations/deep-link-schema.ts
export type CitationTarget =
  | QuranAyahTarget
  | HadithTarget
  | BookChapterTarget
  | PersonTarget
  | ArticleTarget

export function buildCitationUrl(target: CitationTarget, opts?: { absolute?: boolean }): string
export function buildAbsoluteCitationUrl(target: CitationTarget): string
export function getCitationLabel(target: CitationTarget): string
```

---

## URL Patterns (STABLE)

| Resource | Type | URL Pattern | Example |
|---|---|---|---|
| Quran ayah | `quran_ayah` | `/quran/{surah-slug}#ayah-{number}` | `/quran/al-baqarah#ayah-255` |
| Hadith | `hadith` | `/hadith/{collection}/{book}/{number}` | `/hadith/bukhari/revelation/1` |
| Book chapter | `book_chapter` | `/books/{book-slug}/{chapter-number}` | `/books/minhaj-at-talibin/12` |
| Person / scholar | `person` | `/people/{slug}` | `/people/ibn-taymiyyah` |
| Article | `article` | `/{article-slug}` | `/five-pillars-of-islam` |

---

## Target Interfaces

### QuranAyahTarget

```typescript
{
  type: 'quran_ayah'
  surahSlug: string    // e.g. 'al-fatiha', 'al-baqarah'
  ayahNumber: number   // 1-indexed within surah
}
```

### HadithTarget

```typescript
{
  type: 'hadith'
  collection: string   // e.g. 'bukhari', 'muslim', 'abu-dawud'
  book: string         // book slug within collection
  number: number       // hadith number within book
}
```

### BookChapterTarget

```typescript
{
  type: 'book_chapter'
  bookSlug: string      // e.g. 'minhaj-at-talibin'
  chapterNumber: number // 1-indexed
}
```

### PersonTarget

```typescript
{
  type: 'person'
  slug: string   // e.g. 'ibn-taymiyyah', 'imam-nawawi'
}
```

### ArticleTarget

```typescript
{
  type: 'article'
  slug: string   // e.g. 'five-pillars-of-islam'
}
```

---

## Usage Example (ChatIslam)

```typescript
import { buildAbsoluteCitationUrl, getCitationLabel } from '@islamwiki/citations'
// or copy types directly (no shared package yet)

const citation: CitationTarget = {
  type: 'hadith',
  collection: 'bukhari',
  book: 'faith',
  number: 8,
}

const url = buildAbsoluteCitationUrl(citation)
// → 'https://islam.wiki/hadith/bukhari/faith/8'

const label = getCitationLabel(citation)
// → 'Bukhari — faith (8)'
```

---

## Stability Guarantee

URL patterns are **frozen** for the P4 cycle. Any change requires:
1. Updating this contract doc
2. Coordinating with ChatIslam (ummeco/chatislam) before merging
3. Version bump in contract header

---

## See Also

- Implementation: `web/lib/citations/deep-link-schema.ts`
- Consumer: `ummeco/chatislam` — P4-S20 ChatIslam public beta
