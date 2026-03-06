// Quran JSON schema types for static data files in web/data/quran/

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

export type TranslatorKey =
  | 'iwq'
  | 'sahih-int'
  | 'khattab'
  | 'haleem'
  | 'asad'
  | 'yusuf-ali'
  | 'pickthall'
  | 'arberry'
  | 'shakir'
  | 'hilali-khan'
  | 'ghali'
  | 'maariful'
  | 'irving'
  | 'itani'
  | 'mubarakpuri'
  | 'qarib'
  | 'wahiduddin'

export type IdTranslatorKey = 'iwq' | 'kemenag' | 'sabiq' | 'jalalayn-id'

export interface IWQVerification {
  confidence: 'high' | 'medium' | 'low'
  verified: boolean
  sunnah_web_checked: boolean
  tafsir_aligned: boolean
  translator_consensus: number
  translator_divergence: number
  notes: string
  checked_by_agent: string
}

export interface AyahJSON {
  n: number
  cn: number
  surah: number
  juz: number
  page: number
  hizb: number
  ruku: number
  sajda: boolean
  sajda_type: string | null
  section_id: number | null
  ar: string
  ar_simple: string
  transliteration: string
  t: Record<TranslatorKey | string, string>
  t_id: Record<IdTranslatorKey | string, string>
  tafsir: Record<string, string | null>
  topics: string[]
  tags: string[]
  quran_refs: string[]
  hadith_refs: string[]
  iwq_verification: IWQVerification
}

export interface WordJSON {
  surah: number
  ayah: number
  word_n: number
  ayah_cn: number
  ar: string
  ar_clean: string
  transliteration: string
  pos: string
  pos_label: string
  lemma: string
  root: string
  root_en: string
  gloss_en: string
  gloss_id: string | null
  morphology: string
  person_id: string | null
  topic_ids: string[]
}

export interface SectionJSON {
  id: string
  surah: number
  section_n: number
  ruku_start: number
  ruku_end: number
  ayah_start: number
  ayah_end: number
  cn_start: number
  cn_end: number
  title_ar: string
  title_en: string
  revelation_context_en: string
  revelation_context_ar: string
  tafsir_summary: Record<string, string>
  tafsir_page_refs: Record<string, { volume: number; page: number }>
  topics: string[]
  tags: string[]
  section_boundary_method: string
}

export interface SurahJSON {
  number: number
  name_ar: string
  name_en: string
  name_transliteration: string
  slug: string
  revelation_type: 'meccan' | 'medinan'
  verses_count: number
  juz_start: number
  page_start: number
  description_en?: string
  has_bismillah: boolean
  section_count: number | null
  word_count: number | null
}
