import { useEffect, useRef, useState } from 'react'

const DAKAR = [14.6937, -17.4441]

const COULEUR_STATUT = {
  EN_ATTENTE: '#d97706',
  EN_ROUTE:   '#3b82f6',
  LIVRE:      '#16a34a',
  ANNULE:     '#dc2626'
}

function makeMarkerHtml(color, size = 14) {
  return `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border:2.5px solid white;
    border-radius:50%;
    box-shadow:0 1px 6px rgba(0,0,0,.5);
  "></div>`
}

export default function CarteLeaflet({ trajets }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const markersRef    = useRef([])
  const [leafletReady, setLeafletReady] = useState(!!window.L)
  const [error, setError]               = useState(null)

  // Attendre que Leaflet soit disponible si chargé en async
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return }

    let tries = 0
    const id = setInterval(() => {
      tries++
      if (window.L) { setLeafletReady(true); clearInterval(id) }
      if (tries > 30) { clearInterval(id); setError('Leaflet CDN non chargé — vérifie ta connexion internet') }
    }, 200)

    return () => clearInterval(id)
  }, [])

  // Initialiser la carte
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return

    const L = window.L
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true })
    map.setView(DAKAR, 7)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    // Marqueur Dakar
    L.marker(DAKAR, {
      icon: L.divIcon({ html: makeMarkerHtml('#0D1B3E', 16), className: '', iconSize: [16, 16], iconAnchor: [8, 8] })
    }).addTo(map).bindPopup('<b>DAKAR</b> — Départ')

    // Forcer le recalcul après le premier paint
    requestAnimationFrame(() => { map.invalidateSize() })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [leafletReady])

  // Mettre à jour les trajets
  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.L) return
    const L = window.L

    markersRef.current.forEach(l => map.removeLayer(l))
    markersRef.current = []

    for (const t of trajets) {
      if (!t.destination?.latitude) continue

      const destLL = [t.destination.latitude, t.destination.longitude]
      const color  = COULEUR_STATUT[t.statut] || '#6b7280'

      const polyline = L.polyline([DAKAR, destLL], {
        color, weight: 2.5, opacity: 0.75,
        dashArray: t.statut === 'EN_ROUTE' ? null : '6,5'
      }).addTo(map)

      const icon = L.divIcon({
        html: makeMarkerHtml(color),
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })

      const popup = `<div style="font-size:13px;line-height:1.5;min-width:180px">
        <b style="color:#0D1B3E">${t.numero}</b><br>
        ${t.chauffeur?.nom ?? ''} ${t.chauffeur?.prenom ?? ''}<br>
        <b>${t.destination?.nom}</b> · ${t.destination?.distanceDakar} km<br>
        ${t.produit} · ${t.quantiteTonnes} T<br>
        <span style="display:inline-block;margin-top:3px;padding:1px 8px;border-radius:999px;background:${color};color:white;font-size:11px">
          ${t.statut.replace('_', ' ')}
        </span>
      </div>`

      const marker = L.marker(destLL, { icon }).addTo(map).bindPopup(popup)
      markersRef.current.push(polyline, marker)
    }
  }, [trajets, leafletReady])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-red-500 text-sm text-center px-4">{error}</p>
      </div>
    )
  }

  if (!leafletReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
      className="rounded-xl"
    />
  )
}
