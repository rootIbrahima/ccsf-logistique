import { FiUser, FiPhone, FiCalendar } from 'react-icons/fi'
import { RiMapPinLine, RiBox3Line } from 'react-icons/ri'

export default function PanneauTrajets({ trajets }) {
  const actifs = trajets.filter(t => t.statut === 'EN_ROUTE')

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">
        Trajets en cours ({actifs.length})
      </h3>

      {actifs.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">Aucun trajet en cours</p>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
        {actifs.map(t => (
          <div key={t.id} className="border border-blue-100 bg-blue-50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-600 font-medium">{t.numero}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiUser className="text-gray-400 shrink-0 text-xs" />
              <span className="font-medium text-gray-800">{t.chauffeur?.nom} {t.chauffeur?.prenom}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiPhone className="text-gray-400 shrink-0 text-xs" />
              <span>{t.chauffeur?.telephone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RiMapPinLine className="text-gray-400 shrink-0 text-xs" />
              <span>{t.destination?.nom} — {t.destination?.distanceDakar} km</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RiBox3Line className="text-gray-400 shrink-0 text-xs" />
              <span className="truncate">{t.produit} · {t.quantiteTonnes} T</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiCalendar className="text-gray-400 shrink-0 text-xs" />
              <span>{new Date(t.date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
