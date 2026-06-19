import { useState, useEffect } from 'react'
import api from '../services/api'
import { useDebounce } from './useDebounce'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ chauffeurs: [], vehicules: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ chauffeurs: [], vehicules: [] })
      return
    }

    setLoading(true)
    setError(null)

    api.get('/repertoire/search', { params: { q: debouncedQuery } })
      .then(({ data }) => setResults(data))
      .catch(() => setError('Erreur lors de la recherche'))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  return { query, setQuery, results, loading, error }
}
