import { useState, useEffect } from 'react'
import api from '../../services/api'

const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente',  color: 'bg-orange-400' },
  { value: 'EN_ROUTE',   label: 'En route',    color: 'bg-blue-500' },
  { value: 'LIVRE',      label: 'Livré',       color: 'bg-green-500' },
  { value: 'ANNULE',     label: 'Annulé',      color: 'bg-red-500' }
]

export default function PanneauFiltres({ filters, onChange }) {
  const [chauffeurs, setChauffeurs] = useState([])

  useEffect(() => {
    api.get('/chauffeurs', { params: { statut: 'ACTIF', limit: 100 } })
      .then(({ data }) => setChauffeurs(data.data || []))
      .catch(() => {})
  }, [])

  function toggleStatut(value) {
    const current = filters.statuts || []
    const updated = current.includes(value)
      ? current.filter(s => s !== value)
      : [...current, value]
    onChange({ ...filters, statuts: updated })
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-5">
      <h3 className="font-semibold text-gray-800 text-sm">Filtres</h3>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Statut</p>
        <div className="space-y-2">
          {STATUTS.map(s => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.statuts || []).includes(s.value)}
                onChange={() => toggleStatut(s.value)}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-sm text-gray-700">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Chauffeur</p>
        <select
          value={filters.chauffeurId || ''}
          onChange={e => onChange({ ...filters, chauffeurId: e.target.value || null })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Tous</option>
          {chauffeurs.map(c => (
            <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Mois</p>
        <input
          type="month"
          value={filters.mois || ''}
          onChange={e => onChange({ ...filters, mois: e.target.value || null })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <button
        onClick={() => onChange({ statuts: [], chauffeurId: null, mois: null })}
        className="w-full text-xs text-gray-400 hover:text-accent transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )
}
