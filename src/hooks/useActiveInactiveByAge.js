import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export default function useActiveInactiveByAge() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    apiRequest('/api/active-inactive-by-age/')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText || 'Failed to fetch')
        return res.json()
      })
      .then((json) => { if (mounted) setGroups(Array.isArray(json.groups) ? json.groups : []) })
      .catch((err) => { if (mounted) setError(err) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [])

  return { groups, loading, error }
}
