import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  RiArrowLeftLine, RiTruckLine, RiGasStationLine, RiUserLine,
  RiEditLine, RiDeleteBinLine, RiSaveLine, RiCloseLine, RiFileList3Line
} from 'react-icons/ri'
import api from '../services/api'

const CONSUMPTION_REF = { HOWO_420: 53, HOWO_380: 48, MAN_TGS: 42, IVECO: 35, AUTRE: 45 }

const editSchema = z.object({
  immatriculation: z.string().min(2),
  typeCamion:      z.enum(['HOWO_420', 'HOWO_380', 'MAN_TGS', 'IVECO', 'AUTRE']),
  marque:          z.string().optional(),
  modele:          z.string().optional(),
  consommationRef: z.coerce.number().positive(),
  statut:          z.enum(['DISPONIBLE', 'EN_MISSION', 'MAINTENANCE'])
})

const statutBadge = {
  DISPONIBLE:  'bg-green-100 text-green-700',
  EN_MISSION:  'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700'
}

const missionBadge = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ROUTE:   'bg-blue-100 text-blue-700',
  LIVRE:      'bg-green-100 text-green-700',
  ANNULE:     'bg-red-100 text-red-700'
}

export default function FicheDetailVehicule() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicule, setVehicule]           = useState(null)
  const [loading, setLoading]             = useState(true)
  const [editing, setEditing]             = useState(false)
  const [saving, setSaving]               = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [apiError, setApiError]           = useState('')

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema)
  })

  const watchedType = watch('typeCamion')

  useEffect(() => {
    api.get(`/vehicules/${id}`)
      .then(({ data }) => {
        setVehicule(data)
        reset({
          immatriculation: data.immatriculation,
          typeCamion:      data.typeCamion,
          marque:          data.marque || '',
          modele:          data.modele || '',
          consommationRef: data.consommationRef,
          statut:          data.statut
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, reset])

  useEffect(() => {
    if (watchedType && CONSUMPTION_REF[watchedType] && editing) {
      setValue('consommationRef', CONSUMPTION_REF[watchedType])
    }
  }, [watchedType, editing, setValue])

  async function onSave(data) {
    setSaving(true)
    setApiError('')
    try {
      const { data: updated } = await api.put(`/vehicules/${id}`, data)
      setVehicule(updated)
      setEditing(false)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.delete(`/vehicules/${id}`)
      navigate('/repertoire/vehicules')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la suppression')
      setConfirmDelete(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
    </div>
  )
  if (!vehicule) return <div className="text-red-500 p-4">Véhicule introuvable</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <RiArrowLeftLine /> Retour
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setEditing(e => !e); setApiError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm rounded-lg transition-colors"
          >
            {editing ? <RiCloseLine /> : <RiEditLine />}
            {editing ? 'Annuler' : 'Modifier'}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm rounded-lg transition-colors"
          >
            <RiDeleteBinLine /> Supprimer
          </button>
        </div>
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer ce véhicule ?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Le véhicule {vehicule.immatriculation} sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fiche véhicule */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <RiTruckLine className="text-white text-3xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{vehicule.immatriculation}</h2>
              <p className="text-gray-500 text-sm">{vehicule.typeCamion.replace('_', ' ')}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statutBadge[vehicule.statut]}`}>
                {vehicule.statut.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <RiGasStationLine className="text-gray-400" />
              Consommation : <span className="font-medium">{vehicule.consommationRef} L/100km</span>
            </div>
            {(vehicule.marque || vehicule.modele) && (
              <div className="flex items-center gap-2">
                <RiTruckLine className="text-gray-400" />
                {vehicule.marque} {vehicule.modele}
              </div>
            )}
            {vehicule.chauffeur && (
              <div className="flex items-center gap-2 col-span-2">
                <RiUserLine className="text-gray-400" />
                Chauffeur :&nbsp;
                <Link to={`/repertoire/chauffeurs/${vehicule.chauffeur.id}`} className="text-accent hover:underline font-medium">
                  {vehicule.chauffeur.nom} {vehicule.chauffeur.prenom}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation *</label>
                <input {...register('immatriculation')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                {errors.immatriculation && <p className="text-red-500 text-xs mt-1">{errors.immatriculation.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select {...register('typeCamion')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                  {Object.keys(CONSUMPTION_REF).map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input {...register('marque')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input {...register('modele')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <RiGasStationLine className="inline mr-1 text-gray-400" />
                  L/100km *
                </label>
                <input {...register('consommationRef')} type="number" step="0.1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select {...register('statut')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_MISSION">En mission</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-60">
              <RiSaveLine /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>

      {/* Historique missions */}
      {vehicule.missions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Dernières missions</h3>
          <div className="space-y-2">
            {vehicule.missions.map(m => (
              <Link key={m.id} to={`/feuilles-de-route/${m.id}`} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-gray-500">{m.numero}</span>
                  <p className="text-sm text-gray-700 truncate">{m.produit} → {m.destination?.nom}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${missionBadge[m.statut]}`}>
                    {m.statut.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(m.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
