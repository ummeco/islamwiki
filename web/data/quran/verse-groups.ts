export interface VerseGroup {
  id: string
  surahNumber: number
  startAyah: number
  endAyah: number
  titleEn: string
  summaryEn: string
}

// Seed data from Tafsir Ibn Kathir chapter divisions
// Al-Fatiha (1)
// Al-Baqarah (2) — major sections
// Al-Ikhlas (112), Al-Falaq (113), An-Nas (114)
export const VERSE_GROUPS: VerseGroup[] = [
  // Al-Fatiha
  { id: '1-1-7', surahNumber: 1, startAyah: 1, endAyah: 7, titleEn: 'The Opening Prayer', summaryEn: 'The complete surah as a unified supplication — a conversation between the servant and Allah, asking for guidance to the straight path.' },

  // Al-Baqarah major sections
  { id: '2-1-5', surahNumber: 2, startAyah: 1, endAyah: 5, titleEn: 'The Believers', summaryEn: 'The qualities of the true believers: those who benefit from the Quran, establish prayer, spend in charity, and are certain of the hereafter.' },
  { id: '2-6-7', surahNumber: 2, startAyah: 6, endAyah: 7, titleEn: 'The Disbelievers', summaryEn: 'Warning is of no benefit to those who have sealed their hearts against faith.' },
  { id: '2-8-20', surahNumber: 2, startAyah: 8, endAyah: 20, titleEn: 'The Hypocrites', summaryEn: 'The hypocrites who claim belief but seek to deceive Allah and the believers, described through vivid parables.' },
  { id: '2-21-29', surahNumber: 2, startAyah: 21, endAyah: 29, titleEn: 'The Challenge to Mankind', summaryEn: 'All people are called to worship their Creator, and the Quran issues a challenge to produce something comparable.' },
  { id: '2-30-39', surahNumber: 2, startAyah: 30, endAyah: 39, titleEn: 'The Creation of Adam', summaryEn: "The story of Adam's creation, the angels' prostration, Iblis's refusal, and humanity's descent to Earth." },
  { id: '2-40-123', surahNumber: 2, startAyah: 40, endAyah: 123, titleEn: 'The Children of Israel', summaryEn: "A detailed account of the Israelites' covenant with Allah, their blessings and transgressions, and lessons for the Muslim community." },
  { id: '2-124-141', surahNumber: 2, startAyah: 124, endAyah: 141, titleEn: 'Ibrahim and the Kaabah', summaryEn: "Ibrahim's role as a leader of nations, the building of the Kaabah, and the institution of the Muslim ummah." },
  { id: '2-142-152', surahNumber: 2, startAyah: 142, endAyah: 152, titleEn: 'The Change of Qiblah', summaryEn: 'The command to change the direction of prayer from Jerusalem to Makkah, and the wisdom behind it.' },
  { id: '2-153-177', surahNumber: 2, startAyah: 153, endAyah: 177, titleEn: 'Patience and the Pillars', summaryEn: 'Guidelines on patience, the sanctity of life, fasting, pilgrimage, fighting in Allah\'s cause, and the definition of true righteousness.' },
  { id: '2-253-286', surahNumber: 2, startAyah: 253, endAyah: 286, titleEn: 'Ayat al-Kursi and the Closing', summaryEn: "The greatest verse in the Quran (Ayat al-Kursi), the parable of compulsion in religion, and the surah's concluding supplication." },

  // Al-Ikhlas
  { id: '112-1-4', surahNumber: 112, startAyah: 1, endAyah: 4, titleEn: 'Pure Monotheism', summaryEn: 'A complete declaration of Allah\'s absolute oneness, self-sufficiency, and uniqueness — worth a third of the Quran.' },

  // Al-Falaq
  { id: '113-1-5', surahNumber: 113, startAyah: 1, endAyah: 5, titleEn: 'Seeking Refuge from Evil', summaryEn: 'Seeking Allah\'s protection from the harms of creation, darkness, witchcraft, and the envy of enviers.' },

  // An-Nas
  { id: '114-1-6', surahNumber: 114, startAyah: 1, endAyah: 6, titleEn: 'Refuge from the Whisperer', summaryEn: 'Seeking refuge in Allah — the Lord, King, and God of all people — from the whispering of Shaytan in the hearts of men.' },
]

export function getVerseGroupsBySurah(surahNumber: number): VerseGroup[] {
  return VERSE_GROUPS.filter(g => g.surahNumber === surahNumber)
}
