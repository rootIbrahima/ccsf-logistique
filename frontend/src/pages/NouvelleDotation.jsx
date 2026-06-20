import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RiGasStationLine, RiSaveLine, RiArrowLeftLine } from 'react-icons/ri'
import api from '../services/api'

const CONSO_PAR_KM = 0.53   // taux fixe tous véhicules
const PRIX_LITRE   = 680

const schema = z.object({
  date:        z.string().min(1, 'Date requise'),
  chauffeurId: z.string().min(1, 'Chauffeur requis'),
  vehiculeId:  z.string().min(1, 'Véhicule requis'),
  itineraire:  z.string().min(2, 'Itinéraire requis'),
  distanceKm:  z.coerce.number().positive('Distance requise'),
  moisPeriode: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis'),
  responsable: z.string().optional(),
  litresReels: z.coerce.number().optional()
})

export default function NouvelleDotation() {
  const navigate = useNavigate()
  const [chauffeurs, setChauffeurs] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [preview, setPreview] = useState(null)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      moisPeriode: new Date().toISOString().slice(0, 7)
    }
  })

  const watchedDistance    = watch('distanceKm')
  const watchedLitresReels = watch('litresReels')
  const watchedChauffeurId = watch('chauffeurId')

  useEffect(() => {
    Promise.all([
      api.get('/chauffeurs', { params: { statut: 'ACTIF', limit: 100 } }),
      api.get('/vehicules', { params: { limit: 100 } })
    ]).then(([c, v]) => {
      setChauffeurs(c.data.data || [])
      setVehicules(v.data.data || [])
    }).catch(() => {})
  }, [])

  // Auto-remplissage véhicule selon chauffeur
  useEffect(() => {
    const chauffeur = chauffeurs.find(c => c.id === watchedChauffeurId)
    if (chauffeur?.vehicule?.id) {
      setValue('vehiculeId', chauffeur.vehicule.id)
    } else {
      setValue('vehiculeId', '')
    }
  }, [watchedChauffeurId, chauffeurs])

  // Calcul prévisualisation
  useEffect(() => {
    const dist = parseFloat(watchedDistance)
    if (isNaN(dist) || dist <= 0) { setPreview(null); return }

    const litresTheo = Math.ceil(dist * CONSO_PAR_KM / 5) * 5
    const dotationTotale = litresTheo * PRIX_LITRE

    const litresReels = parseFloat(watchedLitresReels)
    let ecartLitres = null
    let statut = 'EN_ATTENTE'
    if (!isNaN(litresReels)) {
      ecartLitres = litresReels - litresTheo
      statut = ecartLitres <= 0 ? 'OK' : 'DANS_MARGE'
    }

    setPreview({ litresTheo, dotationTotale, ecartLitres, statut })
  }, [watchedDistance, watchedLitresReels])

  async function onSubmit(data) {
    setApiError('')
    try {
      await api.post('/dotations', data)
      navigate('/dotations')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const fmt = n => n != null ? Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : '—'
  const statutColor = { OK: 'text-green-600', DANS_MARGE: 'text-orange-500', EN_ATTENTE: 'text-gray-500' }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <RiArrowLeftLine /> Retour
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <RiGasStationLine className="text-accent text-2xl" />
          <h2 className="text-lg font-semibold text-gray-800">Nouvelle dotation carburant</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input {...register('date')} type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois de période *</label>
              <input {...register('moisPeriode')} type="month" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              {errors.moisPeriode && <p className="text-red-500 text-xs mt-1">{errors.moisPeriode.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur *</label>
              <select {...register('chauffeurId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Choisir</option>
                {chauffeurs.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                ))}
              </select>
              {errors.chauffeurId && <p className="text-red-500 text-xs mt-1">{errors.chauffeurId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
              <select {...register('vehiculeId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Choisir</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>{v.immatriculation} — {v.typeCamion.replace('_', ' ')}</option>
                ))}
              </select>
              {errors.vehiculeId && <p className="text-red-500 text-xs mt-1">{errors.vehiculeId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Itinéraire *</label>
            <input {...register('itineraire')} placeholder="KDG/DKR/KAYES" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            {errors.itineraire && <p className="text-red-500 text-xs mt-1">{errors.itineraire.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km) *</label>
              <input {...register('distanceKm')} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              {errors.distanceKm && <p className="text-red-500 text-xs mt-1">{errors.distanceKm.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Litres réels (optionnel)</label>
              <input {...register('litresReels')} type="number" step="0.1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input {...register('responsable')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          {/* Prévisualisation calcul */}
          {preview && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-gray-700">Calcul automatique</p>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <span className="font-semibold">Dotation totale</span>
                <span className="font-mono font-semibold text-right text-accent">{fmt(preview.dotationTotale)} FCFA</span>
                {preview.ecartLitres != null && (
                  <>
                    <span>Écart litres</span>
                    <span className={`font-mono text-right font-semibold ${statutColor[preview.statut]}`}>
                      {preview.ecartLitres >= 0 ? '+' : ''}{fmt(preview.ecartLitres)} L — {preview.statut.replace('_', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{apiError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <RiSaveLine />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer la dotation'}
          </button>
        </form>
      </div>
    </div>
  )
}
