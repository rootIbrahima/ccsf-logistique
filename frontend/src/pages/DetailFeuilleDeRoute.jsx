import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RiArrowLeftLine, RiFilePdf2Line, RiEditLine, RiSaveLine, RiDeleteBinLine } from 'react-icons/ri'
import { useForm } from 'react-hook-form'
import api from '../services/api'

const statutBadge = {
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ROUTE:   'bg-blue-100 text-blue-700',
  LIVRE:      'bg-green-100 text-green-700',
  ANNULE:     'bg-red-100 text-red-700'
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

export default function DetailFeuilleDeRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [fdr, setFdr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    Promise.all([
      api.get(`/feuilles-de-route/${id}`),
      api.get('/destinations')
    ]).then(([fdrRes]) => {
      setFdr(fdrRes.data)
      reset({
        statut:         fdrRes.data.statut,
        lieuDecharge:   fdrRes.data.lieuDecharge   || '',
        quantiteLivree: fdrRes.data.quantiteLivree || '',
        sacsLivres:     fdrRes.data.sacsLivres     || '',
        reserves:       fdrRes.data.reserves       || '',
        kmArrivee:      fdrRes.data.kmArrivee      || '',
        visaLogistique: fdrRes.data.visaLogistique,
        visaDirection:  fdrRes.data.visaDirection
      })
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [id, reset])

  async function onSave(data) {
    setSaving(true)
    try {
      const { data: updated } = await api.put(`/feuilles-de-route/${id}`, data)
      setFdr(updated)
      setEditing(false)
    } catch {}
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/feuilles-de-route/${id}`)
      navigate('/feuilles-de-route')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const [pdfLoading, setPdfLoading] = useState(false)

  async function downloadPDF() {
    setPdfLoading(true)
    try {
      const response = await api.get(`/feuilles-de-route/${id}/pdf`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `FR-${fdr?.numero || id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de la génération du PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
    </div>
  )

  if (!fdr) return <div className="text-red-500">Feuille de route introuvable</div>

  const fmt = n => n != null ? Number(n).toLocaleString('fr-FR') : null

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer cette feuille de route ?</h3>
            <p className="text-gray-500 text-sm mb-5">
              La feuille <span className="font-mono font-medium">{fdr.numero}</span> sera définitivement supprimée.
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
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RiArrowLeftLine /> Retour
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {pdfLoading
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <RiFilePdf2Line className="text-red-500" />
            }
            {pdfLoading ? 'Génération...' : 'Télécharger PDF'}
          </button>
          <button
            onClick={() => setEditing(e => !e)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
          >
            <RiEditLine /> {editing ? 'Annuler' : 'Modifier'}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm rounded-lg transition-colors"
          >
            <RiDeleteBinLine /> Supprimer
          </button>
        </div>
      </div>

      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-mono">{fdr.numero}</h2>
            <p className="text-gray-500 text-sm mt-1">{new Date(fdr.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statutBadge[fdr.statut]}`}>
            {fdr.statut.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Chargement */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-primary border-b border-gray-100 pb-2 mb-3">Chargement</h3>
          <Row label="Lieu"         value={fdr.lieuChargement} />
          <Row label="Produit"      value={fdr.produit} />
          <Row label="Quantité"     value={fdr.quantiteTonnes ? `${fdr.quantiteTonnes} T` : null} />
          <Row label="Sacs"         value={fmt(fdr.nombreSacs)} />
          <Row label="Destination"  value={fdr.destination?.nom} />
          <Row label="N° BL"        value={fdr.numeroBl} />
          <Row label="Véhicule"     value={fdr.vehicule?.immatriculation} />
          <Row label="Chauffeur"    value={`${fdr.chauffeur?.nom} ${fdr.chauffeur?.prenom}`} />
        </div>

        {/* Frais */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-primary border-b border-gray-100 pb-2 mb-3">Frais de mission</h3>
          <Row label="Carburant"    value={fdr.carburantLitres ? `${fdr.carburantLitres} L — ${fmt(fdr.carburantFcfa)} FCFA` : null} />
          <Row label="Frais route"  value={fdr.fraisRoute ? `${fmt(fdr.fraisRoute)} FCFA` : null} />
          <Row label="Autres frais" value={fdr.autresFrais ? `${fmt(fdr.autresFrais)} FCFA` : null} />
          <Row label="TOTAL"        value={`${fmt((fdr.carburantFcfa || 0) + (fdr.fraisRoute || 0) + (fdr.autresFrais || 0))} FCFA`} />

          <h3 className="font-semibold text-primary border-b border-gray-100 pb-2 mb-3 mt-4">Kilométrique</h3>
          <Row label="Km départ"    value={fmt(fdr.kmDepart)} />
          <Row label="Km arrivée"   value={fmt(fdr.kmArrivee)} />
          <Row label="Km parcourus" value={fmt(fdr.kmParcourus)} />
        </div>
      </div>

      {/* Formulaire mise à jour */}
      {editing && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Mise à jour de la mission</h3>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select {...register('statut')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_ROUTE">En route</option>
                  <option value="LIVRE">Livré</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Km arrivée</label>
                <input {...register('kmArrivee')} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de décharge</label>
                <input {...register('lieuDecharge')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qté livrée (T)</label>
                <input {...register('quantiteLivree')} type="number" step="0.1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sacs livrés</label>
                <input {...register('sacsLivres')} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réserves / Observations</label>
              <textarea {...register('reserves')} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input {...register('visaLogistique')} type="checkbox" className="rounded text-accent" />
                Visa Logistique
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input {...register('visaDirection')} type="checkbox" className="rounded text-accent" />
                Visa Direction
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              <RiSaveLine />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
