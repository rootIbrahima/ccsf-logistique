import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

import Login              from './pages/Login'
import Dashboard          from './pages/Dashboard'
import Carte              from './pages/Carte'
import FeuillesDeRoute    from './pages/FeuillesDeRoute'
import NouvelleFeuilleDeRoute from './pages/NouvelleFeuilleDeRoute'
import DetailFeuilleDeRoute   from './pages/DetailFeuilleDeRoute'
import Dotations          from './pages/Dotations'
import NouvelleDotation   from './pages/NouvelleDotation'
import Repertoire         from './pages/Repertoire'
import ListeChauffeurs    from './pages/ListeChauffeurs'
import NouveauChauffeur   from './pages/NouveauChauffeur'
import FicheDetailChauffeur from './pages/FicheDetailChauffeur'
import ListeVehicules       from './pages/ListeVehicules'
import NouveauVehicule      from './pages/NouveauVehicule'
import FicheDetailVehicule  from './pages/FicheDetailVehicule'

function AppLayout({ children }) {
  const [open, setOpen] = useState(() => window.innerWidth >= 768)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Backdrop mobile : overlay sous la TopBar (z-[19] < TopBar z-20) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[19]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* TopBar : pleine largeur sur mobile, décalée sur desktop seulement */}
      <TopBar open={open} onOpen={() => setOpen(true)} />

      {/* Contenu : overlay sur mobile (pas de décalage), push sur desktop */}
      <div className={`transition-all duration-300 pt-14 px-4 pb-4 md:px-6 md:pb-6 ${open ? 'md:ml-64' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/carte" element={
        <ProtectedRoute><AppLayout><Carte /></AppLayout></ProtectedRoute>
      } />
      <Route path="/feuilles-de-route" element={
        <ProtectedRoute><AppLayout><FeuillesDeRoute /></AppLayout></ProtectedRoute>
      } />
      <Route path="/feuilles-de-route/new" element={
        <ProtectedRoute><AppLayout><NouvelleFeuilleDeRoute /></AppLayout></ProtectedRoute>
      } />
      <Route path="/feuilles-de-route/:id" element={
        <ProtectedRoute><AppLayout><DetailFeuilleDeRoute /></AppLayout></ProtectedRoute>
      } />
      <Route path="/dotations" element={
        <ProtectedRoute><AppLayout><Dotations /></AppLayout></ProtectedRoute>
      } />
      <Route path="/dotations/new" element={
        <ProtectedRoute><AppLayout><NouvelleDotation /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire" element={
        <ProtectedRoute><AppLayout><Repertoire /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/chauffeurs" element={
        <ProtectedRoute><AppLayout><ListeChauffeurs /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/chauffeurs/new" element={
        <ProtectedRoute><AppLayout><NouveauChauffeur /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/chauffeurs/:id" element={
        <ProtectedRoute><AppLayout><FicheDetailChauffeur /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/vehicules" element={
        <ProtectedRoute><AppLayout><ListeVehicules /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/vehicules/new" element={
        <ProtectedRoute><AppLayout><NouveauVehicule /></AppLayout></ProtectedRoute>
      } />
      <Route path="/repertoire/vehicules/:id" element={
        <ProtectedRoute><AppLayout><FicheDetailVehicule /></AppLayout></ProtectedRoute>
      } />
    </Routes>
  )
}
