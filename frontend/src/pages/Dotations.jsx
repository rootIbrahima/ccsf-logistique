import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiAddLine, RiSaveLine, RiCloseLine } from 'react-icons/ri'
import api from '../services/api'
import TableauDotation from '../components/shared/TableauDotation'
import { usePagination } from '../hooks/usePagination'

export default function Dotations() {
  const [dotations, setDotations] = useState([])
  const [meta, setMeta] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState('')
  const [filterMois, setFilterMois] = useState(() => new Date().toISOString().slice(0, 7))
  const { page, limit, goToPage, reset } = usePagination()

  // Modal modifier
  const [editingDot, setEditingDot] = useState(null)
  const [litresReels, setLitresReels] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Modal supprimer
  const [deletingId, setDeletingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { reset() }, [filterStatut, filterMois])

  function load() {
    setLoading(true)
    const params = { page, limit }
    if (filterStatut) params.statut = filterStatut
    if (filterMois)   params.mois   = filterMois

    Promise.all([
      api.get('/dotations', { params }),
      api.get('/dotations/stats/mensuel', { params: { mois: filterMois } })
    ]).then(([dotRes, statsRes]) => {
      setDotations(dotRes.data.data)
      setMeta(dotRes.data.meta)
      setStats(statsRes.data)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, limit, filterStatut, filterMois])

  function openEdit(dot) {
    setEditingDot(dot)
    setLitresReels(dot.litresReels ?? '')
  }

  async function handleSaveEdit() {
    if (!editingDot) return
    setSavingEdit(true)
    try {
      await api.put(`/dotations/${editingDot.id}`, {
        litresReels: litresReels !== '' ? Number(litresReels) : undefined
      })
      setEditingDot(null)
      load()
    } catch {}
    finally { setSavingEdit(false) }
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    try {
      await api.delete(`/dotations/${deletingId}`)
      setDeletingId(null)
      load()
    } catch {}
    finally { setDeleting(false) }
  }

  const fmt = n => n != null ? Number(n).toLocaleString('fr-FR') : '—'

  return (
    <div className="space-y-4">

      {/* Modal modifier litres réels */}
      {editingDot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Modifier la dotation</h3>
              <button onClick={() => setEditingDot(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <p className="text-xs text-gray-500 font-mono mb-4">{editingDot.numeroBon}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Litres réels consommés</label>
              <input
                type="number"
                step="0.1"
                value={litresReels}
                onChange={e => setLitresReels(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex: 48.5"
              />
              {litresReels !== '' && editingDot.litresTheoriques && (
                <p className={`text-xs mt-1 font-medium ${Number(litresReels) <= editingDot.litresTheoriques ? 'text-green-600' : 'text-orange-500'}`}>
                  {Number(litresReels) <= editingDot.litresTheoriques ? '✓ OK' : '⚠ Dans la marge'}
                  {' '}({(Number(litresReels) - editingDot.litresTheoriques) >= 0 ? '+' : ''}{(Number(litresReels) - editingDot.litresTheoriques).toFixed(1)} L)
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingDot(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
              >
                <RiSaveLine />
                {savingEdit ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmer suppression */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer cette dotation ?</h3>
            <p className="text-gray-500 text-sm mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
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

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total dotation (FCFA)', value: fmt(stats.totalDotationFcfa), color: 'bg-primary' },
            { label: 'Litres théoriques',     value: `${fmt(stats.totalLitresTheo)} L`,  color: 'bg-blue-600' },
            { label: 'Litres réels',          value: `${fmt(stats.totalLitresReels)} L`, color: 'bg-green-600' },
          ].map((k, i) => (
            <div key={i} className={`${k.color} text-white rounded-xl p-4`}>
              <p className="text-xs opacity-75">{k.label}</p>
              <p className="text-xl font-bold mt-1">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres + bouton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={filterMois}
            onChange={e => setFilterMois(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tous les statuts</option>
            <option value="OK">OK</option>
            <option value="DANS_MARGE">Dans la marge</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>
        <Link
          to="/dotations/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <RiAddLine className="text-lg" />
          Nouvelle dotation
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
        </div>
      ) : (
        <TableauDotation
          dotations={dotations}
          meta={meta}
          onPageChange={goToPage}
          onEdit={openEdit}
          onDelete={id => setDeletingId(id)}
        />
      )}
    </div>
  )
}
