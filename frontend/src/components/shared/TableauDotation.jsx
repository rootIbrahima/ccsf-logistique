import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import Pagination from './Pagination'

const statutConfig = {
  OK:         { bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  label: 'OK' },
  DANS_MARGE: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', label: 'Dans la marge' },
  EN_ATTENTE: { bg: 'bg-gray-50',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600',     label: 'En attente' }
}

function fmt(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('fr-FR')
}

export default function TableauDotation({ dotations, meta, onPageChange, onEdit, onDelete }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">N° Bon</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Chauffeur</th>
              <th className="px-4 py-3 text-left font-medium">Véhicule</th>
              <th className="px-4 py-3 text-left font-medium">Itinéraire</th>
              <th className="px-4 py-3 text-right font-medium">L. Réels</th>
              <th className="px-4 py-3 text-right font-medium">Dotation (FCFA)</th>
              <th className="px-4 py-3 text-center font-medium">Statut</th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dotations.length === 0 && (
              <tr><td colSpan={onEdit || onDelete ? 9 : 8} className="text-center py-8 text-gray-400">Aucune dotation</td></tr>
            )}
            {dotations.map(d => {
              const cfg = statutConfig[d.statut] || statutConfig.EN_ATTENTE
              return (
                <tr key={d.id} className={`${cfg.bg} hover:brightness-95 transition-all`}>
                  <td className="px-4 py-3 font-mono font-medium text-gray-700">{d.numeroBon}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 font-medium">{d.chauffeur?.nom} {d.chauffeur?.prenom}</td>
                  <td className="px-4 py-3 text-gray-600">{d.vehicule?.immatriculation}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{d.itineraire}</td>
                  <td className={`px-4 py-3 text-right font-mono ${cfg.text}`}>{d.litresReels != null ? `${fmt(d.litresReels)} L` : '—'}</td>
                  <td className={`px-4 py-3 text-right font-mono ${cfg.text}`}>{fmt(d.dotationTotale)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(d)}
                            title="Modifier"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <RiEditLine className="text-base" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(d.id)}
                            title="Supprimer"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <RiDeleteBinLine className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span>{meta.total} dotation{meta.total > 1 ? 's' : ''}</span>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
