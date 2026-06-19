import { useNavigate } from 'react-router-dom'
import { RiUserLine, RiPhoneLine, RiTruckLine, RiFileList3Line, RiIdCardLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

const statutBadge = {
  ACTIF:   'bg-green-100 text-green-700',
  INACTIF: 'bg-gray-100 text-gray-500'
}

const vehiculeStatut = {
  DISPONIBLE:  'bg-green-100 text-green-700',
  EN_MISSION:  'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700'
}

export default function FicheChauffeur({ chauffeur, onSelect, showMissionBtn = true, onEdit, onDelete }) {
  const navigate = useNavigate()

  function handleMission() {
    if (onSelect) return onSelect(chauffeur)
    navigate(`/feuilles-de-route/new?chauffeurId=${chauffeur.id}`)
  }

  function handleEdit() {
    if (onEdit) return onEdit(chauffeur)
    navigate(`/repertoire/chauffeurs/${chauffeur.id}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center">
            <RiUserLine className="text-white text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chauffeur.nom} {chauffeur.prenom}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statutBadge[chauffeur.statut]}`}>
              {chauffeur.statut}
            </span>
          </div>
        </div>
        {/* Boutons actions rapides */}
        {(onEdit !== undefined || onDelete) && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              title="Modifier"
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <RiEditLine className="text-base" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(chauffeur)}
                title="Supprimer"
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RiDeleteBinLine className="text-base" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <RiPhoneLine className="text-gray-400 shrink-0" />
          <span>{chauffeur.telephone}</span>
        </div>
        {chauffeur.permisNumero && (
          <div className="flex items-center gap-2">
            <RiIdCardLine className="text-gray-400 shrink-0" />
            <span>{chauffeur.permisNumero}</span>
          </div>
        )}
        {chauffeur.vehicule && (
          <div className="flex items-center gap-2">
            <RiTruckLine className="text-gray-400 shrink-0" />
            <span className="font-medium text-gray-700">{chauffeur.vehicule.immatriculation}</span>
            <span className="text-xs text-gray-400">{chauffeur.vehicule.typeCamion?.replace('_', ' ')}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${vehiculeStatut[chauffeur.vehicule.statut]}`}>
              {chauffeur.vehicule.statut?.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      {showMissionBtn && (
        <button
          onClick={handleMission}
          className="flex items-center gap-2 text-sm text-accent hover:text-accent-dark font-medium transition-colors"
        >
          <RiFileList3Line />
          Créer une mission
        </button>
      )}
    </div>
  )
}
