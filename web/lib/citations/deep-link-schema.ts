/**
 * H-07: Islam.wiki citation deep-link URL schema.
 *
 * Cross-repo contract consumed by ChatIslam (P4-S20).
 * Defines canonical URL patterns for all linkable Islam.wiki resources.
 * STABLE: Do not change URL shapes without updating ChatIslam.
 *
 * Contract document: /.github/docs/contracts/h-07-citation-deep-link.md
 */

// ── Target type discriminated union ──────────────────────────────────────

export type CitationTargetType =
  | 'quran_ayah'
  | 'hadith'
  | 'book_chapter'
  | 'person'
  | 'article'

/** Quran ayah citation: links to /quran/{surah-slug}#ayah-{number} */
export interface QuranAyahTarget {
  type: 'quran_ayah'
  /** Surah slug, e.g. 'al-fatiha', 'al-baqarah' */
  surahSlug: string
  /** 1-indexed ayah number within the surah */
  ayahNumber: number
}

/** Hadith citation: links to /hadith/{collection}/{book}/{number} */
export interface HadithTarget {
  type: 'hadith'
  /** Collection slug, e.g. 'bukhari', 'muslim', 'abu-dawud' */
  collection: string
  /** Book slug within the collection, e.g. 'revelation', 'faith' */
  book: string
  /** Hadith number within the book */
  number: number
}

/** Classical book chapter citation: links to /books/{book-slug}/{chapter-number} */
export interface BookChapterTarget {
  type: 'book_chapter'
  /** Book slug, e.g. 'minhaj-at-talibin', 'reliance-of-the-traveller' */
  bookSlug: string
  /** 1-indexed chapter number */
  chapterNumber: number
}

/** Scholar/person citation: links to /people/{slug} */
export interface PersonTarget {
  type: 'person'
  /** Person slug, e.g. 'ibn-taymiyyah', 'imam-nawawi' */
  slug: string
}

/** Article citation: links to /{article-slug} */
export interface ArticleTarget {
  type: 'article'
  /** Article slug, e.g. 'five-pillars-of-islam' */
  slug: string
}

/** Discriminated union of all citation target types */
export type CitationTarget =
  | QuranAyahTarget
  | HadithTarget
  | BookChapterTarget
  | PersonTarget
  | ArticleTarget

// ── URL builder ──────────────────────────────────────────────────────────

const BASE_URL = 'https://islam.wiki'

/**
 * Build a canonical Islam.wiki URL for a given citation target.
 *
 * URL patterns (stable, consumed by ChatIslam P4-S20):
 *   - quran_ayah:    /quran/{surah-slug}#ayah-{number}
 *   - hadith:        /hadith/{collection}/{book}/{number}
 *   - book_chapter:  /books/{book-slug}/{chapter-number}
 *   - person:        /people/{slug}
 *   - article:       /{slug}
 */
export function buildCitationUrl(
  target: CitationTarget,
  opts: { absolute?: boolean } = {}
): string {
  const { absolute = false } = opts
  const prefix = absolute ? BASE_URL : ''

  switch (target.type) {
    case 'quran_ayah':
      return `${prefix}/quran/${encodeURIComponent(target.surahSlug)}#ayah-${target.ayahNumber}`

    case 'hadith':
      return `${prefix}/hadith/${encodeURIComponent(target.collection)}/${encodeURIComponent(target.book)}/${target.number}`

    case 'book_chapter':
      return `${prefix}/books/${encodeURIComponent(target.bookSlug)}/${target.chapterNumber}`

    case 'person':
      return `${prefix}/people/${encodeURIComponent(target.slug)}`

    case 'article':
      return `${prefix}/${encodeURIComponent(target.slug)}`
  }
}

/**
 * Build an absolute citation URL (includes https://islam.wiki base).
 * Convenience wrapper for ChatIslam citation rendering.
 */
export function buildAbsoluteCitationUrl(target: CitationTarget): string {
  return buildCitationUrl(target, { absolute: true })
}

// ── Display helpers ───────────────────────────────────────────────────────

/**
 * Returns a short human-readable reference string for a citation target.
 * Used by ChatIslam to render inline citation badges.
 *
 * Examples:
 *   - quran_ayah:    "Quran 2:255"
 *   - hadith:        "Bukhari 1:1 (1)"
 *   - book_chapter:  "Minhaj at-Talibin Ch. 12"
 *   - person:        "Ibn Taymiyyah"
 *   - article:       "Five Pillars of Islam"
 */
export function getCitationLabel(target: CitationTarget): string {
  switch (target.type) {
    case 'quran_ayah': {
      // Convert surah slug to display name: 'al-baqarah' → 'Al-Baqarah'
      const surahName = target.surahSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return `Quran — ${surahName} :${target.ayahNumber}`
    }
    case 'hadith': {
      const collection = target.collection
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return `${collection} — ${target.book} (${target.number})`
    }
    case 'book_chapter': {
      const bookName = target.bookSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return `${bookName} Ch. ${target.chapterNumber}`
    }
    case 'person': {
      return target.slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
    case 'article': {
      return target.slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
  }
}
