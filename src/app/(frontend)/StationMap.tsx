'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import type { CircleMarker, Map as LeafletMap } from 'leaflet'

type Station = {
  address: string
  id: string
  latitude: number
  longitude: number
  municipality: string
  name: string
  postalCode: string
  prices: {
    dieselA: number | null
    gasoline95: number | null
    gasoline98: number | null
  }
  schedule: string
}

const priceFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
})

function displayPrice(price: number | null) {
  return price === null ? '—' : `${priceFormatter.format(price)} €/L`
}

export default function StationMap() {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef(new Map<string, CircleMarker>())
  const userMarkerRef = useRef<CircleMarker | null>(null)
  const stationsRef = useRef<Station[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [visibleStations, setVisibleStations] = useState<Station[]>([])
  const [query, setQuery] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return

    let active = true
    let map: LeafletMap | null = null

    const initialize = async () => {
      const L = await import('leaflet')
      if (!active || !mapElement.current) return

      map = L.map(mapElement.current, {
        center: [40.4168, -3.7038],
        preferCanvas: true,
        scrollWheelZoom: true,
        zoom: 11,
        zoomControl: false,
      })
      mapRef.current = map

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      const updateVisibleStations = () => {
        if (!map) return
        const bounds = map.getBounds()
        const center = map.getCenter()
        const stationsInBounds = stationsRef.current
          .filter((station) => bounds.contains([station.latitude, station.longitude]))
          .sort(
            (first, second) =>
              map!.distance(center, [first.latitude, first.longitude]) -
              map!.distance(center, [second.latitude, second.longitude]),
          )

        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current.clear()

        stationsInBounds.slice(0, 250).forEach((station) => {
          const marker = L.circleMarker([station.latitude, station.longitude], {
            color: '#ffffff',
            fillColor: '#035141',
            fillOpacity: 0.95,
            radius: 7,
            weight: 2,
          })

          const popup = document.createElement('div')
          popup.className = 'station-popup'
          const title = document.createElement('strong')
          title.textContent = station.name
          const address = document.createElement('span')
          address.textContent = `${station.address}, ${station.municipality}`
          const price = document.createElement('b')
          price.textContent = `Gasolina 95 · ${displayPrice(station.prices.gasoline95)}`
          popup.append(title, address, price)

          marker.bindPopup(popup)
          marker.addTo(map!)
          markersRef.current.set(station.id, marker)
        })

        setVisibleStations(stationsInBounds.slice(0, 40))
      }

      map.on('moveend zoomend', updateVisibleStations)

      try {
        const response = await fetch('/api/stations')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        if (!active || !map) return

        const officialStations = result.stations as Station[]
        stationsRef.current = officialStations
        setStations(officialStations)
        setUpdatedAt(result.updatedAt)

        updateVisibleStations()
      } catch {
        setError('No se han podido cargar las estaciones oficiales. Inténtalo de nuevo más tarde.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void initialize()

    return () => {
      active = false
      map?.remove()
      mapRef.current = null
      markersRef.current.clear()
      userMarkerRef.current = null
    }
  }, [])

  const focusStation = (station: Station) => {
    mapRef.current?.flyTo([station.latitude, station.longitude], 16, { duration: 0.8 })
    window.setTimeout(() => markersRef.current.get(station.id)?.openPopup(), 850)
  }

  const search = (event: FormEvent) => {
    event.preventDefault()
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    if (!normalizedQuery) return

    const match = stations.find((station) =>
      `${station.name} ${station.address} ${station.municipality} ${station.postalCode}`
        .toLocaleLowerCase('es')
        .includes(normalizedQuery),
    )

    if (match) {
      setError('')
      focusStation(match)
    } else {
      setError('No se ha encontrado ninguna estación con esa búsqueda en España.')
    }
  }

  const locateUser = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite usar la ubicación.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setError('')
        const L = await import('leaflet')
        userMarkerRef.current?.remove()
        if (mapRef.current) {
          userMarkerRef.current = L.circleMarker([coords.latitude, coords.longitude], {
            color: '#035141',
            fillColor: '#fcda2f',
            fillOpacity: 1,
            radius: 9,
            weight: 3,
          })
            .bindTooltip('Tu ubicación')
            .addTo(mapRef.current)
        }
        mapRef.current?.flyTo([coords.latitude, coords.longitude], 14, { duration: 0.8 })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('No hemos podido acceder a tu ubicación. Revisa los permisos del navegador.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <section className="real-station-layout">
      <div className="real-map-shell">
        <div ref={mapElement} className="real-map" aria-label="Mapa interactivo de estaciones de servicio en España" />
        <form className="map-search" onSubmit={search}>
          <div>
            <small>Buscar en España</small>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Municipio, calle, código postal…" />
          </div>
          <button type="submit">Buscar</button>
        </form>
        <button className="map-locate" type="button" onClick={locateUser} disabled={locating}>
          {locating ? 'Localizando…' : 'Mi ubicación'}
        </button>
        {loading && <div className="map-loading">Cargando estaciones oficiales…</div>}
      </div>

      <aside className="real-station-list">
        <div className="station-list-heading">
          <div>
            <span className="eyebrow">Datos oficiales</span>
            <h2>Estaciones en esta zona</h2>
          </div>
          <strong>{visibleStations.length}<small> visibles</small></strong>
        </div>

        {error && <p className="map-error" role="alert">{error}</p>}
        <div className="station-results">
          {visibleStations.map((station) => (
            <button type="button" className="official-station-card" key={station.id} onClick={() => focusStation(station)}>
              <div>
                <span>{station.municipality}</span>
                <h3>{station.name}</h3>
                <p>{station.address}</p>
                <small>{station.schedule}</small>
              </div>
              <div className="station-prices">
                <span><small>Gasolina 95</small><strong>{displayPrice(station.prices.gasoline95)}</strong></span>
                <span><small>Diésel A</small><strong>{displayPrice(station.prices.dieselA)}</strong></span>
              </div>
            </button>
          ))}
          {!loading && !error && visibleStations.length === 0 && (
            <div className="map-empty"><h3>Mueve el mapa</h3><p>Acércate a otra zona de España para descubrir sus estaciones.</p></div>
          )}
        </div>

        <div className="station-data-source">
          <span>Actualización oficial: {updatedAt || 'consultando…'}</span>
          <a href="https://geoportalgasolineras.es/geoportal-instalaciones/Inicio" target="_blank" rel="noreferrer">Fuente: Geoportal de Gasolineras ↗</a>
        </div>
      </aside>
    </section>
  )
}
