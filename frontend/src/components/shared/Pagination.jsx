export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Préc.
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            p === page
              ? 'bg-accent border-accent text-white font-medium'
              : 'border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Suiv.
      </button>
    </div>
  )
}
