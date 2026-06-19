import { useLocation } from 'react-router-dom'
import { RiMenuLine } from 'react-icons/ri'

const titles = {
  '/dashboard':                 'Tableau de bord',
  '/carte':                     'Carte des trajets',
  '/feuilles-de-route':         'Feuilles de route',
  '/feuilles-de-route/new':     'Nouvelle feuille de route',
  '/dotations':                 'Dotation carburant',
  '/dotations/new':             'Nouvelle dotation',
  '/repertoire':                'Répertoire',
  '/repertoire/chauffeurs':     'Chauffeurs',
  '/repertoire/chauffeurs/new': 'Nouveau chauffeur',
  '/repertoire/vehicules':      'Véhicules',
  '/repertoire/vehicules/new':  'Nouveau véhicule',
}

export default function TopBar({ open, onOpen }) {
  const { pathname } = useLocation()

  const title = titles[pathname]
    || (pathname.includes('/feuilles-de-route/') ? 'Détail feuille de route' : '')
    || (pathname.includes('/repertoire/chauffeurs/') ? 'Fiche chauffeur' : '')
    || (pathname.includes('/repertoire/vehicules/') ? 'Fiche véhicule' : '')
    || 'CCSF Logistique'

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header
      className={`h-14 bg-white border-b border-gray-200 flex items-center px-4 fixed top-0 right-0 left-0 z-20 shadow-sm transition-all duration-300 ${open ? 'md:left-64' : ''}`}
    >
      {/* Bouton ouvrir — visible uniquement quand la sidebar est fermée */}
      {!open && (
        <button
          onClick={onOpen}
          className="mr-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Ouvrir le menu"
        >
          <RiMenuLine className="text-xl" />
        </button>
      )}
      <h1 className="text-gray-800 font-semibold text-lg capitalize flex-1">{title}</h1>
      <span className="hidden sm:block text-gray-500 text-sm capitalize">{today}</span>
    </header>
  )
}
