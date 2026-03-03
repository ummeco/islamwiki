// ── Quran ──

export interface Surah {
  id: number
  number: number
  name_ar: string
  name_en: string
  name_transliteration: string
  revelation_type: 'meccan' | 'medinan'
  verses_count: number
  juz_start: number
  page_start: number
  description_en?: string
}

export interface Ayah {
  id: number
  surah_id: number
  surah_number: number
  number_in_surah: number
  number_global: number
  text_ar: string
  text_uthmani: string
  page: number
  juz: number
  hizb: number
}

export interface QuranTranslation {
  id: number
  ayah_id: number
  language: string
  translator: string
  translator_slug: string
  text: string
}

export interface Tafsir {
  id: number
  ayah_id: number
  source: string
  source_slug: string
  language: string
  text: string
}

// ── Hadith ──

export interface HadithCollection {
  id: number
  name_ar: string
  name_en: string
  slug: string
  author_id: number
  author_name_en: string
  total_hadith: number
  total_books: number
  description_en?: string
}

export interface HadithBook {
  id: number
  collection_id: number
  collection_slug: string
  number: number
  name_ar: string
  name_en: string
  slug: string
  hadith_count: number
}

export interface HadithEntry {
  id: number
  book_id: number
  collection_slug: string
  book_number: number
  number_in_book: number
  number_global: number
  text_ar: string
  text_en: string
  grade: HadithGrade
  graded_by?: string
  chapter_ar?: string
  chapter_en?: string
}

export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown'

export interface IsnadNarrator {
  position: number
  person_id: number
  person_name_en: string
  person_name_ar: string
  role: string
}

export interface Isnad {
  id: number
  hadith_id: number
  chain: IsnadNarrator[]
  chain_text_ar?: string
  evaluation: string
  notes?: string
}

// ── People ──

export interface Person {
  id: number
  slug: string
  name_ar: string
  name_en: string
  name_full_ar?: string
  name_full_en?: string
  title?: string
  kunyah?: string
  laqab?: string
  birth_year_ah?: number
  birth_year_ce?: number
  death_year_ah?: number
  death_year_ce?: number
  birth_place_id?: number
  birth_place_name?: string
  death_place_id?: number
  death_place_name?: string
  bio_short_en?: string
  bio_full_en?: string
  era: PersonEra
  category: PersonCategory
  image_url?: string
}

export type PersonEra =
  | 'prophet'
  | 'sahabi'
  | 'tabii'
  | 'tabi_tabii'
  | 'classical'
  | 'medieval'
  | 'ottoman'
  | 'modern'

export type PersonCategory =
  | 'prophet'
  | 'companion'
  | 'tabi'
  | 'muhaddith'
  | 'faqih'
  | 'mufassir'
  | 'historian'
  | 'sufi'
  | 'theologian'
  | 'linguist'
  | 'scientist'
  | 'ruler'
  | 'narrator'
  | 'other'

export type RelationshipType =
  | 'parent'
  | 'child'
  | 'spouse'
  | 'sibling'
  | 'teacher'
  | 'student'
  | 'companion'

export interface PersonRelationship {
  id: number
  person_id: number
  related_person_id: number
  related_person_name_en: string
  related_person_slug: string
  relationship_type: RelationshipType
  notes?: string
}

export interface PersonPlace {
  id: number
  person_id: number
  place_id: number
  place_name_en: string
  year_start_ah?: number
  year_end_ah?: number
  role?: string
  notes?: string
}

// ── Places ──

export interface Place {
  id: number
  slug: string
  name_ar: string
  name_en: string
  past_names?: string[]
  lat: number
  lng: number
  region?: string
  description_en?: string
}

// ── Books ──

export interface Book {
  id: number
  slug: string
  title_ar: string
  title_en: string
  author_id: number
  author_name_en: string
  author_slug: string
  year_written_ah?: number
  year_written_ce?: number
  subject: BookSubject
  language_original: string
  volumes?: number
  pages?: number
  description_en?: string
  available_languages: string[]
}

export type BookSubject =
  | 'hadith'
  | 'fiqh'
  | 'tafsir'
  | 'aqeedah'
  | 'seerah'
  | 'history'
  | 'usul_fiqh'
  | 'arabic_language'
  | 'biography'
  | 'general'

export interface BookChapter {
  id: number
  book_id: number
  book_slug: string
  number: number
  title_ar?: string
  title_en: string
  content_en?: string
  content_ar?: string
}

// ── Seerah ──

export interface SeerahEvent {
  id: number
  slug: string
  title_ar: string
  title_en: string
  date_ah?: string
  date_ce?: string
  year_bh?: number
  year_ah?: number
  description_en: string
  place_id?: number
  place_name?: string
  place_lat?: number
  place_lng?: number
  significance: 'major' | 'moderate' | 'minor'
  sources?: string[]
  order: number
}

export interface SeerahPath {
  id: number
  slug: string
  name_en: string
  description_en: string
  waypoints: Array<{ lat: number; lng: number; label?: string }>
  color?: string
}

// ── Articles ──

export interface Article {
  id: number
  slug: string
  title: string
  excerpt?: string
  content: string
  category: string
  tags: string[]
  language: string
  status: ContentStatus
  author_id?: number
  author_name?: string
  created_at: string
  updated_at: string
}

// ── Media ──

export interface Media {
  id: number
  slug: string
  title: string
  type: 'video' | 'audio'
  external_url: string
  embed_code?: string
  transcript?: string
  duration?: string
  speaker?: string
  speaker_id?: number
  language: string
  tags: string[]
  thumbnail_url?: string
}

// ── Sects ──

export interface Sect {
  id: number
  slug: string
  name_ar: string
  name_en: string
  parent_sect_id?: number
  parent_sect_slug?: string
  founded_year_ah?: number
  founded_year_ce?: number
  founder_id?: number
  founder_name?: string
  description_en: string
  status: 'mainstream' | 'accepted' | 'deviant' | 'rejected'
  key_beliefs?: string[]
  children?: Sect[]
}

// ── Wiki ──

export interface WikiPage {
  id: number
  slug: string
  title: string
  content: string
  category?: string
  status: ContentStatus
  created_by?: number
  created_at: string
  updated_at: string
}

export interface WikiRevision {
  id: number
  page_id: number
  content: string
  editor_id: number
  editor_name: string
  edit_summary: string
  status: 'approved' | 'pending' | 'rejected'
  reviewed_by?: number
  created_at: string
}

// ── Auth ──

export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url?: string
  role: 'user' | 'editor' | 'moderator' | 'admin' | 'owner'
  trust_level: TrustLevel
  total_edits: number
  approved_edits: number
  created_at: string
}

// ── Search ──

export interface SearchResult {
  type: 'quran' | 'hadith' | 'person' | 'book' | 'article' | 'seerah' | 'video' | 'audio' | 'sect' | 'wiki'
  id: number
  title: string
  excerpt: string
  url: string
  relevance: number
}

// ── Common ──

export type ContentStatus = 'published' | 'draft' | 'pending' | 'archived'

export type Locale = 'en' | 'ar' | 'id'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
