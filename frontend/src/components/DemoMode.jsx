import { useState, useRef, useEffect } from 'react'
import { reportPothole } from '../services/api'

// 8 Bengaluru hotspot coordinates for auto-simulation
const HOTSPOTS = [
  { lat: 12.9165, lng: 77.6229, name: 'Silk Board' },
  { lat: 12.9591, lng: 77.6974, name: 'Marathahalli' },
  { lat: 12.9352, lng: 77.6245, name: 'Koramangala' },
  { lat: 12.9698, lng: 77.7500, name: 'Whitefield' },
  { lat: 12.9982, lng: 77.5474, name: 'Yeshwanthpur' },
  { lat: 13.0206, lng: 77.5970, name: 'HEBBAL' },
  { lat: 12.9822, lng: 77.6370, name: 'KR Puram' },
  { lat: 12.9081, lng: 77.6476, name: 'BTM Layout' },
]

/**
 * Demo Mode: Toggleable auto-simulator that sends fake reports every 2 seconds
 * at random hotspot locations. Perfect for hackathon live demo.
 */
export default function DemoMode({ onNew }) {
  const [active, setActive] = useState(false)
  const [reportsSent, setReportsSent] = useState(0)
  const intervalRef = useRef(null)

  function sendRandomReport() {
    const spot = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)]
    const lat = spot.lat + (Math.random() - 0.5) * 0.005
    const lng = spot.lng + (Math.random() - 0.5) * 0.005

    const data = {
      lat,
      lng,
      severity_raw: Math.round((Math.random() * 5 + 5) * 10) / 10, // 5.0–10.0
      speed_kmh: Math.round((Math.random() * 40 + 20) * 10) / 10,
      device_id: `demo-auto-${Math.floor(Math.random() * 9999)}`,
    }

    reportPothole(data)
      .then((result) => {
        setReportsSent((c) => c + 1)
        if (result.pothole_confirmed) {
          onNew?.({
            severity: result.severity,
            ward: spot.name,
            pothole_id: result.pothole_id,
          })
        }
      })
      .catch(() => {})
  }

  function toggle() {
    if (active) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setActive(false)
    } else {
      setActive(true)
      setReportsSent(0)
      intervalRef.current = setInterval(sendRandomReport, 2000)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] 
                 flex items-center gap-2 px-5 py-3 rounded-2xl
                 font-semibold text-sm shadow-2xl
                 transition-all duration-300 transform hover:scale-105
                 ${active
                   ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-400/30 animate-pulse-slow'
                   : 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-500/30 hover:from-slate-600 hover:to-slate-500'
                 }
                 text-white border`}
    >
      {active ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Demo Live — {reportsSent} reports</span>
          <span className="text-xs opacity-60">⬛ Stop</span>
        </>
      ) : (
        <>
          <span>🎬</span>
          <span>Start Demo Mode</span>
        </>
      )}
    </button>
  )
}
