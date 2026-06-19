import { useState, useEffect } from 'react'
import { RiFilterLine, RiMapPin2Line, RiCloseLine } from 'react-icons/ri'
import api from '../services/api'
import CarteLeaflet from '../components/carte/CarteLeaflet'
import PanneauFiltres from '../components/carte/PanneauFiltres'
import PanneauTrajets from '../components/carte/PanneauTrajets'

export default function Carte() {
  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ statuts: [], chauffeurId: null, mois: null })
  const [mobilePanel, setMobilePanel] = useState(null) // 'filtres' | 'trajets' | null

  useEffect(() => {
    const params = {}
    if (filters.statuts?.length)  params.statut      = filters.statuts
    if (filters.chauffeurId)      params.chauffeurId  = filters.chauffeurId
    if (filters.mois)             params.mois         = filters.mois

    setLoading(true)
    api.get('/carte/trajets', { params })
      .then(({ data }) => setTrajets(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  const mapHeight = 'calc(100vh - 5rem)'

  return (
    <div style={{ height: mapHeight }}>
      {/* ── Desktop : 3 colonnes ─────────────────────────────────── */}
      <div className="hidden md:flex gap-3 h-full">
        <div className="w-52 shrink-0 overflow-y-auto space-y-3">
          <PanneauFiltres filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm isolate">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
            </div>
          )}
          <CarteLeaflet trajets={trajets} />
        </div>

        <div className="w-60 shrink-0 overflow-y-auto">
          <PanneauTrajets trajets={trajets} />
        </div>
      </div>

      {/* ── Mobile : carte plein écran + boutons flottants ────────── */}
      <div className="md:hidden relative h-full rounded-xl overflow-hidden shadow-sm isolate">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
          </div>
        )}
        <CarteLeaflet trajets={trajets} />

        {/* Boutons toggle */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <button
            onClick={() => setMobilePanel(p => p === 'filtres' ? null : 'filtres')}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm rounded-full shadow-lg"
          >
            <RiFilterLine /> Filtres
          </button>
          <button
            onClick={() => setMobilePanel(p => p === 'trajets' ? null : 'trajets')}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm rounded-full shadow-lg"
          >
            <RiMapPin2Line /> Trajets ({trajets.length})
          </button>
        </div>

        {/* Panneau filtres — slide depuis gauche */}
        {mobilePanel === 'filtres' && (
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl z-30 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-medium text-gray-800">Filtres</span>
              <button onClick={() => setMobilePanel(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <PanneauFiltres filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        {/* Panneau trajets — slide depuis droite */}
        {mobilePanel === 'trajets' && (
          <div className="absolute inset-y-0 right-0 w-64 bg-white shadow-xl z-30 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-medium text-gray-800">Trajets actifs</span>
              <button onClick={() => setMobilePanel(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <div className="p-3">
              <PanneauTrajets trajets={trajets} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
