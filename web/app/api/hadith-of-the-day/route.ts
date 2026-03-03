import { NextResponse } from 'next/server'

function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const FEATURED_HADITH = [
  {
    collection: 'bukhari', number: 1, collectionName: 'Sahih al-Bukhari',
    textEn: 'Actions are judged by intentions, and every person will get the reward according to what he has intended.',
    narrator: 'Umar ibn al-Khattab', grade: 'Sahih',
  },
  {
    collection: 'bukhari', number: 6018, collectionName: 'Sahih al-Bukhari',
    textEn: 'The best among you are those who have the best manners and character.',
    narrator: 'Abdullah ibn Amr', grade: 'Sahih',
  },
  {
    collection: 'muslim', number: 2564, collectionName: 'Sahih Muslim',
    textEn: 'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Malik', grade: 'Sahih',
  },
  {
    collection: 'tirmidhi', number: 2518, collectionName: "Jami' at-Tirmidhi",
    textEn: 'Make things easy and do not make them difficult, cheer people up and do not drive them away.',
    narrator: 'Anas ibn Malik', grade: 'Sahih',
  },
  {
    collection: 'bukhari', number: 6412, collectionName: 'Sahih al-Bukhari',
    textEn: 'Take advantage of five before five: your youth before your old age, your health before your illness, your riches before your poverty, your free time before your work, and your life before your death.',
    narrator: 'Ibn Abbas', grade: 'Hasan',
  },
]

export async function GET() {
  const day = getDayOfYear()
  const hadith = FEATURED_HADITH[day % FEATURED_HADITH.length]
  return NextResponse.json(hadith, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
