/**
 * S9-06: Meilisearch index schema for all 8 Islam.wiki corpora.
 * Defines index names, searchable attributes, filterable attributes,
 * and sortable attributes for each content type.
 */
import type { Settings } from 'meilisearch'

export const INDEX_NAMES = {
  quran: 'iw_quran',
  hadith: 'iw_hadith',
  people: 'iw_people',
  books: 'iw_books',
  articles: 'iw_articles',
  seerah: 'iw_seerah',
  videos: 'iw_videos',
  audio: 'iw_audio',
} as const

export type IndexName = (typeof INDEX_NAMES)[keyof typeof INDEX_NAMES]

export interface IndexSchema {
  name: IndexName
  primaryKey: string
  settings: Settings
}

export const INDEX_SCHEMAS: IndexSchema[] = [
  // ── Quran ──────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.quran,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['text_en', 'text_ar', 'arabic_root', 'phonetic', 'surah_slug', 'surah_number_str'],
      filterableAttributes: ['surah_number', 'juz', 'revelation_type', 'page'],
      sortableAttributes: ['surah_number', 'ayah_number', 'juz'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
      distinctAttribute: undefined,
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
      },
    },
  },

  // ── Hadith ─────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.hadith,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['text_en', 'text_ar', 'arabic_root', 'phonetic', 'collection_name', 'book_name'],
      filterableAttributes: ['collection_slug', 'book_slug', 'grade'],
      sortableAttributes: ['collection_slug', 'number'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
      },
    },
  },

  // ── People ─────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.people,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['name_en', 'name_ar', 'bio_short', 'tags'],
      filterableAttributes: ['era', 'madhab', 'category'],
      sortableAttributes: ['name_en', 'death_ah'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },

  // ── Books ──────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.books,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['title_en', 'title_ar', 'content_en', 'author_name'],
      filterableAttributes: ['book_slug', 'madhab', 'subject', 'has_text_ar'],
      sortableAttributes: ['chapter_number', 'book_slug'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },

  // ── Articles ───────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.articles,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['title', 'content', 'excerpt', 'tags', 'category'],
      filterableAttributes: ['category', 'language', 'status'],
      sortableAttributes: ['title'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },

  // ── Seerah ─────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.seerah,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['title_en', 'title_ar', 'description_en', 'place_name'],
      filterableAttributes: ['period'],
      sortableAttributes: ['date_ah_numeric'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },

  // ── Videos ─────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.videos,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['title', 'speaker', 'tags', 'transcript'],
      filterableAttributes: ['speaker', 'language'],
      sortableAttributes: ['title'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },

  // ── Audio ──────────────────────────────────────────────────────────────
  {
    name: INDEX_NAMES.audio,
    primaryKey: 'id',
    settings: {
      searchableAttributes: ['title', 'speaker', 'tags', 'transcript'],
      filterableAttributes: ['speaker', 'language'],
      sortableAttributes: ['title'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    },
  },
]
