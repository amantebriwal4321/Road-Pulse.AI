import { useState, useRef } from 'react'
import { reportPothole } from '../services/api'

/**
 * Simulator hook for demo: generates a fake bump report at given coordinates.
 * Returns { simulateBump, loading, lastResult }
 * Debounced: ignores rapid clicks within 1 second.
 */
export default function useSimulator() {
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const debounceRef = useRef(false)

  async function simulateBump(lat, lng) {
    // Debounce: prevent duplicate requests within 1s
    if (debounceRef.current) return null
    debounceRef.current = true
    setTimeout(() => { debounceRef.current = false }, 1000)

    setLoading(true)
    try {
      const data = {
        lat,
        lng,
        severity_raw: Math.round((Math.random() * 4.8 + 5.0) * 10) / 10, // 5.0–9.8
        speed_kmh: Math.round((Math.random() * 40 + 20) * 10) / 10,      // 20–60
        device_id: `demo-device-${Math.floor(1000 + Math.random() * 9000)}`,
      }

      const result = await reportPothole(data)
      setLastResult(result)
      return result
    } catch (err) {
      console.error('Simulate bump failed:', err)
      const errorResult = { message: 'Failed to report', pothole_confirmed: false, error: true }
      setLastResult(errorResult)
      return errorResult
    } finally {
      setLoading(false)
    }
  }

  return { simulateBump, loading, lastResult }
}
