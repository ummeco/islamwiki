import sectsData from '@/data/sects/sects.json'

export interface SectData {
  id: number
  slug: string
  name_ar: string
  name_en: string
  parent_sect_id?: number
  parent_sect_slug?: string
  category: 'ahlussunnah' | 'madhab' | 'shia' | 'classical-deviant' | 'sufi' | 'contemporary' | 'outside-fold'
  founded_year_ah?: number
  founded_year_ce?: number
  founder_id?: number
  founder_name?: string
  description_en: string
  status: 'mainstream' | 'accepted' | 'deviant' | 'rejected'
  key_beliefs?: string[]
  scholarly_evaluation?: string
  key_figures?: string[]
  sources?: string[]
}

const sects: SectData[] = sectsData as SectData[]

export function getSects(): SectData[] {
  return sects
}

export function getSectBySlug(slug: string): SectData | undefined {
  return sects.find((s) => s.slug === slug)
}

export function getSectsByCategory(category: SectData['category']): SectData[] {
  return sects.filter((s) => s.category === category)
}
