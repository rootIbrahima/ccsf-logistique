import { NavLink, useNavigate } from 'react-router-dom'
import {
  RiDashboardLine, RiMapLine, RiFileList3Line,
  RiGasStationLine, RiTeamLine, RiUserLine,
  RiTruckLine, RiLogoutBoxLine, RiMenuFoldLine
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',         icon: RiDashboardLine, label: 'Tableau de bord' },
  { to: '/carte',             icon: RiMapLine,        label: 'Carte' },
  { to: '/feuilles-de-route', icon: RiFileList3Line,  label: 'Feuilles de route' },
  { to: '/dotations',         icon: RiGasStationLine, label: 'Dotation carburant' },
]

const reperItems = [
  { to: '/repertoire/chauffeurs', icon: RiUserLine,  label: 'Chauffeurs' },
  { to: '/repertoire/vehicules',  icon: RiTruckLine, label: 'Véhicules' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-accent text-white font-medium'
            : 'text-gray-300 hover:bg-primary-light hover:text-white'
        }`
      }
    >
      <Icon className="text-lg shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reperOpen, setReperOpen] = useState(true)

  function handleNavClick() {
    if (window.innerWidth < 768) onClose()
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className="bg-primary h-screen flex flex-col fixed left-0 top-0 z-30 shadow-xl overflow-hidden transition-all duration-300"
      style={{ width: open ? '16rem' : '0' }}
    >
      {/* Contenu dans un wrapper de largeur fixe pour éviter le reflow du texte */}
      <div className="w-64 flex flex-col h-full">
        {/* Logo + bouton fermer */}
        <div className="px-4 py-4 border-b border-primary-light shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiTruckLine className="text-accent text-2xl shrink-0" />
            <div>
              <div className="text-white font-bold text-lg leading-tight">CCSF</div>
              <div className="text-gray-400 text-xs">Logistique</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-light hover:text-white transition-colors shrink-0"
            aria-label="Fermer le menu"
          >
            <RiMenuFoldLine className="text-xl" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.to} {...item} onClick={handleNavClick} />)}

          <div className="pt-2">
            <button
              onClick={() => setReperOpen(o => !o)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-primary-light hover:text-white w-full transition-colors"
            >
              <RiTeamLine className="text-lg shrink-0" />
              <span className="flex-1 text-left">Répertoire</span>
              <span className="text-xs">{reperOpen ? '▾' : '▸'}</span>
            </button>
            {reperOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {reperItems.map(item => <NavItem key={item.to} {...item} onClick={handleNavClick} />)}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-primary-light shrink-0">
          <div className="px-4 py-2 mb-2">
            <div className="text-white text-sm font-medium truncate">{user?.nom}</div>
            <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white w-full transition-colors"
          >
            <RiLogoutBoxLine className="text-lg shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
