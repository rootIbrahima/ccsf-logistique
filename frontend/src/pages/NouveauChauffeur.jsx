import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RiUserAddLine, RiSaveLine, RiPhoneLine, RiIdCardLine, RiArrowLeftLine } from 'react-icons/ri'
import api from '../services/api'

const schema = z.object({
  nom:          z.string().min(2, 'Nom requis (min 2 caractères)'),
  prenom:       z.string().min(2, 'Prénom requis (min 2 caractères)'),
  telephone:    z.string().min(1, 'Téléphone requis'),
  permisNumero: z.string().optional(),
  statut:       z.enum(['ACTIF', 'INACTIF']).default('ACTIF'),
  vehiculeId:   z.string().optional()
})

export default function NouveauChauffeur() {
  const navigate = useNavigate()
  const [vehicules, setVehicules] = useState([])
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { statut: 'ACTIF' }
  })

  useEffect(() => {
    api.get('/vehicules', { params: { statut: 'DISPONIBLE', limit: 100 } })
      .then(({ data }) => setVehicules(data.data || []))
      .catch(() => {})
  }, [])

  async function onSubmit(data) {
    setApiError('')
    const payload = { ...data, vehiculeId: data.vehiculeId || undefined }
    try {
      const { data: created } = await api.post('/chauffeurs', payload)
      navigate(`/repertoire/chauffeurs/${created.id}`)
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
          <RiUserAddLine className="text-accent text-2xl" />
          <h2 className="text-lg font-semibold text-gray-800">Nouveau chauffeur</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                {...register('nom')}
                placeholder="DIOUF"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                {...register('prenom')}
                placeholder="Sakoura"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RiPhoneLine className="inline mr-1 text-gray-400" />
              Téléphone *
            </label>
            <input
              {...register('telephone')}
              placeholder="+221 77 123 45 67"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RiIdCardLine className="inline mr-1 text-gray-400" />
              N° Permis
            </label>
            <input
              {...register('permisNumero')}
              placeholder="DKR-2024-001"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select {...register('statut')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule par défaut</label>
              <select {...register('vehiculeId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Aucun</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>{v.immatriculation} — {v.typeCamion.replace('_', ' ')}</option>
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
