import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiTruckLine, RiGasStationLine, RiMoneyDollarCircleLine, RiTimeLine } from 'react-icons/ri'
import api from '../services/api'
import StatCard from '../components/shared/StatCard'

const statutBadge = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ROUTE:   'bg-blue-100 text-blue-700',
  LIVRE:      'bg-green-100 text-green-700',
  ANNULE:     'bg-red-100 text-red-700'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Impossible de charger les statistiques'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
    </div>
  )

  if (error) return <div className="text-red-500 p-4">{error}</div>

  const fmt = n => n != null ? Number(n).toLocaleString('fr-FR') : '—'

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiTruckLine}             label="Trajets ce mois"  value={stats.trajetsMois}            color="accent" />
        <StatCard icon={RiTimeLine}              label="En attente"        value={stats.enAttenteCount}         color="orange" />
        <StatCard icon={RiGasStationLine}        label="Carburant (L)"    value={fmt(stats.carburantConsommeL)} color="blue"   />
        <StatCard icon={RiMoneyDollarCircleLine} label="Dotation (FCFA)"  value={fmt(stats.dotationFcfaTotal)} color="green"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derniers trajets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Derniers trajets</h2>
            <Link to="/feuilles-de-route" className="text-accent text-sm hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {stats.derniersTrajets?.length === 0 && (
              <p className="text-gray-400 text-sm">Aucun trajet</p>
            )}
            {stats.derniersTrajets?.map(t => (
              <Link
                key={t.id}
                to={`/feuilles-de-route/${t.id}`}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-mono text-xs text-gray-500">{t.numero}</span>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                    {t.chauffeur?.nom} {t.chauffeur?.prenom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{t.produit} → {t.destination?.nom}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[t.statut]}`}>
                    {t.statut.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Destinations fréquentes */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Destinations fréquentes</h2>
          <div className="space-y-3">
            {stats.destinationsFreq?.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{d.nom}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-accent rounded-full"
                    style={{ width: `${Math.max(20, (d.count / (stats.destinationsFreq[0]?.count || 1)) * 80)}px` }}
                  />
                  <span className="text-xs text-gray-500 w-6 text-right">{d.count}</span>
                </div>
              </div>
            ))}
          </div>

          {stats.trajetsEnRoute > 0 && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">
                {stats.trajetsEnRoute} trajet{stats.trajetsEnRoute > 1 ? 's' : ''} en cours
              </p>
              <Link to="/carte" className="text-blue-600 text-xs hover:underline mt-1 block">
                Voir sur la carte
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
