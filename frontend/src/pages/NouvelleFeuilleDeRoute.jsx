import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RiSearchLine, RiFileList3Line, RiSaveLine, RiArrowLeftLine } from 'react-icons/ri'
import api from '../services/api'
import SearchRepertoire from '../components/shared/SearchRepertoire'
import StepperForm from '../components/shared/StepperForm'
import FicheChauffeur from '../components/shared/FicheChauffeur'

const PRIX_LITRE = 680

const missionSchema = z.object({
  lieuChargement:  z.string().min(2, 'Lieu requis'),
  date:            z.string().min(1, 'Date requise'),
  produit:         z.string().min(2, 'Produit requis'),
  quantiteTonnes:  z.coerce.number().positive('Quantité requise'),
  nombreSacs:      z.coerce.number().int().positive('Nombre requis'),
  destinationId:   z.string().min(1, 'Destination requise'),
  numeroBl:        z.string().optional(),
  carburantLitres: z.coerce.number().optional(),
  fraisRoute:      z.coerce.number().optional(),
  autresFrais:     z.coerce.number().optional(),
  kmDepart:        z.coerce.number().int().optional()
})

const STEPS = [
  { label: 'Sélection chauffeur', icon: RiSearchLine },
  { label: 'Infos de la mission',  icon: RiFileList3Line }
]

export default function NouvelleFeuilleDeRoute() {
  const [step, setStep] = useState(0)
  const [selectedChauffeur, setSelectedChauffeur] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [carburantFcfa, setCarburantFcfa] = useState(0)
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(missionSchema)
  })

  const watchedLitres = watch('carburantLitres')
  const watchedDest   = watch('destinationId')

  useEffect(() => {
    api.get('/destinations').then(({ data }) => setDestinations(data)).catch(() => {})
  }, [])

  // Pré-charger chauffeur depuis query param
  useEffect(() => {
    const id = searchParams.get('chauffeurId')
    if (!id) return
    api.get(`/chauffeurs/${id}`)
      .then(({ data }) => { setSelectedChauffeur(data); setStep(1) })
      .catch(() => {})
  }, [searchParams])

  useEffect(() => {
    const litres = parseFloat(watchedLitres)
    if (!isNaN(litres)) setCarburantFcfa(Math.round(litres * PRIX_LITRE))
    else setCarburantFcfa(0)
  }, [watchedLitres])

  function handleSelectChauffeur(chauffeur) {
    setSelectedChauffeur(chauffeur)
    setStep(1)
  }

  async function onSubmit(data) {
    setApiError('')
    try {
      const payload = {
        ...data,
        chauffeurId:    selectedChauffeur.id,
        vehiculeId:     selectedChauffeur.vehicule?.id,
        carburantFcfa:  carburantFcfa || undefined
      }
      const { data: created } = await api.post('/feuilles-de-route', payload)
      navigate(`/feuilles-de-route/${created.id}`)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <RiArrowLeftLine /> Retour
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <StepperForm steps={STEPS} currentStep={step}>
          {step === 0 && (
            <SearchRepertoire onSelectChauffeur={handleSelectChauffeur} />
          )}

          {step === 1 && (
            <div>
              {/* Chauffeur sélectionné */}
              {selectedChauffeur && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Chauffeur sélectionné</p>
                    <button
                      onClick={() => setStep(0)}
                      className="text-xs text-accent hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                  <FicheChauffeur chauffeur={selectedChauffeur} showMissionBtn={false} />
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de chargement *</label>
                    <input
                      {...register('lieuChargement')}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Port Môle 1, Dakar"
                    />
                    {errors.lieuChargement && <p className="text-red-500 text-xs mt-1">{errors.lieuChargement.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de chargement *</label>
                    <input
                      {...register('date')}
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                  <input
                    {...register('produit')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Riz SALMA Rouge 50 KGS"
                  />
                  {errors.produit && <p className="text-red-500 text-xs mt-1">{errors.produit.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité (T) *</label>
                    <input
                      {...register('quantiteTonnes')}
                      type="number" step="0.1"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.quantiteTonnes && <p className="text-red-500 text-xs mt-1">{errors.quantiteTonnes.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de sacs *</label>
                    <input
                      {...register('nombreSacs')}
                      type="number"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.nombreSacs && <p className="text-red-500 text-xs mt-1">{errors.nombreSacs.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° BL</label>
                    <input
                      {...register('numeroBl')}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <select
                    {...register('destinationId')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Choisir une destination</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nom} — {d.distanceDakar} km
                      </option>
                    ))}
                  </select>
                  {errors.destinationId && <p className="text-red-500 text-xs mt-1">{errors.destinationId.message}</p>}
                  {watchedDest && destinations.find(d => d.id === watchedDest) && (
                    <p className="text-xs text-blue-600 mt-1">
                      Distance : {destinations.find(d => d.id === watchedDest)?.distanceDakar} km depuis Dakar
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carburant alloué (L)</label>
                    <input
                      {...register('carburantLitres')}
                      type="number" step="0.1"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {carburantFcfa > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{carburantFcfa.toLocaleString('fr-FR')} FCFA</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frais de route (FCFA)</label>
                    <input
                      {...register('fraisRoute')}
                      type="number"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Autres frais (FCFA)</label>
                    <input
                      {...register('autresFrais')}
                      type="number"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Km départ</label>
                  <input
                    {...register('kmDepart')}
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                    {apiError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedChauffeur?.vehicule}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <RiSaveLine />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer la feuille'}
                  </button>
                </div>

                {!selectedChauffeur?.vehicule && (
                  <p className="text-orange-600 text-xs text-center">
                    Ce chauffeur n'a pas de véhicule assigné. Veuillez en assigner un depuis le répertoire.
                  </p>
                )}
              </form>
            </div>
          )}
        </StepperForm>
      </div>
    </div>
  )
}
