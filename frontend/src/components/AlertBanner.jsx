import { useState, useEffect } from 'react'

/**
 * Red alert banner for newly confirmed critical potholes.
 * Auto-dismisses after 8 seconds. Can be manually closed.
 */
export default function AlertBanner({ alert, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (alert) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [alert, onDismiss])

  if (!alert || !visible) return null

  return (
    <div className="animate-slide-down bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90 
                    border-b border-red-700/50 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-pulse">🚨</span>
        <div>
          <p className="text-sm font-semibold text-red-100">
            New critical pothole detected at {alert.ward || 'Unknown'}!
          </p>
          <p className="text-xs text-red-300">
            Severity {alert.severity?.toFixed(1)}/10 — SMS alert sent to municipality
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          setVisible(false)
          onDismiss?.()
        }}
        className="text-red-300 hover:text-white text-lg px-2 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
