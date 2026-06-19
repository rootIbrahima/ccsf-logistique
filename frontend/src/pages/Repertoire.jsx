import SearchRepertoire from '../components/shared/SearchRepertoire'

export default function Repertoire() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-sm text-gray-500 mb-4">
          Recherchez un chauffeur ou un véhicule pour créer une nouvelle mission.
        </p>
        <SearchRepertoire />
      </div>
    </div>
  )
}
