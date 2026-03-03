import surahsData from '@/data/quran/surahs.json'

interface SurahData {
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
}

interface AyahData {
  number_in_surah: number
  text_ar: string
  translation_en?: string
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

export function getAyahsBySurah(surahNumber: number): AyahData[] {
  const surah = getSurahByNumber(surahNumber)
  if (!surah) return []

  // Generate stub ayahs until full dataset is loaded
  return Array.from({ length: surah.verses_count }, (_, i) => ({
    number_in_surah: i + 1,
    text_ar: `بِسْمِ ٱللَّهِ — آية ${i + 1}`, // Placeholder Arabic
    translation_en: undefined,
  }))
}

export function getAyah(
  surahNumber: number,
  ayahNumber: number
): (AyahData & { surah_number: number }) | undefined {
  const surah = getSurahByNumber(surahNumber)
  if (!surah || ayahNumber < 1 || ayahNumber > surah.verses_count) return undefined

  return {
    surah_number: surahNumber,
    number_in_surah: ayahNumber,
    text_ar: `بِسْمِ ٱللَّهِ — آية ${ayahNumber}`,
    translation_en: undefined,
  }
}
