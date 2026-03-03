'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface SeerahMapEvent {
  id: number
  slug: string
  title_en: string
  place_name?: string
  place_lat?: number
  place_lng?: number
  significance: 'major' | 'moderate' | 'minor'
}

interface SeerahMapProps {
  events: SeerahMapEvent[]
}

const SIGNIFICANCE_COLORS: Record<SeerahMapEvent['significance'], string> = {
  major: '#C9F27A',
  moderate: '#79C24C',
  minor: '#1E5E2F',
}

const SIGNIFICANCE_RADIUS: Record<SeerahMapEvent['significance'], number> = {
  major: 10,
  moderate: 7,
  minor: 5,
}

export function SeerahMap({ events }: SeerahMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [24.0, 42.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Add attribution in a less intrusive way
    L.control
      .attribution({ position: 'bottomright', prefix: false })
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#79C24C">OSM</a> &copy; <a href="https://carto.com/" style="color:#79C24C">CARTO</a>'
      )
      .addTo(map)

    // Place markers for events with coordinates
    for (const event of events) {
      if (event.place_lat == null || event.place_lng == null) continue

      const color = SIGNIFICANCE_COLORS[event.significance]
      const radius = SIGNIFICANCE_RADIUS[event.significance]

      const marker = L.circleMarker([event.place_lat, event.place_lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
        opacity: 0.9,
      }).addTo(map)

      const placeLine = event.place_name
        ? `<div style="color:rgba(201,242,122,0.6);font-size:12px;margin-top:2px;">${event.place_name}</div>`
        : ''

      marker.bindPopup(
        `<div style="background:#0D2F17;color:#f0fce8;padding:8px 12px;border-radius:8px;border:1px solid rgba(121,194,76,0.2);min-width:160px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${event.title_en}</div>
          ${placeLine}
          <a href="/seerah/${event.slug}" style="display:inline-block;margin-top:6px;color:#C9F27A;font-size:12px;text-decoration:none;">
            Read more &rarr;
          </a>
        </div>`,
        {
          className: 'seerah-popup',
          closeButton: false,
          offset: [0, -4],
        }
      )
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [events])

  return (
    <>
      <style>{`
        .seerah-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
        }
        .seerah-popup .leaflet-popup-content {
          margin: 0;
        }
        .seerah-popup .leaflet-popup-tip {
          background: #0D2F17;
          border: 1px solid rgba(121,194,76,0.2);
          border-top: none;
          border-left: none;
        }
      `}</style>
      <div
        ref={mapRef}
        className="z-0 h-96 rounded-xl border border-iw-border"
      />
    </>
  )
}
