import { useState } from 'react'

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  function goToPage(n) { setPage(n) }
  function nextPage() { setPage(p => p + 1) }
  function prevPage() { setPage(p => Math.max(1, p - 1)) }
  function reset() { setPage(1) }

  return { page, limit, goToPage, nextPage, prevPage, reset }
}
