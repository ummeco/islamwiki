'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface SeerahMapEvent {
  id: number
  slug: string
  title_en: string
  title_ar?: string
  date_ah?: string | null   // Full Hijri string: "17 Ramadan, 2 AH"
  date_ce?: string | null   // CE string: "13 March 624 CE"
  year_ah?: number | null   // Numeric: -53 (BH) or 2 (AH)
  year_ce?: number | null   // Numeric CE year
  summary_en?: string
  description_en?: string
  place_name?: string | null
  place_lat?: number | null
  place_lng?: number | null
  significance: 'major' | 'moderate' | 'minor'
  sources?: string[]
}

interface SeerahMapProps {
  events: SeerahMapEvent[]
  activeIndex: number
  onEventClick?: (index: number) => void
}

// ── Geographic constants ──────────────────────────────────────────────────────

const MECCA: [number, number] = [21.4225, 39.8262]
const MEDINA: [number, number] = [24.4686, 39.6142]

function isNearHolyCity(lat: number, lng: number): boolean {
  const dM = Math.sqrt((lat - MECCA[0]) ** 2 + (lng - MECCA[1]) ** 2)
  const dN = Math.sqrt((lat - MEDINA[0]) ** 2 + (lng - MEDINA[1]) ** 2)
  return dM < 0.18 || dN < 0.15 // ~20km / ~17km
}

function getSmartZoom(
  toLat: number,
  toLng: number,
  fromLat: number | null,
  fromLng: number | null
): number {
  const holyCity = isNearHolyCity(toLat, toLng)
  if (fromLat == null || fromLng == null) return holyCity ? 11 : 8

  const distKm =
    Math.sqrt((toLat - fromLat) ** 2 + (toLng - fromLng) ** 2) * 111

  if (distKm < 4) return holyCity ? 13 : 12
  if (distKm < 20) return holyCity ? 12 : 10
  if (distKm < 70) return holyCity ? 11 : 9
  if (distKm < 200) return 8
  if (distKm < 600) return 7
  return 5
}

// ── Non-travel events — no route arc should be drawn ─────────────────────────
// These are events the Prophet ﷺ was not physically traveling TO from the
// previous event location — he was already there, the event is a revelation,
// a birth/death, a reception of visitors, or an in-place administrative event.

const NON_TRAVEL_SLUGS = new Set([
  // ── Pre-Prophet history context ──────────────────────────────────────────
  'abd-al-muttalib-rediscovers-zamzam',
  'marriage-of-abdullah-aminah',
  // ── Birth and early childhood ────────────────────────────────────────────
  'year-of-elephant',             // Abraha came TO Mecca — Prophet not yet born
  'death-of-abdullah',            // Father died before Prophet's birth
  'birth-of-prophet',             // Born in Mecca
  'splitting-of-chest',           // Same location as foster care (Taif area)
  'death-of-aminah',              // She died; 6-year-old Prophet was returning home
  'death-of-abd-al-muttalib',     // In Mecca — returned from Medina visit
  // ── Pre-prophethood Mecca ────────────────────────────────────────────────
  'marriage-to-khadijah',         // In Mecca — not travel to here from Syria trade journey
  'rebuilding-of-kaaba',          // In Mecca — same location as previous events
  // ── First revelation and early dawah ────────────────────────────────────
  'retreat-in-cave-hira',         // Small movement within Mecca — Cave Hira is ~5km away
  'first-revelation',             // At Cave Hira — same location as retreat
  'khadijah-first-believer',      // Returned to Mecca — not the Prophet traveling TO here
  'revelation-surah-muddaththir', // In Mecca
  'revelation-surah-fatiha',      // In Mecca
  'secret-dawah',                 // In Mecca
  'dar-al-arqam',                 // In Mecca — House of al-Arqam
  'public-dawah',                 // In Mecca
  'persecution-early-muslims',    // In Mecca
  'conversion-of-tufayl-ibn-amr', // In Mecca — he came to Prophet
  'islam-of-hamza',               // In Mecca
  // ── Between Abyssinia migrations ─────────────────────────────────────────
  'islam-of-umar',                // In Mecca — not the Prophet's travel
  'boycott-of-banu-hashim',       // In Mecca — no outbound journey
  // ── Year of Sorrow and aftermath ─────────────────────────────────────────
  'death-of-abu-talib',           // In Mecca — Prophet returned from Taif
  'death-of-khadijah',            // In Mecca
  'year-of-sorrow',               // In Mecca — summary event, no travel
  // ── Pre-Hijra final Mecca events ─────────────────────────────────────────
  'quraysh-plot-to-kill-prophet', // In Mecca — plotters' plan, not Prophet's movement
  // ── Arrival in Medina ────────────────────────────────────────────────────
  'arrival-quba',                 // Final steps of Hijrah — map shows hijrah-to-medina route
  'first-friday-prayer',          // At Quba — same location as arrival-quba
  'arrival-medina',               // Short move from Quba already covered by hijrah route
  // ── Building the community in Medina ─────────────────────────────────────
  'building-masjid-nabawi',       // In Medina
  'brotherhood-muhajirun-ansar',  // In Medina
  'constitution-of-medina',       // In Medina
  'adhan-instituted',             // In Medina
  'revelation-surah-baqarah',     // In Medina
  // ── Year 2 AH ────────────────────────────────────────────────────────────
  'change-of-qiblah',             // In Medina — revelation, no travel
  'fasting-ramadan-prescribed',   // In Medina
  'zakat-prescribed',             // In Medina
  'revelation-ayat-al-kursi',     // In Medina
  'death-of-uthman-ibn-mazun',    // In Medina
  // ── Post-Badr events ─────────────────────────────────────────────────────
  'death-of-ruqayyah',            // In Medina — she stayed while Prophet was at Badr
  'expulsion-banu-qaynuqa',       // In Medina — siege action, no outbound journey
  'marriage-fatimah-ali',         // In Medina
  // ── Year 3 AH ────────────────────────────────────────────────────────────
  'birth-of-hasan',               // In Medina
  'martyrdom-of-hamza',           // At Uhud — same battle site as battle-of-uhud
  // ── Year 4 AH ────────────────────────────────────────────────────────────
  'birth-of-husayn',              // In Medina
  'expulsion-banu-nadir',         // In Medina — siege action, no outbound journey
  'prohibition-of-alcohol',       // In Medina — revelation
  // ── Year 5 AH — post Banu Mustaliq ───────────────────────────────────────
  'incident-of-ifk',              // In Medina — revelation, not travel
  'revelation-hijab-verse',       // In Medina — revelation
  'siege-of-banu-qurayza',        // In Medina area — follows battle of trench
  'death-of-sad-ibn-muadh',       // In Medina
  'marriage-to-zaynab',           // In Medina
  // ── Post-Hudaybiyyah ─────────────────────────────────────────────────────
  'bayat-ridwan',                 // At Hudaybiyyah — same location as treaty-of-hudaybiyyah
  'letters-to-kings',             // In Medina — letters drafted and dispatched
  'quraysh-violate-hudaybiyyah',  // Political event — not the Prophet's journey
  // ── Post-Umrah al-Qadiyyah ───────────────────────────────────────────────
  'islam-of-khalid-ibn-walid',    // In Medina — Khalid came TO the Prophet
  // ── Year 9 AH — post-Tabuk ───────────────────────────────────────────────
  'repentance-of-three',          // In Medina — revelation, no travel
  'masjid-al-dirar',              // Near Medina (Quba area)
  'year-of-delegations',          // In Medina — delegations came to the Prophet
  'thaqif-delegation',            // In Medina — Thaqif came to Medina
  // ── After Abu Bakr leads Hajj ────────────────────────────────────────────
  'death-of-negus',               // In Medina — prayer for the Negus of Abyssinia
  'death-of-umm-kulthum',         // In Medina
  // ── Year 10 AH ───────────────────────────────────────────────────────────
  'death-of-ibrahim',             // In Medina — Prophet's infant son
  // ── Farewell Pilgrimage sub-events at Arafat ─────────────────────────────
  'farewell-sermon',              // At Arafat during Hajj — sub-event of farewell-pilgrimage
  'revelation-of-ikmal',          // Revelation at Arafat — same location as farewell-sermon
  'last-revelation',              // Revelation at Arafat / Medina — not a separate journey
  // ── Final events ─────────────────────────────────────────────────────────
  'expedition-of-usamah',         // Medina — army preparing; Prophet stayed
  'final-illness',                // In Medina
  'prophets-last-sermon-in-mosque', // In Medina — Masjid al-Nabawi
  'death-of-prophet',             // In Medina
  'prophet-burial',               // In Medina — same location as death
])

// ── Miraculous journey — drawn in special silver style ───────────────────────
const MIRACULOUS_SLUGS = new Set(['isra-and-miraj'])

// ── Historical routes — precise waypoints from scholarly sources ──────────────
// Each key is the event SLUG of the DESTINATION event.
// Waypoints: [lat, lng][], including origin and destination.

interface RouteData {
  waypoints: [number, number][]
  style?: 'sea' | 'miraculous' | 'pilgrims'
}

const HISTORICAL_ROUTES: Partial<Record<string, RouteData>> = {
  // ── Pre-Hijra journeys ──────────────────────────────────────────────────

  // First journey to Syria with Abu Talib (~582 CE)
  // Mecca → north via the Hejaz trade road → Busra (Bosra), Syria
  'first-journey-to-syria': {
    waypoints: [
      [21.4225, 39.826], // Mecca
      [22.3,   39.6],    // North Hejaz
      [23.7,   39.4],    // Approaching Medina latitude
      [24.47,  39.61],   // Medina area (waypoint, not a stop)
      [26.0,   38.5],    // Al-Hijr region
      [27.5,   37.5],    // Northern Hejaz
      [28.7,   36.5],    // Tabuk area
      [29.6,   35.5],    // Wadi Rum, Jordan
      [30.8,   36.0],    // Southern Jordan
      [32.52,  36.48],   // Busra (Bosra), Syria
    ],
  },

  // Trade journey for Khadijah to Syria (~595 CE)
  'trade-journey-to-syria-for-khadijah': {
    waypoints: [
      [21.4225, 39.826],
      [23.0,   39.6],
      [24.47,  39.61],
      [26.0,   38.5],
      [28.38,  36.58],   // Tabuk
      [29.5,   35.6],
      [30.9,   36.1],
      [32.52,  36.48],
    ],
  },

  // War of Fijar (~590 CE) — young Muhammad traveled from Mecca to Ukaz market near Ta'if
  'war-of-fijar': {
    waypoints: [
      [21.4225, 39.826],  // Mecca
      [21.38,  40.0],     // East of Mecca
      [21.32,  40.2],     // Approaching Ta'if plateau
      [21.3167, 40.3667], // Ukaz, near Ta'if
    ],
  },

  // Hilf al-Fudul (~590 CE) — return from Ukaz to Mecca, pact formed at Abdullah ibn Jud'an's house
  'hilf-al-fudul': {
    waypoints: [
      [21.3167, 40.3667], // Ukaz (returning from War of Fijar)
      [21.35,  40.1],
      [21.4225, 39.826],  // Mecca
    ],
  },

  // Foster care with Halimah (~571 CE) — Mecca to Banu Sa'd territory east of Ta'if
  'foster-care-halimah': {
    waypoints: [
      [21.4225, 39.826],  // Mecca
      [21.38,  40.0],     // East of Mecca
      [21.32,  40.2],     // Approaching Ta'if plateau
      [21.27,  40.4158],  // Banu Sa'd territory, near Ta'if
    ],
  },

  // Journey to Ta'if (~619 CE) — east-southeast of Mecca
  'journey-to-taif': {
    waypoints: [
      [21.4225, 39.826],
      [21.37,  40.0],
      [21.3,   40.22],
      [21.27,  40.42],   // Ta'if
    ],
  },

  // First Migration to Abyssinia (~615 CE) — by sea via Red Sea
  'first-migration-abyssinia': {
    style: 'sea',
    waypoints: [
      [21.4225, 39.826],
      [21.5,   39.17],   // Near Jeddah / port of Shu'aybah
      [20.5,   38.8],    // Red Sea southbound
      [18.0,   40.2],    // Eritrean coast
      [15.5,   39.5],
      [14.13,  38.72],   // Axum (Aksum), Ethiopia
    ],
  },

  // Second Migration to Abyssinia (~616 CE)
  'second-migration-abyssinia': {
    style: 'sea',
    waypoints: [
      [21.4225, 39.826],
      [21.5,   39.17],
      [20.5,   38.8],
      [18.0,   40.2],
      [15.5,   39.5],
      [14.13,  38.72],
    ],
  },

  // Night Journey & Ascension — drawn specially in silver
  // Route stays on land through the Hejaz interior northward to Jerusalem
  'isra-and-miraj': {
    style: 'miraculous',
    waypoints: [
      [21.4225, 39.826],  // Masjid al-Haram, Mecca
      [23.7,   39.5],     // North through Hejaz interior (inland — coast is ~38.3°E here)
      [25.7,   38.9],     // Khaybar / northern Hejaz (coast is ~37.2°E here)
      [27.4,   37.5],     // Northern Hejaz plateau (coast is ~36.0°E here)
      [28.5,   37.0],     // Tabuk region
      [30.0,   36.5],     // Northern Arabia / south Jordan
      [31.0,   36.1],     // Jordan plateau
      [31.7766, 35.2357], // Al-Aqsa Mosque, Jerusalem
    ],
  },

  // ── The Hijrah (622 CE) ─────────────────────────────────────────────────
  // From Mecca → Cave Thawr (3 days) → west to Red Sea coast →
  // north along coastal road → northeast toward Medina via Quba

  'hijrah-to-medina': {
    waypoints: [
      [21.4225, 39.826],  // Mecca
      [21.338,  39.832],  // Cave of Thawr (south of Mecca, 3 days)
      [21.25,   39.55],   // West toward coast
      [21.15,   39.3],    // Near Red Sea coast (east of shoreline)
      [21.5,    39.18],   // Near Jeddah — coastal road north
      [22.0,    39.08],   // Rabigh area — on land
      [22.36,   39.13],   // Qudayd
      [22.79,   39.1],    // Rabigh
      [23.15,   39.22],   // Al-Abwa
      [23.65,   39.45],   // Heading northeast
      [24.0,    39.55],   // Approaching
      [24.44,   39.62],   // Quba — first stop
      [24.4686, 39.6142], // Medina
    ],
  },

  // ── Medinan expeditions & battles ───────────────────────────────────────

  // Battle of Badr (624 CE / 2 AH)
  // Medina → southwest via Wadi al-Safra → Badr wells
  'battle-of-badr': {
    waypoints: [
      [24.4686, 39.6142],
      [24.2,    39.4],
      [23.95,   39.2],
      [23.8,    39.0],
      [23.7281, 38.7744], // Badr
    ],
  },

  // Battle of Uhud (625 CE / 3 AH) — Prophet marched north of Medina
  'battle-of-uhud': {
    waypoints: [
      [24.4686, 39.6142],
      [24.495,  39.605],  // North of Medina
      [24.5122, 39.5986], // Mount Uhud
    ],
  },

  // Battle of Banu al-Mustaliq (627 CE / 5 AH) — coastal expedition
  'battle-of-banu-mustaliq': {
    waypoints: [
      [24.4686, 39.6142],
      [23.8,    39.3],
      [23.0,    39.1],
      [22.4,    39.1],
      [22.1,    39.05],  // Al-Muraysi' (coastal Hejaz)
    ],
  },

  // Battle of the Trench / Khandaq (627 CE / 5 AH) — fought IN Medina
  // Prophet dug the trench north of Medina — no outbound journey
  'battle-of-trench': {
    waypoints: [
      [24.4686, 39.6142],
      [24.515,  39.595],  // Northern Medina (trench site)
    ],
  },

  // Treaty of Hudaybiyyah (628 CE / 6 AH)
  // Medina → south via Usfan route → Hudaybiyyah (just outside Haram)
  'treaty-of-hudaybiyyah': {
    waypoints: [
      [24.4686, 39.6142],
      [23.5,    39.4],
      [22.8,    39.4],
      [21.87,   39.36],  // Usfan
      [21.62,   39.55],
      [21.47,   39.73],  // Hudaybiyyah (Shumaysi area)
    ],
  },

  // Battle of Khaybar (628 CE / 7 AH)
  // Medina → north through Wadi al-Qura → Khaybar (~150km north of Medina)
  'battle-of-khaybar': {
    waypoints: [
      [24.4686, 39.6142],
      [25.0,    39.5],
      [25.4,    39.4],
      [25.6983, 39.2933], // Khaybar
    ],
  },

  // Umrah al-Qadiyyah — Fulfilled Umrah (629 CE / 7 AH)
  // Medina → south to Mecca (via Usfan / Hudaybiyyah road)
  'umrah-al-qadiyyah': {
    waypoints: [
      [24.4686, 39.6142],
      [23.5,    39.4],
      [22.8,    39.4],
      [21.87,   39.36],
      [21.62,   39.6],
      [21.4225, 39.8262], // Mecca
    ],
  },

  // Battle of Mu'tah (629 CE / 8 AH) — far northern expedition to Jordan
  // Medina → north via Hejaz → Wadi Musa → Mu'tah (al-Karak plateau, Jordan)
  'battle-of-mutah': {
    waypoints: [
      [24.4686, 39.6142],
      [25.5,    38.5],
      [26.78,   37.95],  // Mada'in Salih (Hegra)
      [27.5,    37.2],
      [28.7,    36.9],
      [29.6,    35.8],   // Wadi Rum
      [30.5,    35.55],  // Wadi Musa / Petra
      [31.07,   35.71],  // Mu'tah, Jordan
    ],
  },

  // Conquest of Mecca (630 CE / 8 AH)
  // Medina → south via Usfan route → Marr al-Zahran → Mecca
  'conquest-of-mecca': {
    waypoints: [
      [24.4686, 39.6142],
      [23.5,    39.4],
      [22.5,    39.55],
      [21.9,    39.82],  // Marr al-Zahran (Wadi Fatimah)
      [21.56,   39.83],
      [21.4225, 39.8262], // Mecca
    ],
  },

  // Battle of Hunayn (630 CE / 8 AH) — east of Mecca toward Ta'if
  'battle-of-hunayn': {
    waypoints: [
      [21.4225, 39.8262], // Mecca
      [21.37,   39.9],
      [21.33,   40.08],
      [21.32,   40.13],  // Hunayn Valley
    ],
  },

  // Siege of Ta'if (630 CE / 8 AH) — from Hunayn to Ta'if
  'siege-of-taif': {
    waypoints: [
      [21.32,   40.13],  // Hunayn
      [21.29,   40.28],
      [21.27,   40.42],  // Ta'if
    ],
  },

  // Distribution of Hunayn spoils at Ji'ranah (after siege of Ta'if)
  'distribution-hunayn-spoils': {
    waypoints: [
      [21.27,   40.42],   // Ta'if
      [21.32,   40.2],
      [21.38,   40.0],
      [21.4833, 39.9167], // Ji'ranah (near Mecca)
    ],
  },

  // ── People traveling TO the Prophet ─────────────────────────────────────
  // These routes show pilgrims/delegations journeying to Mecca or Medina,
  // not the Prophet himself traveling. Rendered in gold/amber to distinguish.

  // First Pledge of Aqabah (621 CE / 1 BH) — 6 men from Yathrib to Mecca
  'first-pledge-of-aqabah': {
    style: 'pilgrims',
    waypoints: [
      [24.4686, 39.6142], // Yathrib (Medina) — where the men came from
      [23.5,    39.4],
      [22.5,    39.5],
      [21.87,   39.36],   // Usfan area
      [21.43,   39.89],   // Aqabah, near Mina, Mecca
    ],
  } as RouteData,

  // Second Pledge of Aqabah (622 CE) — 73 people from Yathrib to Mecca
  'second-pledge-of-aqabah': {
    style: 'pilgrims',
    waypoints: [
      [24.4686, 39.6142],
      [23.5,    39.4],
      [22.5,    39.5],
      [21.87,   39.36],
      [21.43,   39.89],   // Aqabah, near Mina
    ],
  } as RouteData,

  // Mus'ab ibn Umayr sent to Medina as teacher (1 BH) — Mecca → Medina
  'musab-ibn-umayr-sent-medina': {
    style: 'pilgrims',
    waypoints: [
      [21.4225, 39.826],  // Mecca
      [22.5,    39.5],
      [23.5,    39.4],
      [24.4686, 39.6142], // Medina
    ],
  } as RouteData,

  // Expedition to Tabuk (630 CE / 9 AH) — longest military expedition
  // Medina → north via Wadi al-Qura / Mada'in Salih → Tabuk
  'expedition-of-tabuk': {
    waypoints: [
      [24.4686, 39.6142],
      [25.3,    38.5],
      [26.78,   37.95],  // Mada'in Salih (Hegra)
      [27.4,    37.35],  // Wadi al-Qura
      [27.9,    36.85],  // Al-Ula area
      [28.3833, 36.5833], // Tabuk
    ],
  },

  // Abu Bakr leads Hajj (9 AH) — from Medina to Mecca
  'abu-bakr-leads-hajj': {
    waypoints: [
      [24.4686, 39.6142],
      [23.5,    39.4],
      [22.5,    39.5],
      [21.87,   39.36],
      [21.4225, 39.8262],
    ],
  },

  // Farewell Pilgrimage (632 CE / 10 AH) — Medina to Mecca via standard Hajj route
  'farewell-pilgrimage': {
    waypoints: [
      [24.4686, 39.6142],
      [23.8,    39.4],
      [23.0,    39.3],
      [22.5,    39.5],
      [21.87,   39.36],
      [21.55,   39.7],
      [21.4225, 39.8262], // Mecca
    ],
  },

  // Return of Abyssinian emigrants (7 AH) — sea + land from Ethiopia to Medina
  'return-abyssinia-emigrants': {
    style: 'sea',
    waypoints: [
      [14.13,   38.72],   // Axum
      [15.5,    39.5],
      [18.0,    40.2],
      [20.5,    38.8],
      [21.5,    39.17],   // Near Jeddah
      [21.4225, 39.826],  // Mecca area
      [22.5,    39.5],
      [24.4686, 39.6142], // Medina
    ],
  },
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function hasCoords(
  e: SeerahMapEvent
): e is SeerahMapEvent & { place_lat: number; place_lng: number } {
  return e.place_lat != null && e.place_lng != null
}

/** Quadratic bezier arc curving left of the direction of travel */
function getBezierArc(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  segments = 48
): [number, number][] {
  const dLat = lat2 - lat1
  const dLng = lng2 - lng1
  const dist = Math.sqrt(dLat * dLat + dLng * dLng)
  if (dist < 0.001) return [[lat1, lng1], [lat2, lng2]]

  const midLat = (lat1 + lat2) / 2
  const midLng = (lng1 + lng2) / 2
  const perpLat = (-dLng / dist) * dist * 0.35
  const perpLng = (dLat / dist) * dist * 0.35
  const ctrlLat = midLat + perpLat
  const ctrlLng = midLng + perpLng

  const pts: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const q = 1 - t
    pts.push([
      q * q * lat1 + 2 * q * t * ctrlLat + t * t * lat2,
      q * q * lng1 + 2 * q * t * ctrlLng + t * t * lng2,
    ])
  }
  return pts
}

/** True bearing in degrees (clockwise from north) between two points */
function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const lat1r = (lat1 * Math.PI) / 180
  const lat2r = (lat2 * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2r)
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180) / Math.PI
}

// ── Leaflet icon factories ────────────────────────────────────────────────────

function pulsingIcon(significance: SeerahMapEvent['significance']): L.DivIcon {
  const size = significance === 'major' ? 18 : significance === 'moderate' ? 13 : 9
  return L.divIcon({
    className: '',
    html: `<div class="seerah-pulse" style="width:${size}px;height:${size}px;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function dotIcon(significance: SeerahMapEvent['significance']): L.DivIcon {
  const size = significance === 'major' ? 11 : significance === 'moderate' ? 8 : 6
  const cls = `seerah-dot seerah-dot-${significance}`
  return L.divIcon({
    className: 'seerah-dot-wrap',
    html: `<div class="${cls}" style="width:${size}px;height:${size}px;"></div>`,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  })
}

function arrowIcon(bearing: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg width="18" height="18" viewBox="0 0 18 18" style="transform:rotate(${bearing}deg);display:block;overflow:visible;">
      <polygon points="9,0 17,17 9,12 1,17" fill="${color}" opacity="0.95" stroke="#0D2F17" stroke-width="0.5"/>
    </svg>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const MAP_CSS = `
  @keyframes seerah-pulse-anim {
    0%   { box-shadow: 0 0 0 0 rgba(201,242,122,0.85); }
    70%  { box-shadow: 0 0 0 18px rgba(201,242,122,0); }
    100% { box-shadow: 0 0 0 0 rgba(201,242,122,0); }
  }
  .seerah-pulse {
    border-radius: 50%;
    background: #C9F27A;
    border: 2px solid rgba(255,255,255,0.65);
    animation: seerah-pulse-anim 2.2s ease-out infinite;
  }
  .seerah-popup .leaflet-popup-content-wrapper {
    background: transparent; box-shadow: none; border-radius: 0; padding: 0;
  }
  .seerah-popup .leaflet-popup-content { margin: 0; }
  .seerah-popup .leaflet-popup-tip { background: #0D2F17; }
  .leaflet-control-zoom {
    border: none !important;
    margin: 14px !important;
  }
  .leaflet-control-zoom a {
    background: rgba(13,47,23,0.92) !important;
    color: #C9F27A !important;
    border: 1px solid rgba(121,194,76,0.22) !important;
    border-radius: 6px !important;
    margin-bottom: 2px !important;
    font-size: 16px !important;
    line-height: 26px !important;
    width: 28px !important;
    height: 28px !important;
  }
  .leaflet-control-zoom a:hover {
    background: rgba(30,94,47,0.96) !important;
    border-color: rgba(201,242,122,0.5) !important;
  }
  .leaflet-control-attribution {
    background: rgba(8,15,9,0.65) !important;
    color: rgba(201,242,122,0.35) !important;
    font-size: 10px !important;
    border-radius: 4px 0 0 0 !important;
  }
  .leaflet-control-attribution a { color: rgba(201,242,122,0.55) !important; }
  /* Background event dots */
  .seerah-dot-wrap { display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .seerah-dot {
    border-radius: 50%;
    border: 1px solid rgba(121,194,76,0.3);
    opacity: 0.35;
    transition: opacity 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  }
  .seerah-dot-major    { background: #6aaa3a; }
  .seerah-dot-moderate { background: #4f852c; }
  .seerah-dot-minor    { background: #3a6020; }
  .seerah-dot-wrap:hover .seerah-dot {
    opacity: 0.9;
    transform: scale(1.5);
    box-shadow: 0 0 6px rgba(201,242,122,0.5);
  }
`

// ── Component ─────────────────────────────────────────────────────────────────

export function SeerahMap({ events, activeIndex, onEventClick }: SeerahMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routeGroupRef = useRef<L.LayerGroup | null>(null)
  const dotGroupRef = useRef<L.LayerGroup | null>(null)
  const activeMarkerRef = useRef<L.Marker | null>(null)
  const arrowGroupRef = useRef<L.LayerGroup | null>(null)
  const onEventClickRef = useRef(onEventClick)

  useEffect(() => {
    onEventClickRef.current = onEventClick
  }, [onEventClick])

  // Mount: create map + static background dots
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [23.5, 40.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    })

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    L.control
      .attribution({ position: 'bottomright', prefix: false })
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      )
      .addTo(map)

    // Static dim dots for geographic reference
    const dotGroup = L.layerGroup().addTo(map)
    events.forEach((event, index) => {
      if (!hasCoords(event)) return
      const marker = L.marker([event.place_lat!, event.place_lng!], {
        icon: dotIcon(event.significance),
        zIndexOffset: -200,
      })
      marker.on('click', () => onEventClickRef.current?.(index))
      marker.addTo(dotGroup)
    })

    const routeGroup = L.layerGroup().addTo(map)
    const arrowGroup = L.layerGroup().addTo(map)

    dotGroupRef.current = dotGroup
    routeGroupRef.current = routeGroup
    arrowGroupRef.current = arrowGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redraw routes + active marker on activeIndex change
  useEffect(() => {
    const map = mapInstanceRef.current
    const routeGroup = routeGroupRef.current
    const arrowGroup = arrowGroupRef.current
    if (!map || !routeGroup || !arrowGroup) return

    routeGroup.clearLayers()
    arrowGroup.clearLayers()
    activeMarkerRef.current?.remove()
    activeMarkerRef.current = null

    for (let i = 1; i <= activeIndex; i++) {
      const from = events[i - 1]
      const to = events[i]
      const isCurrent = i === activeIndex

      // Skip explicitly non-travel events
      if (NON_TRAVEL_SLUGS.has(to.slug)) continue

      // Need coordinates
      if (!hasCoords(from) || !hasCoords(to)) continue

      // Skip same or very close locations
      const distDeg = Math.sqrt(
        (to.place_lat - from.place_lat) ** 2 + (to.place_lng - from.place_lng) ** 2
      )
      if (distDeg < 0.03) continue

      const isMiraculous = MIRACULOUS_SLUGS.has(to.slug)
      const historical = HISTORICAL_ROUTES[to.slug]
      const isSea = historical?.style === 'sea'
      const isPilgrims = historical?.style === 'pilgrims'

      // Get route points
      let pts: [number, number][]
      if (historical) {
        pts = historical.waypoints
      } else {
        pts = getBezierArc(from.place_lat, from.place_lng, to.place_lat, to.place_lng)
      }

      // Draw polyline
      let color: string
      let weight: number
      let opacity: number
      let dashArray: string | undefined

      if (isMiraculous) {
        color = isCurrent ? '#d4d4ff' : '#8080cc'
        weight = isCurrent ? 2 : 1
        opacity = isCurrent ? 0.85 : 0.18
        dashArray = '6 5'
      } else if (isSea) {
        color = isCurrent ? '#7aeaff' : '#3a7a8a'
        weight = isCurrent ? 2 : 1
        opacity = isCurrent ? 0.8 : 0.18
        dashArray = isCurrent ? '8 4' : '4 8'
      } else if (isPilgrims) {
        // Gold/amber — people traveling TO the Prophet ﷺ
        color = isCurrent ? '#f5c842' : '#8a7020'
        weight = isCurrent ? 2 : 1
        opacity = isCurrent ? 0.82 : 0.18
        dashArray = isCurrent ? '7 4' : '4 8'
      } else if (isCurrent) {
        color = '#C9F27A'
        weight = 2.5
        opacity = 0.92
        dashArray = undefined
      } else {
        color = '#5a9a35'
        weight = 1
        opacity = 0.2
        dashArray = '3 7'
      }

      L.polyline(pts, { color, weight, opacity, dashArray, lineCap: 'round', lineJoin: 'round' }).addTo(
        routeGroup
      )

      // Directional arrow at tip of current arc
      if (isCurrent && pts.length >= 2) {
        const n = pts.length
        const p1 = pts[Math.max(0, n - 5)]
        const p2 = pts[n - 1]
        const bearing = getBearing(p1[0], p1[1], p2[0], p2[1])
        const arrowColor = isMiraculous ? '#d4d4ff' : isSea ? '#7aeaff' : isPilgrims ? '#f5c842' : '#C9F27A'
        L.marker(p2, { icon: arrowIcon(bearing, arrowColor), zIndexOffset: 300 }).addTo(
          arrowGroup
        )
      }
    }

    // Pulsing active event marker
    const active = events[activeIndex]
    if (hasCoords(active)) {
      const prev = activeIndex > 0 ? events[activeIndex - 1] : null
      const prevLat = prev && hasCoords(prev) ? prev.place_lat : null
      const prevLng = prev && hasCoords(prev) ? prev.place_lng : null

      const zoom = NON_TRAVEL_SLUGS.has(active.slug)
        ? isNearHolyCity(active.place_lat, active.place_lng)
          ? 12
          : 10
        : getSmartZoom(active.place_lat, active.place_lng, prevLat, prevLng)

      // Build Hijri date label for popup
    const popupDate = active.date_ah
      ? active.date_ah
      : active.year_ah != null
        ? active.year_ah < 0
          ? `${Math.abs(active.year_ah)} BH`
          : `${active.year_ah} AH`
        : active.date_ce ?? ''

      const popupHtml = `
        <div style="background:#0D2F17;color:#f0fce8;padding:10px 14px;border-radius:10px;border:1px solid rgba(121,194,76,0.25);min-width:160px;max-width:230px;">
          <div style="font-weight:700;font-size:13px;line-height:1.3;margin-bottom:4px;">${active.title_en}</div>
          ${active.title_ar ? `<div style="font-size:15px;text-align:right;color:rgba(201,242,122,0.7);margin-bottom:4px;" dir="rtl">${active.title_ar}</div>` : ''}
          ${active.place_name ? `<div style="color:rgba(201,242,122,0.55);font-size:11px;">📍 ${active.place_name}</div>` : ''}
          ${popupDate ? `<div style="color:rgba(201,242,122,0.65);font-size:11px;margin-top:3px;">${popupDate}</div>` : ''}
        </div>`

      const marker = L.marker([active.place_lat, active.place_lng], {
        icon: pulsingIcon(active.significance),
        zIndexOffset: 1000,
      })
      marker.bindPopup(popupHtml, {
        className: 'seerah-popup',
        closeButton: false,
        offset: [0, -10],
      })
      marker.addTo(map)
      activeMarkerRef.current = marker

      // For travel events with a known historical route, fit the entire path in view.
      // For non-travel or short local events, fly to the event location.
      const activeHistorical = HISTORICAL_ROUTES[active.slug]
      if (!NON_TRAVEL_SLUGS.has(active.slug) && activeHistorical && activeHistorical.waypoints.length >= 2) {
        const bounds = L.latLngBounds(activeHistorical.waypoints)
        map.flyToBounds(bounds, {
          paddingTopLeft: [60, 60],
          paddingBottomRight: [60, 60],
          maxZoom: 12,
          duration: 1.4,
        })
      } else {
        map.flyTo([active.place_lat, active.place_lng], zoom, { duration: 1.4 })
      }
    }
  }, [activeIndex, events])

  return (
    <>
      <style>{MAP_CSS}</style>
      <div ref={mapRef} className="h-full w-full" />
    </>
  )
}
