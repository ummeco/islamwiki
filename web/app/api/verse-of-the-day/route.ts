import { NextResponse } from 'next/server'

// Deterministic by day of year — same verse shown all day globally
function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Curated list of impactful verses for daily display
const FEATURED_VERSES = [
  { surah: 1, ayah: 1, surahSlug: 'al-fatiha', surahNameEn: 'Al-Fatiha', surahNameAr: 'الفاتحة', textAr: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', textEn: 'In the Name of Allah — the Most Compassionate, Most Merciful.' },
  { surah: 2, ayah: 255, surahSlug: 'al-baqarah', surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', textAr: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', textEn: 'Allah — there is no god except Him, the Ever-Living, the Sustainer of all existence.' },
  { surah: 3, ayah: 185, surahSlug: 'ali-imran', surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', textAr: 'كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ', textEn: 'Every soul will taste death.' },
  { surah: 94, ayah: 5, surahSlug: 'ash-sharh', surahNameEn: 'Ash-Sharh', surahNameAr: 'الشرح', textAr: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', textEn: 'So, surely with hardship comes ease.' },
  { surah: 2, ayah: 286, surahSlug: 'al-baqarah', surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', textAr: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', textEn: 'Allah does not burden a soul beyond that it can bear.' },
  { surah: 39, ayah: 53, surahSlug: 'az-zumar', surahNameEn: 'Az-Zumar', surahNameAr: 'الزمر', textAr: 'قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', textEn: "Say: \"O My servants who have transgressed against themselves, do not despair of Allah's mercy.\"" },
  { surah: 13, ayah: 28, surahSlug: 'ar-rad', surahNameEn: "Ar-Ra'd", surahNameAr: 'الرعد', textAr: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', textEn: 'Verily, in the remembrance of Allah do hearts find rest.' },
]

export async function GET() {
  const day = getDayOfYear()
  const verse = FEATURED_VERSES[day % FEATURED_VERSES.length]
  return NextResponse.json(verse, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
