import { useState, useEffect, useCallback, useRef } from 'react'
import { getPotholes } from '../services/api'

/**
 * Polls GET /potholes every 5 seconds.
 * Returns: { potholes, loading, error, refetch }
 * On error: logs to console, keeps last successful data, never crashes.
 */
export default function usePotholes() {
  const [potholes, setPotholes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const lastGoodData = useRef([])

  const fetchPotholes = useCallback(async () => {
    try {
      const data = await getPotholes()
      setPotholes(data)
      lastGoodData.current = data
      setError(null)
    } catch (err) {
      console.error('Failed to fetch potholes:', err)
      setError(err.message || 'Failed to fetch potholes')
      // Keep last successful data visible on map
      setPotholes(lastGoodData.current)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPotholes()
    const interval = setInterval(fetchPotholes, 5000)
    return () => clearInterval(interval)
  }, [fetchPotholes])

  return { potholes, loading, error, refetch: fetchPotholes }
}
