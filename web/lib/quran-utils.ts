// Pure formatting utilities — safe to import in client components (no server-only deps)

/**
 * Normalizes Uthmani Arabic Extended-A tanwin marks to standard Unicode equivalents
 * so they render correctly regardless of font support:
 *   U+08F0 ARABIC OPEN FATHATAN  → U+064B ARABIC FATHATAN
 *   U+08F1 ARABIC OPEN DAMMATAN  → U+064C ARABIC DAMMATAN
 *   U+08F2 ARABIC OPEN KASRATAN  → U+064D ARABIC KASRATAN
 * Visually and phonetically identical; only the glyph variant differs.
 */
export function normalizeArabic(text: string): string {
  return text.replace(/\u08F0/g, '\u064B').replace(/\u08F1/g, '\u064C').replace(/\u08F2/g, '\u064D')
}

/**
 * Lowercases the definite article prefix in transliterated surah names:
 * "Al-Baqarah" → "al-Baqarah", "An-Nisa" → "an-Nisa", "Ali 'Imran" → "Ali 'Imran"
 */
export function surahTranslit(nameTranslit: string): string {
  return nameTranslit.replace(/^([A-Z][a-z]?)-/, (_, g: string) => g.toLowerCase() + '-')
}

/**
 * Full display title: "Surat al-Baqarah (The Cow)"
 */
export function surahTitle(nameTranslit: string, nameEn: string): string {
  return `Surat ${surahTranslit(nameTranslit)} (${nameEn})`
}
