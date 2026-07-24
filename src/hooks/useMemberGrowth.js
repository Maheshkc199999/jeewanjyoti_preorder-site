import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export default function useMemberGrowth() {
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    apiRequest('/api/member-growth/')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText || 'Failed to fetch')
        return res.json()
      })
      .then((json) => {
        if (!mounted) return
        setWeekly(Array.isArray(json.weekly) ? json.weekly : [])
        setMonthly(Array.isArray(json.monthly) ? json.monthly : [])
      })
      .catch((err) => { if (mounted) setError(err) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [])

  return { weekly, monthly, loading, error }
}
