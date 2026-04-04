import { useState, useEffect } from 'react'
import useSimulator from '../hooks/useSimulator'

/**
 * Toast notification component (auto-dismiss after 3s)
 */
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const colors = {
    success: 'from-green-600/90 to-green-700/90 border-green-500/50',
    info: 'from-blue-600/90 to-blue-700/90 border-blue-500/50',
    error: 'from-red-600/90 to-red-700/90 border-red-500/50',
  }

  return (
    <div className={`animate-slide-up fixed bottom-24 right-6 z-[9999] 
                     bg-gradient-to-r ${colors[type]} backdrop-blur-md 
                     border rounded-xl px-4 py-3 shadow-2xl max-w-sm`}>
      <p className="text-sm font-medium text-white">{message}</p>
    </div>
  )
}

/**
 * "Simulate Bump" button — fixed bottom-right on map.
 * On click → simulateBump at map center → shows toast result.
 */
export default function ReportButton({ getMapCenter, onPotholeConfirmed }) {
  const { simulateBump, loading } = useSimulator()
  const [toast, setToast] = useState(null)

  async function handleClick() {
    if (loading) return

    // Get the map center coordinates
    const center = getMapCenter?.()
    if (!center) {
      setToast({ message: 'Could not get map center', type: 'error' })
      return
    }

    const result = await simulateBump(center.lat, center.lng)
    if (!result) return // debounced

    if (result.error) {
      setToast({ message: '❌ Failed to report — check connection', type: 'error' })
    } else if (result.pothole_confirmed) {
      setToast({
        message: `✅ Pothole confirmed! Severity ${result.severity?.toFixed(1)}/10`,
        type: 'success',
      })
      // Trigger alert banner if critical
      if (result.severity >= 9) {
        onPotholeConfirmed?.({
          severity: result.severity,
          pothole_id: result.pothole_id,
          ward: 'Simulated',
        })
      }
    } else {
      const confidence = result.confidence || 0
      const needed = Math.ceil((1 - confidence) * 3)
      setToast({
        message: `📝 Report recorded (need ${needed} more to confirm)`,
        type: 'info',
      })
    }
  }

  return (
    <>
      {/* Simulate Bump Button */}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`fixed bottom-6 right-6 z-[1000] 
                   flex items-center gap-2 px-5 py-3.5 rounded-2xl
                   font-semibold text-sm shadow-2xl
                   transition-all duration-300 transform
                   ${loading
                     ? 'bg-slate-600 cursor-wait scale-95'
                     : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:scale-105 hover:shadow-red-500/30 active:scale-95'
                   }
                   text-white border border-red-400/30`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Reporting...</span>
          </>
        ) : (
          <>
            <span className="text-lg">📱</span>
            <span>Simulate Bump</span>
          </>
        )}
      </button>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}
