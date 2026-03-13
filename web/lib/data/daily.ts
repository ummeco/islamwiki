// Deterministic daily selection — same item shown all day globally (UTC day of year)
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export interface DailyVerse {
  surah: number
  ayah: number
  surahSlug: string
  surahNameEn: string
  surahNameAr: string
  textAr: string
  textEn: string
}

export interface DailyHadith {
  collection: string
  number: number
  collectionName: string
  textEn: string
  narrator: string
  grade: string
}

const FEATURED_VERSES: DailyVerse[] = [
  { surah: 1, ayah: 1, surahSlug: 'al-fatiha', surahNameEn: 'Al-Fatiha', surahNameAr: 'الفاتحة', textAr: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', textEn: 'In the Name of Allah — the Most Compassionate, Most Merciful.' },
  { surah: 2, ayah: 255, surahSlug: 'al-baqarah', surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', textAr: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', textEn: 'Allah — there is no god except Him, the Ever-Living, the Sustainer of all existence.' },
  { surah: 3, ayah: 185, surahSlug: 'ali-imran', surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', textAr: 'كُلُّ نَفْسٍۢ ذَآئِقَةُ ٱلْمَوْتِ', textEn: 'Every soul will taste death.' },
  { surah: 94, ayah: 5, surahSlug: 'ash-sharh', surahNameEn: 'Ash-Sharh', surahNameAr: 'الشرح', textAr: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', textEn: 'So, surely with hardship comes ease.' },
  { surah: 2, ayah: 286, surahSlug: 'al-baqarah', surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', textAr: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', textEn: 'Allah does not burden a soul beyond that it can bear.' },
  { surah: 39, ayah: 53, surahSlug: 'az-zumar', surahNameEn: 'Az-Zumar', surahNameAr: 'الزمر', textAr: 'قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', textEn: "Say: \"O My servants who have transgressed against themselves, do not despair of Allah's mercy.\"" },
  { surah: 13, ayah: 28, surahSlug: 'ar-rad', surahNameEn: "Ar-Ra'd", surahNameAr: 'الرعد', textAr: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', textEn: 'Verily, in the remembrance of Allah do hearts find rest.' },
  { surah: 3, ayah: 139, surahSlug: 'ali-imran', surahNameEn: "Ali 'Imran", surahNameAr: 'آل عمران', textAr: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ', textEn: 'Do not weaken or grieve, for you will be superior if you are truly believers.' },
  { surah: 65, ayah: 3, surahSlug: 'at-talaq', surahNameEn: 'At-Talaq', surahNameAr: 'الطلاق', textAr: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ', textEn: 'And whoever relies upon Allah — then He is sufficient for him.' },
  { surah: 55, ayah: 13, surahSlug: 'ar-rahman', surahNameEn: 'Ar-Rahman', surahNameAr: 'الرحمن', textAr: 'فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ', textEn: 'Then which of the favours of your Lord will you deny?' },
  { surah: 2, ayah: 152, surahSlug: 'al-baqarah', surahNameEn: 'Al-Baqarah', surahNameAr: 'البقرة', textAr: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ', textEn: 'So remember Me; I will remember you.' },
  { surah: 4, ayah: 103, surahSlug: 'an-nisa', surahNameEn: "An-Nisa'", surahNameAr: 'النساء', textAr: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًا مَّوْقُوتًا', textEn: 'Indeed, prayer is an obligation on the believers at set times.' },
  { surah: 17, ayah: 23, surahSlug: 'al-isra', surahNameEn: "Al-Isra'", surahNameAr: 'الإسراء', textAr: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَـٰنًا', textEn: 'Your Lord has decreed that you worship none but Him, and that you be kind to parents.' },
  { surah: 49, ayah: 13, surahSlug: 'al-hujurat', surahNameEn: 'Al-Hujurat', surahNameAr: 'الحجرات', textAr: 'إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ', textEn: 'Indeed, the most noble of you in the sight of Allah is the most righteous of you.' },
]

const FEATURED_HADITH: DailyHadith[] = [
  { collection: 'bukhari', number: 1, collectionName: 'Sahih al-Bukhari', textEn: 'Actions are judged by intentions, and every person will get the reward according to what he has intended.', narrator: 'Umar ibn al-Khattab', grade: 'Sahih' },
  { collection: 'bukhari', number: 6018, collectionName: 'Sahih al-Bukhari', textEn: 'The best among you are those who have the best manners and character.', narrator: 'Abdullah ibn Amr', grade: 'Sahih' },
  { collection: 'muslim', number: 2564, collectionName: 'Sahih Muslim', textEn: 'None of you truly believes until he loves for his brother what he loves for himself.', narrator: 'Anas ibn Malik', grade: 'Sahih' },
  { collection: 'tirmidhi', number: 2518, collectionName: "Jami' at-Tirmidhi", textEn: 'Make things easy and do not make them difficult, cheer people up and do not drive them away.', narrator: 'Anas ibn Malik', grade: 'Sahih' },
  { collection: 'bukhari', number: 6412, collectionName: 'Sahih al-Bukhari', textEn: 'Take advantage of five before five: your youth before your old age, your health before your illness, your riches before your poverty, your free time before your work, and your life before your death.', narrator: 'Ibn Abbas', grade: 'Hasan' },
  { collection: 'muslim', number: 55, collectionName: 'Sahih Muslim', textEn: 'Whoever believes in Allah and the Last Day should say something good or keep silent. Whoever believes in Allah and the Last Day should be generous to his neighbour. Whoever believes in Allah and the Last Day should be generous to his guest.', narrator: 'Abu Hurayrah', grade: 'Sahih' },
  { collection: 'bukhari', number: 43, collectionName: 'Sahih al-Bukhari', textEn: 'Religion is sincerity: sincerity to Allah, His Book, His Messenger, and to the leaders and common folk of the Muslims.', narrator: 'Tamim al-Dari', grade: 'Sahih' },
  { collection: 'abu-dawud', number: 4682, collectionName: 'Sunan Abi Dawud', textEn: 'Seek knowledge from the cradle to the grave.', narrator: 'Anas ibn Malik', grade: 'Hasan' },
  { collection: 'muslim', number: 2699, collectionName: 'Sahih Muslim', textEn: 'Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.', narrator: 'Abu Hurayrah', grade: 'Sahih' },
  { collection: 'bukhari', number: 2442, collectionName: 'Sahih al-Bukhari', textEn: 'A Muslim is the one from whose tongue and hands the people are safe.', narrator: 'Abdullah ibn Amr', grade: 'Sahih' },
  { collection: 'tirmidhi', number: 1987, collectionName: "Jami' at-Tirmidhi", textEn: 'The strong person is not the one who overpowers others. The strong person is the one who controls himself when he is angry.', narrator: 'Abu Hurayrah', grade: 'Sahih' },
  { collection: 'bukhari', number: 5027, collectionName: 'Sahih al-Bukhari', textEn: 'The best of you are those who learn the Quran and teach it to others.', narrator: 'Uthman ibn Affan', grade: 'Sahih' },
  { collection: 'muslim', number: 2328, collectionName: 'Sahih Muslim', textEn: 'Smiling at your brother is an act of charity.', narrator: 'Abu Dharr', grade: 'Sahih' },
  { collection: 'ibn-majah', number: 4217, collectionName: 'Sunan Ibn Majah', textEn: 'Be in this world as though you were a stranger or a traveller.', narrator: 'Ibn Umar', grade: 'Sahih' },
]

export function getDailyVerse(): DailyVerse {
  return FEATURED_VERSES[getDayOfYear() % FEATURED_VERSES.length]
}

export function getDailyHadith(): DailyHadith {
  return FEATURED_HADITH[getDayOfYear() % FEATURED_HADITH.length]
}
