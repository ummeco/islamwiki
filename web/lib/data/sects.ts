import sectsData from '@/data/sects/sects.json'

interface SectData {
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
}

const sects: SectData[] = sectsData as SectData[]

export function getSects(): SectData[] {
  return sects
}

export function getSectBySlug(slug: string): SectData | undefined {
  return sects.find((s) => s.slug === slug)
}
