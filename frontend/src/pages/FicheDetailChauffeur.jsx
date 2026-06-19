import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  RiArrowLeftLine, RiTruckLine, RiPhoneLine, RiIdCardLine,
  RiFileList3Line, RiEditLine, RiDeleteBinLine, RiSaveLine, RiCloseLine
} from 'react-icons/ri'
import api from '../services/api'

const editSchema = z.object({
  nom:          z.string().min(2, 'Min 2 caractères'),
  prenom:       z.string().min(2, 'Min 2 caractères'),
  telephone:    z.string().min(8, 'Téléphone requis'),
  permisNumero: z.string().optional(),
  statut:       z.enum(['ACTIF', 'INACTIF']),
  vehiculeId:   z.string().optional()
})

const statutBadgeFR = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ROUTE:   'bg-blue-100 text-blue-700',
  LIVRE:      'bg-green-100 text-green-700',
  ANNULE:     'bg-red-100 text-red-700'
}

export default function FicheDetailChauffeur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [chauffeur, setChauffeur] = useState(null)
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [apiError, setApiError]   = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema)
  })

  useEffect(() => {
    Promise.all([
      api.get(`/chauffeurs/${id}`),
      api.get('/vehicules', { params: { limit: 100 } })
    ]).then(([cRes, vRes]) => {
      setChauffeur(cRes.data)
      setVehicules(vRes.data.data || [])
      reset({
        nom:          cRes.data.nom,
        prenom:       cRes.data.prenom,
        telephone:    cRes.data.telephone,
        permisNumero: cRes.data.permisNumero || '',
        statut:       cRes.data.statut,
        vehiculeId:   cRes.data.vehicule?.id || ''
      })
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [id, reset])

  async function onSave(data) {
    setSaving(true)
    setApiError('')
    try {
      const payload = { ...data, vehiculeId: data.vehiculeId || null }
      const { data: updated } = await api.put(`/chauffeurs/${id}`, payload)
      setChauffeur(updated)
      setEditing(false)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.delete(`/chauffeurs/${id}`)
      navigate('/repertoire/chauffeurs')
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
  if (!chauffeur) return <div className="text-red-500 p-4">Chauffeur introuvable</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RiArrowLeftLine /> Retour
        </button>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/feuilles-de-route/new?chauffeurId=${chauffeur.id}`}
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <RiFileList3Line /> Créer une mission
          </Link>
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
            <RiDeleteBinLine /> Désactiver
          </button>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Désactiver ce chauffeur ?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Le chauffeur {chauffeur.nom} {chauffeur.prenom} sera marqué comme INACTIF.
              Cette action est réversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte profil */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">
              {chauffeur.nom[0]}{chauffeur.prenom[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{chauffeur.nom} {chauffeur.prenom}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${chauffeur.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {chauffeur.statut}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <RiPhoneLine className="text-gray-400" /> {chauffeur.telephone}
            </div>
            {chauffeur.permisNumero && (
              <div className="flex items-center gap-2">
                <RiIdCardLine className="text-gray-400" /> {chauffeur.permisNumero}
              </div>
            )}
            {chauffeur.vehicule && (
              <div className="flex items-center gap-2 col-span-2">
                <RiTruckLine className="text-gray-400" />
                <Link to={`/repertoire/vehicules/${chauffeur.vehicule.id}`} className="text-accent hover:underline font-medium">
                  {chauffeur.vehicule.immatriculation}
                </Link>
                <span className="text-gray-400">— {chauffeur.vehicule.typeCamion.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input {...register('nom')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input {...register('prenom')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input {...register('telephone')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Permis</label>
                <input {...register('permisNumero')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule assigné</label>
                <select {...register('vehiculeId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Aucun</option>
                  {vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.immatriculation} — {v.typeCamion.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              <RiSaveLine /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>

      {/* Historique missions */}
      {chauffeur.missions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Dernières missions</h3>
          <div className="space-y-2">
            {chauffeur.missions.map(m => (
              <Link
                key={m.id}
                to={`/feuilles-de-route/${m.id}`}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-mono text-xs text-gray-500">{m.numero}</span>
                  <p className="text-sm text-gray-700 truncate">{m.produit} → {m.destination?.nom}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadgeFR[m.statut]}`}>
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
