import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiAddLine, RiSearchLine, RiTruckLine, RiUserLine, RiEditLine, RiDeleteBinLine, RiFileList3Line } from 'react-icons/ri'
import api from '../services/api'
import Pagination from '../components/shared/Pagination'
import { usePagination } from '../hooks/usePagination'
import { useDebounce } from '../hooks/useDebounce'

const statutBadge = {
  DISPONIBLE:  'bg-green-100 text-green-700',
  EN_MISSION:  'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700'
}

export default function ListeVehicules() {
  const [vehicules, setVehicules] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const debouncedSearch = useDebounce(search)
  const { page, limit, goToPage, reset } = usePagination()
  const navigate = useNavigate()

  // Modal suppression
  const [deletingVehicule, setDeletingVehicule] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { reset() }, [debouncedSearch, filterStatut])

  function load() {
    setLoading(true)
    const params = { page, limit }
    if (debouncedSearch) params.search = debouncedSearch
    if (filterStatut) params.statut = filterStatut

    api.get('/vehicules', { params })
      .then(({ data }) => { setVehicules(data.data); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, limit, debouncedSearch, filterStatut])

  async function handleDelete() {
    if (!deletingVehicule) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/vehicules/${deletingVehicule.id}`)
      setDeletingVehicule(null)
      load()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">

      {/* Modal confirmation suppression */}
      {deletingVehicule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer ce véhicule ?</h3>
            <p className="text-gray-500 text-sm mb-4">
              <span className="font-medium text-gray-700">{deletingVehicule.immatriculation}</span> sera définitivement supprimé.
            </p>
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeletingVehicule(null); setDeleteError('') }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Immatriculation, marque..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-56"
            />
          </div>
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="EN_MISSION">En mission</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
        <Link
          to="/repertoire/vehicules/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <RiAddLine className="text-lg" />
          Nouveau véhicule
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicules.length === 0 && (
              <div className="col-span-3 text-center py-10 text-gray-400">Aucun véhicule trouvé</div>
            )}
            {vehicules.map(v => (
              <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <RiTruckLine className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{v.immatriculation}</h3>
                      <span className="text-xs text-gray-500">{v.typeCamion.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[v.statut]}`}>
                      {v.statut.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {(v.marque || v.modele) && (
                  <p className="text-sm text-gray-500 mb-2">{v.marque} {v.modele}</p>
                )}

                <p className="text-sm text-gray-600 mb-3">
                  Conso : {v.consommationRef} L/100km
                </p>

                {v.chauffeur && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <RiUserLine className="text-gray-400" />
                    {v.chauffeur.nom} {v.chauffeur.prenom}
                  </div>
                )}

                {/* Barre de progression maintenance */}
                {(() => {
                  const km = v.kmDepuisMaintenance ?? 0
                  const pct = Math.min((km / 5000) * 100, 100)
                  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : 'bg-green-500'
                  return (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Km depuis maintenance</span>
                        <span className={pct >= 80 ? 'font-semibold text-orange-500' : ''}>{km.toLocaleString('fr-FR')} / 5 000 km</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })()}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/feuilles-de-route/new?vehiculeId=${v.id}`)}
                      className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-dark font-medium transition-colors"
                    >
                      <RiFileList3Line className="text-base" />
                      Mission
                    </button>
                    <Link
                      to={`/repertoire/vehicules/${v.id}`}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Voir la fiche
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/repertoire/vehicules/${v.id}`)}
                      title="Modifier"
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <RiEditLine className="text-base" />
                    </button>
                    <button
                      onClick={() => setDeletingVehicule(v)}
                      title="Supprimer"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <RiDeleteBinLine className="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {meta && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{meta.total} véhicule{meta.total > 1 ? 's' : ''}</span>
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
