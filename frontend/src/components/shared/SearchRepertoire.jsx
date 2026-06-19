import { RiSearchLine, RiLoader4Line } from 'react-icons/ri'
import { useSearch } from '../../hooks/useSearch'
import FicheChauffeur from './FicheChauffeur'

export default function SearchRepertoire({ onSelectChauffeur }) {
  const { query, setQuery, results, loading, error } = useSearch()

  const hasResults = results.chauffeurs.length > 0 || results.vehicules.length > 0

  return (
    <div className="w-full">
      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un chauffeur, un véhicule..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        {loading && (
          <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {query.trim() && !loading && (
        <div className="mt-4">
          {!hasResults ? (
            <p className="text-gray-500 text-sm text-center py-6">Aucun résultat pour "{query}"</p>
          ) : (
            <>
              {results.chauffeurs.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Chauffeurs ({results.chauffeurs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.chauffeurs.map(c => (
                      <FicheChauffeur
                        key={c.id}
                        chauffeur={c}
                        onSelect={onSelectChauffeur}
                        showMissionBtn={!!onSelectChauffeur}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
