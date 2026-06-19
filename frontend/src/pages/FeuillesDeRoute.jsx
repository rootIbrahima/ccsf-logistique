import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiAddLine, RiFileList3Line } from 'react-icons/ri'
import api from '../services/api'
import Pagination from '../components/shared/Pagination'
import { usePagination } from '../hooks/usePagination'

const statutBadge = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ROUTE:   'bg-blue-100 text-blue-700',
  LIVRE:      'bg-green-100 text-green-700',
  ANNULE:     'bg-red-100 text-red-700'
}

export default function FeuillesDeRoute() {
  const [feuilles, setFeuilles] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState('')
  const [filterMois, setFilterMois] = useState('')
  const { page, limit, goToPage, reset } = usePagination()

  useEffect(() => { reset() }, [filterStatut, filterMois])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (filterStatut) params.statut = filterStatut
    if (filterMois)   params.mois   = filterMois

    api.get('/feuilles-de-route', { params })
      .then(({ data }) => { setFeuilles(data.data); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, limit, filterStatut, filterMois])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_ROUTE">En route</option>
            <option value="LIVRE">Livré</option>
            <option value="ANNULE">Annulé</option>
          </select>
          <input
            type="month"
            value={filterMois}
            onChange={e => setFilterMois(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Link
          to="/feuilles-de-route/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <RiAddLine className="text-lg" />
          Nouvelle feuille
        </Link>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">N° Feuille</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Chauffeur</th>
                  <th className="px-4 py-3 text-left font-medium">Véhicule</th>
                  <th className="px-4 py-3 text-left font-medium">Produit</th>
                  <th className="px-4 py-3 text-left font-medium">Destination</th>
                  <th className="px-4 py-3 text-center font-medium">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feuilles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      <RiFileList3Line className="text-4xl mx-auto mb-2 opacity-30" />
                      Aucune feuille de route
                    </td>
                  </tr>
                )}
                {feuilles.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{f.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(f.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 font-medium">{f.chauffeur?.nom} {f.chauffeur?.prenom}</td>
                    <td className="px-4 py-3 text-gray-600">{f.vehicule?.immatriculation}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{f.produit}</td>
                    <td className="px-4 py-3 text-gray-600">{f.destination?.nom}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[f.statut]}`}>
                        {f.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/feuilles-de-route/${f.id}`}
                        className="text-accent hover:underline text-xs font-medium"
                      >
                        Détail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {meta && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>{meta.total} feuille{meta.total > 1 ? 's' : ''}</span>
                <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={goToPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
