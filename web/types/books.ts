/**
 * Types for Islam.wiki Books — v2 schema
 * Matches the full ChapterData interface in lib/data/books.ts
 */

export type SourceType = 'html' | 'pdf' | 'epub' | 'text' | 'ocr' | 'editorial' | 'unknown'

export type SourceStatus = 'confirmed' | 'verify' | 'no-source'

export type Madhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'dhahiri' | 'general' | 'multi'

/** Raw chapter JSON as stored in data/books/{slug}/*.json */
export interface ChapterJSON {
  number: number
  title_en: string
  title_ar?: string
  title_id?: string
  content_en?: string
  content_ar?: string
  content_id?: string
  chapter_summary_en?: string
  chapter_summary_id?: string
  subject_tags?: string[]
  topic_tags?: string[]
  madhab_tags?: string[]
  era_tags?: string[]
  content_type_tags?: string[]
  keywords?: string[]
  keywords_ar?: string[]
  people_refs?: string[]
  ayah_refs?: string[]
  hadith_refs?: string[]
  source_lang?: string
  source_type?: SourceType
  source_url?: string
  source_file?: string
  page_start?: number
  page_end?: number
  en_processed_from_source?: boolean
  en_translated_from_ar?: boolean
  ar_is_source?: boolean
  ar_translated_from_en?: boolean
  id_translated_from_ar?: boolean
  id_translated_from_en?: boolean
  translated_ar_to_en?: boolean
  translated_en_to_id?: boolean
  translated_ar_to_id?: boolean
  is_editorial?: boolean
  editorial_note?: string
  no_source_found?: boolean
  no_source_reason?: string
  qa_passed?: boolean
  qa_errors?: string[]
  last_updated?: string
  translation_credit?: string
  translation_note?: string
}

/** Single entry in data/books/classical.json */
export interface BookIndexEntry {
  id: number
  slug: string
  title_ar: string
  title_en: string
  author_id: number | null
  author_name_en: string
  author_slug?: string
  year_written_ah?: number
  year_written_ce?: number
  subject: string
  language_original: string
  volumes?: number
  description_en?: string
  available_languages: string[]
  source_url_primary?: string | null
  source_type?: SourceType | null
  source_status?: SourceStatus
  category_primary?: string | null
  category_secondary?: string | null
  canonical?: boolean
  canonical_slug?: string | null
  died_ah?: number | null
  madhab?: Madhab | null
  publisher_en?: string | null
  has_text_ar?: boolean
  has_text_en?: boolean
  has_text_id?: boolean
  introduction_written?: boolean
  index_generated?: boolean
  qa_passed?: boolean
  qa_score?: number | null
  is_short_treatise?: boolean
  has_no_chapters?: boolean
  chapter_zero_only?: boolean
  related_slugs?: string[]
  subject_tags?: string[]
  topic_tags?: string[]
  era_tags?: string[]
  region_tags?: string[]
}

/** Entry in data/books/redirects.json */
export interface BookRedirect {
  from: string
  to: string
  permanent: boolean
}

/** Full redirects file */
export type BookIndexJSON = BookIndexEntry[]
