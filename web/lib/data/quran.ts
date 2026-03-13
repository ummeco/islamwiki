import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import surahsData from '@/data/quran/surahs.json'
import type { AyahJSON } from '@/types/quran-json'

export interface SurahData {
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
  word_count?: number
  has_bismillah?: boolean
  section_count?: number | null
}

export interface AyahData {
  // n = verse number within the surah (1-indexed, resets per surah)
  // cn = global/continuous number across all surahs (runs 1–6236)
  number_in_surah: number   // = a.n
  global_number: number     // = a.cn
  text_ar: string
  ar_simple: string
  transliteration: string
  translations: Record<string, string>
  translations_id: Record<string, string>
  ruku: number
  section_id: number | null
  juz: number
  page: number
  hizb: number
}

export interface JuzAyahGroup {
  surah: SurahData
  ayahs: AyahData[]
}

const surahs: SurahData[] = surahsData as SurahData[]

export function getSurahs(): SurahData[] {
  return surahs
}

export function getSurahBySlug(slug: string): SurahData | undefined {
  return surahs.find((s) => s.slug === slug)
}

export function getSurahByNumber(number: number): SurahData | undefined {
  return surahs.find((s) => s.number === number)
}

const ayahCache = new Map<number, AyahData[]>()

export function getAyahsBySurah(surahNumber: number): AyahData[] {
  if (ayahCache.has(surahNumber)) return ayahCache.get(surahNumber)!
  const pad = String(surahNumber).padStart(3, '0')
  const filePath = join(process.cwd(), 'data', 'quran', 'ayahs', `${pad}.json`)
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const ayahs: AyahJSON[] = JSON.parse(raw)
    const result = ayahs.map((a) => ({
      number_in_surah: a.n,        // n resets per surah: 1, 2, 3 ... verses_count
      global_number: a.cn,         // cn is cumulative: 1 ... 6236
      text_ar: a.ar,
      ar_simple: a.ar_simple,
      transliteration: a.transliteration ?? '',
      translations: a.t ?? {},
      translations_id: a.t_id ?? {},
      ruku: a.ruku,
      section_id: a.section_id,
      juz: a.juz,
      page: a.page,
      hizb: a.hizb,
    }))
    ayahCache.set(surahNumber, result)
    return result
  } catch {
    const surah = getSurahByNumber(surahNumber)
    if (!surah) return []
    return Array.from({ length: surah.verses_count }, (_, i) => ({
      number_in_surah: i + 1,
      global_number: 0,
      text_ar: '',
      ar_simple: '',
      transliteration: '',
      translations: {},
      translations_id: {},
      ruku: 1,
      section_id: null,
      juz: surah.juz_start,
      page: surah.page_start,
      hizb: 1,
    }))
  }
}

export function getAyah(
  surahNumber: number,
  ayahNumber: number
): (AyahData & { surah_number: number }) | undefined {
  const surah = getSurahByNumber(surahNumber)
  if (!surah || ayahNumber < 1 || ayahNumber > surah.verses_count) return undefined
  const ayahs = getAyahsBySurah(surahNumber)
  const ayah = ayahs.find((a) => a.number_in_surah === ayahNumber)
  if (!ayah) return undefined
  return { ...ayah, surah_number: surahNumber }
}

// Returns all ayahs in a juz, grouped by surah, in order.
// Only loads surah files that could contain ayahs for the requested juz.
export function getJuzAyahs(juzNumber: number): JuzAyahGroup[] {
  const groups: JuzAyahGroup[] = []
  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i]
    // Skip surahs that start after this juz
    if (surah.juz_start > juzNumber) break
    // Skip surahs that definitely ended before this juz started.
    // A surah ends before juz N if the next surah starts at juz N or later
    // and this surah starts before juz N-1. (conservative: always load if juz_start >= juzNumber - 1)
    if (surah.juz_start < juzNumber - 1) continue
    const ayahs = getAyahsBySurah(surah.number).filter((a) => a.juz === juzNumber)
    if (ayahs.length > 0) groups.push({ surah, ayahs })
  }
  return groups
}

// Returns all ayahs on a given Mushaf page (1–604), grouped by surah.
// Uses page_start to identify candidate surahs without loading all 114 files.
export function getAyahsByPage(pageNumber: number): JuzAyahGroup[] {
  const groups: JuzAyahGroup[] = []
  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i]
    if (surah.page_start > pageNumber) break
    const nextPageStart = i + 1 < surahs.length ? surahs[i + 1].page_start : 605
    // Skip surahs that end before this page (next surah started before or on this page, and this surah started before this page)
    if (nextPageStart <= pageNumber && surah.page_start < pageNumber) continue
    const ayahs = getAyahsBySurah(surah.number).filter((a) => a.page === pageNumber)
    if (ayahs.length > 0) groups.push({ surah, ayahs })
  }
  return groups
}
