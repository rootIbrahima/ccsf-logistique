import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { setAccessToken, getAccessToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const tryRefresh = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh')
      setAccessToken(data.accessToken)
      // Décoder le user depuis le token
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
      setUser({ id: payload.id, email: payload.email, role: payload.role, nom: payload.nom })
      return true
    } catch {
      setAccessToken(null)
      setUser(null)
      return false
    }
  }, [])

  useEffect(() => {
    tryRefresh().finally(() => setLoading(false))
  }, [tryRefresh])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
