'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface RashidunMapEvent {
  id: number
  slug: string
  title_en: string
  title_ar?: string
  year_ah: number
  date_display: string
  caliphate: 'abu-bakr' | 'umar' | 'uthman' | 'ali'
  caliph_en: string
  section: 'riddah' | 'conquest' | 'fitna'
  significance: 'major' | 'moderate' | 'minor'
  place_name?: string | null
  place_lat?: number | null
  place_lng?: number | null
  description_en?: string
  muslim_commander?: string | null
  opponent?: string | null
  outcome?: string | null
  sources?: string[]
}

interface RashidunMapProps {
  events: RashidunMapEvent[]
  activeIndex: number
  onEventClick?: (index: number) => void
}

// ── Caliphate marker colours ──────────────────────────────────────────────────

function getCaliphateColor(event: RashidunMapEvent): { bg: string; pulse: string } {
  if (event.section === 'fitna') {
    return { bg: '#e07b30', pulse: 'rgba(224,123,48,' }
  }
  if (event.section === 'riddah') {
    return { bg: '#c94040', pulse: 'rgba(201,64,64,' }
  }
  switch (event.caliphate) {
    case 'abu-bakr': return { bg: '#D4AF37', pulse: 'rgba(212,175,55,' }
    case 'umar':     return { bg: '#C8950A', pulse: 'rgba(200,149,10,' }
    case 'uthman':   return { bg: '#9A6E1A', pulse: 'rgba(154,110,26,' }
    case 'ali':      return { bg: '#7A5010', pulse: 'rgba(122,80,16,' }
    default:         return { bg: '#D4AF37', pulse: 'rgba(212,175,55,' }
  }
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function hasCoords(
  e: RashidunMapEvent
): e is RashidunMapEvent & { place_lat: number; place_lng: number } {
  return e.place_lat != null && e.place_lng != null
}

function getSmartZoom(
  toLat: number,
  toLng: number,
  fromLat: number | null,
  fromLng: number | null
): number {
  if (fromLat == null || fromLng == null) return 7

  const distKm =
    Math.sqrt((toLat - fromLat) ** 2 + (toLng - fromLng) ** 2) * 111

  if (distKm < 20)  return 10
  if (distKm < 100) return 8
  if (distKm < 300) return 7
  if (distKm < 800) return 6
  return 5
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
  const perpLat = (-dLng / dist) * dist * 0.3
  const perpLng = (dLat / dist) * dist * 0.3
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

// ── Events that are in-place (no travel arc to previous event) ────────────────

const NON_TRAVEL_SLUGS = new Set([
  'uthmanic-codex',
  'assassination-of-umar',
  'assassination-of-uthman',
  'assassination-of-ali',
  'founding-of-kufa',
  'founding-of-basra',
])

// ── Naval events (drawn with dashed sea style) ────────────────────────────────

const NAVAL_SLUGS = new Set([
  'conquest-of-cyprus',
  'battle-of-the-masts',
])

// ── Leaflet icon factories ────────────────────────────────────────────────────

function pulsingIcon(event: RashidunMapEvent): L.DivIcon {
  const size = event.significance === 'major' ? 18 : event.significance === 'moderate' ? 13 : 9
  const { bg, pulse } = getCaliphateColor(event)
  return L.divIcon({
    className: '',
    html: `<div class="rashidun-pulse" style="width:${size}px;height:${size}px;background:${bg};--pulse-color:${pulse});" data-sig="${event.significance}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function dotIcon(event: RashidunMapEvent): L.DivIcon {
  const size = event.significance === 'major' ? 11 : event.significance === 'moderate' ? 8 : 6
  const { bg } = getCaliphateColor(event)
  return L.divIcon({
    className: 'rashidun-dot-wrap',
    html: `<div class="rashidun-dot" style="width:${size}px;height:${size}px;background:${bg};"></div>`,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  })
}

function arrowIcon(bearing: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg width="18" height="18" viewBox="0 0 18 18" style="transform:rotate(${bearing}deg);display:block;overflow:visible;">
      <polygon points="9,0 17,17 9,12 1,17" fill="${color}" opacity="0.95" stroke="#2A1A00" stroke-width="0.5"/>
    </svg>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const MAP_CSS = `
  @keyframes rashidun-pulse-anim {
    0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.85); }
    70%  { box-shadow: 0 0 0 18px rgba(212,175,55,0); }
    100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
  }
  .rashidun-pulse {
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.55);
    animation: rashidun-pulse-anim 2.2s ease-out infinite;
  }
  .rashidun-popup .leaflet-popup-content-wrapper {
    background: transparent; box-shadow: none; border-radius: 0; padding: 0;
  }
  .rashidun-popup .leaflet-popup-content { margin: 0; }
  .rashidun-popup .leaflet-popup-tip { background: #2A1A00; }
  .leaflet-control-zoom {
    border: none !important;
    margin: 14px !important;
  }
  .leaflet-control-zoom a {
    background: rgba(42,26,0,0.92) !important;
    color: #D4AF37 !important;
    border: 1px solid rgba(212,175,55,0.22) !important;
    border-radius: 6px !important;
    margin-bottom: 2px !important;
    font-size: 16px !important;
    line-height: 26px !important;
    width: 28px !important;
    height: 28px !important;
  }
  .leaflet-control-zoom a:hover {
    background: rgba(80,50,0,0.96) !important;
    border-color: rgba(212,175,55,0.5) !important;
  }
  .leaflet-control-attribution {
    background: rgba(8,6,0,0.65) !important;
    color: rgba(212,175,55,0.35) !important;
    font-size: 10px !important;
    border-radius: 4px 0 0 0 !important;
  }
  .leaflet-control-attribution a { color: rgba(212,175,55,0.55) !important; }
  .rashidun-dot-wrap { display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .rashidun-dot {
    border-radius: 50%;
    border: 1px solid rgba(212,175,55,0.3);
    opacity: 0.35;
    transition: opacity 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  }
  .rashidun-dot-wrap:hover .rashidun-dot {
    opacity: 0.9;
    transform: scale(1.5);
    box-shadow: 0 0 6px rgba(212,175,55,0.5);
  }
`

// ── Component ─────────────────────────────────────────────────────────────────

export function RashidunMap({ events, activeIndex, onEventClick }: RashidunMapProps) {
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
      center: [28.0, 42.0],
      zoom: 5,
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
        icon: dotIcon(event),
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

      if (NON_TRAVEL_SLUGS.has(to.slug)) continue
      if (!hasCoords(from) || !hasCoords(to)) continue

      const distDeg = Math.sqrt(
        (to.place_lat - from.place_lat) ** 2 + (to.place_lng - from.place_lng) ** 2
      )
      if (distDeg < 0.03) continue

      const isNaval = NAVAL_SLUGS.has(to.slug)
      const isFitna = to.section === 'fitna'
      const pts = getBezierArc(from.place_lat, from.place_lng, to.place_lat, to.place_lng)

      let color: string
      let weight: number
      let opacity: number
      let dashArray: string | undefined

      if (isNaval) {
        color = isCurrent ? '#7aeaff' : '#3a6a7a'
        weight = isCurrent ? 2 : 1
        opacity = isCurrent ? 0.82 : 0.18
        dashArray = isCurrent ? '8 4' : '4 8'
      } else if (isFitna) {
        color = isCurrent ? '#e07b30' : '#6a3510'
        weight = isCurrent ? 2.5 : 1
        opacity = isCurrent ? 0.88 : 0.18
        dashArray = isCurrent ? '6 4' : '3 8'
      } else if (isCurrent) {
        const { bg } = getCaliphateColor(to)
        color = bg
        weight = 2.5
        opacity = 0.92
        dashArray = undefined
      } else {
        color = '#8B6914'
        weight = 1
        opacity = 0.2
        dashArray = '3 7'
      }

      L.polyline(pts, { color, weight, opacity, dashArray, lineCap: 'round', lineJoin: 'round' }).addTo(
        routeGroup
      )

      if (isCurrent && pts.length >= 2) {
        const n = pts.length
        const p1 = pts[Math.max(0, n - 5)]
        const p2 = pts[n - 1]
        const bearing = getBearing(p1[0], p1[1], p2[0], p2[1])
        const arrowColor = isNaval ? '#7aeaff' : isFitna ? '#e07b30' : getCaliphateColor(to).bg
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
        ? 9
        : getSmartZoom(active.place_lat, active.place_lng, prevLat, prevLng)

      const { bg } = getCaliphateColor(active)

      const outcomeLabel =
        active.outcome === 'muslim_victory' ? '✓ Muslim Victory' :
        active.outcome === 'muslim_defeat'  ? '✗ Muslim Defeat' :
        active.outcome === 'martyrdom'      ? '☆ Martyrdom' :
        active.outcome === 'treaty'         ? '⚑ Treaty' :
        active.outcome === 'administrative' ? '⊕ Administrative' :
        active.outcome === 'inconclusive'   ? '~ Inconclusive' :
        active.outcome === 'ali_victory'    ? '✓ Ali Victory' :
        ''

      const popupHtml = `
        <div style="background:#1C1100;color:#f5e6c0;padding:10px 14px;border-radius:10px;border:1px solid rgba(212,175,55,0.3);min-width:160px;max-width:240px;">
          <div style="font-weight:700;font-size:13px;line-height:1.3;margin-bottom:4px;">${active.title_en}</div>
          ${active.title_ar ? `<div style="font-size:15px;text-align:right;color:rgba(212,175,55,0.7);margin-bottom:4px;" dir="rtl">${active.title_ar}</div>` : ''}
          ${active.place_name ? `<div style="color:rgba(212,175,55,0.55);font-size:11px;">📍 ${active.place_name}</div>` : ''}
          <div style="color:rgba(212,175,55,0.65);font-size:11px;margin-top:3px;">${active.date_display}</div>
          ${outcomeLabel ? `<div style="color:${bg};font-size:10px;margin-top:3px;font-weight:600;">${outcomeLabel}</div>` : ''}
          ${active.muslim_commander ? `<div style="color:rgba(245,230,192,0.55);font-size:10px;margin-top:2px;">Cmd: ${active.muslim_commander}</div>` : ''}
        </div>`

      const marker = L.marker([active.place_lat, active.place_lng], {
        icon: pulsingIcon(active),
        zIndexOffset: 1000,
      })
      marker.bindPopup(popupHtml, {
        className: 'rashidun-popup',
        closeButton: false,
        offset: [0, -10],
      })
      marker.addTo(map)
      activeMarkerRef.current = marker

      map.flyTo([active.place_lat, active.place_lng], zoom, { duration: 1.4 })
    }
  }, [activeIndex, events])

  return (
    <>
      <style>{MAP_CSS}</style>
      <div ref={mapRef} className="h-full w-full" />
    </>
  )
}
