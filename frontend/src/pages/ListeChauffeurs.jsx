import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiAddLine, RiSearchLine } from 'react-icons/ri'
import api from '../services/api'
import FicheChauffeur from '../components/shared/FicheChauffeur'
import Pagination from '../components/shared/Pagination'
import { usePagination } from '../hooks/usePagination'
import { useDebounce } from '../hooks/useDebounce'

export default function ListeChauffeurs() {
  const navigate = useNavigate()
  const [chauffeurs, setChauffeurs] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const debouncedSearch = useDebounce(search)
  const { page, limit, goToPage, reset } = usePagination()

  // Modal suppression
  const [deletingChauffeur, setDeletingChauffeur] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { reset() }, [debouncedSearch, filterStatut])

  function load() {
    setLoading(true)
    const params = { page, limit }
    if (debouncedSearch) params.search = debouncedSearch
    if (filterStatut) params.statut = filterStatut

    api.get('/chauffeurs', { params })
      .then(({ data }) => { setChauffeurs(data.data); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, limit, debouncedSearch, filterStatut])

  async function handleDelete() {
    if (!deletingChauffeur) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/chauffeurs/${deletingChauffeur.id}`)
      setDeletingChauffeur(null)
      load()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">

      {/* Modal confirmation suppression */}
      {deletingChauffeur && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Désactiver ce chauffeur ?</h3>
            <p className="text-gray-500 text-sm mb-4">
              <span className="font-medium text-gray-700">{deletingChauffeur.nom} {deletingChauffeur.prenom}</span> sera marqué comme inactif.
            </p>
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeletingChauffeur(null); setDeleteError('') }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {deleting ? 'En cours...' : 'Désactiver'}
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
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-56"
            />
          </div>
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tous</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">Inactifs</option>
          </select>
        </div>
        <Link
          to="/repertoire/chauffeurs/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <RiAddLine className="text-lg" />
          Nouveau chauffeur
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chauffeurs.length === 0 && (
              <div className="col-span-3 text-center py-10 text-gray-400">Aucun chauffeur trouvé</div>
            )}
            {chauffeurs.map(c => (
              <FicheChauffeur
                key={c.id}
                chauffeur={c}
                onEdit={c => navigate(`/repertoire/chauffeurs/${c.id}`)}
                onDelete={c => setDeletingChauffeur(c)}
              />
            ))}
          </div>
          {meta && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{meta.total} chauffeur{meta.total > 1 ? 's' : ''}</span>
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
