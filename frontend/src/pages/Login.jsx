import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RiTruckLine, RiMailLine, RiLockLine, RiLoginBoxLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  })

  async function onSubmit(data) {
    setApiError('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <RiTruckLine className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CCSF Logistique</h1>
          <p className="text-gray-500 text-sm mt-1">Comptoir Commercial SALL et Frères</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <RiMailLine className="inline mr-1.5 text-gray-400" />
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="admin@ccsf.sn"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <RiLockLine className="inline mr-1.5 text-gray-400" />
              Mot de passe
            </label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            <RiLoginBoxLine />
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
