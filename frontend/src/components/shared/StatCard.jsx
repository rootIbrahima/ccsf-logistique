export default function StatCard({ icon: Icon, label, value, trend, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-accent text-white',
    blue:   'bg-blue-500 text-white',
    green:  'bg-green-600 text-white',
    red:    'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.accent}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
        {trend != null && (
          <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}% ce mois
          </p>
        )}
      </div>
    </div>
  )
}
