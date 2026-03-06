// Hadith JSON schema types for static data files in web/data/hadith/

export type GradeSlug =
  | 'mutawatir'
  | 'sahih-li-dhatihi'
  | 'sahih-li-ghayrihi'
  | 'hasan-li-dhatihi'
  | 'hasan-li-ghayrihi'
  | 'daif'
  | 'daif-jiddan'
  | 'munkar'
  | 'mawdu'
  | 'ungraded'

export interface GradeEntry {
  scholar: string
  scholar_id: string
  grade: GradeSlug
  grade_display: string
  source: string
  note: string
}

export interface IsnadChainEntry {
  level: number
  name_ar: string
  name_en: string
  name_simple: string
  person_id: string
  transmission_term: string
  transmission_en: string
  companion: boolean
  companion_grade?: string
}

export interface SharHRef {
  source: string
  scholar: string
  volume: number
  page: number
  excerpt_ar: string
  excerpt_en: string
}

export interface IWHVerification {
  verified: boolean
  ar_normalized: boolean
  isnad_separated: boolean
  sunnah_com_checked: boolean
  sharh_checked: boolean
  ar_matn_verified: boolean
  grade_verified: boolean
  confidence: 'high' | 'medium' | 'low'
  notes: string
  checked_by_agent: string
}

export interface DuplicateRef {
  collection: string
  cn: number
  grade: GradeSlug
}

export interface VariantRef {
  iw_id: string
  diff_type: string
}

export interface HadithJSON {
  n: number
  cn: number
  book: number
  collection: string
  chapter_ar: string
  chapter_en: string
  section_ar: string
  section_en: string
  ar: string
  ar_clean: string
  isnad_ar: string
  matn_ar: string
  matn_ar_clean: string
  isnad_chain: IsnadChainEntry[]
  isnad_separation_method: string
  isnad_confidence: 'high' | 'medium' | 'low'
  sunnah_ref_en: string
  iwh_en: string
  iwh_id: string
  grade: GradeSlug
  grade_display: string
  grades: GradeEntry[]
  topics: string[]
  tags: string[]
  quran_refs: string[]
  iw_category: string
  iw_subcategory: string
  iw_id: string
  duplicates: DuplicateRef[]
  variants: VariantRef[]
  sharh_refs: SharHRef[]
  iwh_verification: IWHVerification
  ref: string
}

// IWH all-hadith unified schema
export interface IWHAllHadith {
  iw_id: string
  iw_category: string
  iw_category_id: number
  iw_subcategory: string
  iw_subcategory_id: number
  canonical_ar: string
  canonical_source: string
  canonical_cn: number
  iwh_en: string
  iwh_id: string
  grade: GradeSlug
  grade_display: string
  all_citations: Array<{ collection: string; cn: number; grade: GradeSlug; book: number }>
  variants: VariantRef[]
  topics: string[]
  tags: string[]
  quran_refs: string[]
  isnad_summary_en: string
}
