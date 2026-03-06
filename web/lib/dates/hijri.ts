/**
 * Hijri date formatting utilities for Islam.wiki.
 *
 * Display convention (site-wide):
 *   Primary:   Hijri  (BH / AH, with optional month)
 *   Secondary: CE/AD  (shown in muted text where space allows)
 *
 * Example outputs:
 *   formatIslamicDate({ year_ah: 2, date_ah: '17 Ramadan, 2 AH', date_ce: '13 March 624 CE' })
 *   → { primary: '17 Ramadan, 2 AH', secondary: '13 March 624 CE' }
 *
 *   formatIslamicDate({ year_ah: -53, date_ce: '570 CE' })
 *   → { primary: '53 BH', secondary: '570 CE' }
 */

export interface IslamicDateInput {
  /** Signed integer: negative = BH, positive = AH, 0 = year of Hijra */
  year_ah?: number | null
  /** Full Hijri string when known, e.g. "17 Ramadan, 2 AH" or "Rajab, 10 BH" */
  date_ah?: string | null
  /** CE string, e.g. "13 March 624 CE" or "624 CE" */
  date_ce?: string | null
}

export interface FormattedIslamicDate {
  /** Primary Hijri label shown prominently */
  primary: string
  /** Optional CE label shown in muted secondary text */
  secondary?: string
}

/**
 * Returns a Hijri-primary date pair for display.
 * Falls back gracefully when data is incomplete.
 */
export function formatIslamicDate(input: IslamicDateInput): FormattedIslamicDate {
  const { year_ah, date_ah, date_ce } = input

  let primary: string

  if (date_ah) {
    // Full Hijri string already provided ("17 Ramadan, 2 AH", "Rajab, 10 BH", etc.)
    primary = date_ah
  } else if (year_ah != null) {
    if (year_ah < 0) {
      primary = `${Math.abs(year_ah)} BH`
    } else if (year_ah === 0) {
      primary = 'Year of Hijra (1 AH)'
    } else {
      primary = `${year_ah} AH`
    }
  } else {
    // No Hijri data — fall back to CE
    primary = date_ce ?? ''
  }

  // Show CE as secondary only when we have Hijri data
  const secondary = year_ah != null ? (date_ce ?? undefined) : undefined

  return { primary, secondary }
}

/**
 * Compact single-string format for metadata / page titles.
 * E.g. "17 Ramadan, 2 AH (13 March 624 CE)" or "53 BH (570 CE)"
 */
export function formatIslamicDateCompact(input: IslamicDateInput): string {
  const { primary, secondary } = formatIslamicDate(input)
  return secondary ? `${primary} (${secondary})` : primary
}

/**
 * Short year-only label, useful for index pages and cards.
 * Strips month names, keeps BH/AH suffix.
 * E.g. "2 AH", "53 BH", "1 AH (622 CE)"
 */
export function formatIslamicYear(
  year_ah: number | null | undefined,
  year_ce?: number | null,
  includeCe = true
): string {
  if (year_ah == null) {
    return year_ce ? `${year_ce} CE` : ''
  }

  let hijri: string
  if (year_ah < 0) {
    hijri = `${Math.abs(year_ah)} BH`
  } else if (year_ah === 0) {
    hijri = '1 AH'
  } else {
    hijri = `${year_ah} AH`
  }

  if (includeCe && year_ce) {
    return `${hijri} (${year_ce} CE)`
  }
  return hijri
}
