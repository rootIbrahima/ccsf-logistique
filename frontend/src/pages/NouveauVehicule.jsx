import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RiTruckLine, RiSaveLine, RiGasStationLine, RiArrowLeftLine } from 'react-icons/ri'
import api from '../services/api'

const CONSUMPTION_REF = { HOWO_420: 53, HOWO_380: 48, MAN_TGS: 42, IVECO: 35, AUTRE: 45 }

const schema = z.object({
  immatriculation: z.string().min(2, 'Immatriculation requise'),
  typeCamion:      z.enum(['HOWO_420', 'HOWO_380', 'MAN_TGS', 'IVECO', 'AUTRE']),
  marque:          z.string().optional(),
  modele:          z.string().optional(),
  consommationRef: z.coerce.number().positive('Consommation requise'),
  statut:          z.enum(['DISPONIBLE', 'EN_MISSION', 'MAINTENANCE']).default('DISPONIBLE'),
  chauffeurId:     z.string().optional()
})

export default function NouveauVehicule() {
  const navigate = useNavigate()
  const [chauffeurs, setChauffeurs] = useState([])
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { statut: 'DISPONIBLE', consommationRef: 45 }
  })

  const watchedType = watch('typeCamion')

  useEffect(() => {
    api.get('/chauffeurs', { params: { statut: 'ACTIF', limit: 100 } })
      .then(({ data }) => setChauffeurs(data.data || []))
      .catch(() => {})
  }, [])

  // Auto-remplir consommation selon type
  useEffect(() => {
    if (watchedType && CONSUMPTION_REF[watchedType]) {
      setValue('consommationRef', CONSUMPTION_REF[watchedType])
    }
  }, [watchedType, setValue])

  async function onSubmit(data) {
    setApiError('')
    const payload = { ...data, chauffeurId: data.chauffeurId || undefined }
    try {
      await api.post('/vehicules', payload)
      navigate('/repertoire/vehicules')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <RiArrowLeftLine /> Retour
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <RiTruckLine className="text-accent text-2xl" />
          <h2 className="text-lg font-semibold text-gray-800">Nouveau véhicule</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation *</label>
            <input
              {...register('immatriculation')}
              placeholder="AA 838 FF"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.immatriculation && <p className="text-red-500 text-xs mt-1">{errors.immatriculation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de camion *</label>
            <select {...register('typeCamion')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="">Choisir un type</option>
              {Object.keys(CONSUMPTION_REF).map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            {errors.typeCamion && <p className="text-red-500 text-xs mt-1">{errors.typeCamion.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <input {...register('marque')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
              <input {...register('modele')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RiGasStationLine className="inline mr-1 text-gray-400" />
              Consommation (L/100km) *
            </label>
            <input
              {...register('consommationRef')}
              type="number" step="0.1"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.consommationRef && <p className="text-red-500 text-xs mt-1">{errors.consommationRef.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Auto-rempli selon le type, modifiable</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select {...register('statut')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_MISSION">En mission</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur par défaut</label>
              <select {...register('chauffeurId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Aucun</option>
                {chauffeurs.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                ))}
              </select>
            </div>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{apiError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <RiSaveLine />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
