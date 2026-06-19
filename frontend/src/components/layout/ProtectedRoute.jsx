import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
