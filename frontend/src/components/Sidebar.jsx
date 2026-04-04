import { useMemo, useState } from 'react'
import SeverityBadge from './SeverityBadge'

/**
 * Collapsible sidebar showing ward-by-ward pothole breakdown.
 * Each ward row: name, pothole count, avg severity, severity bar.
 */
export default function Sidebar({ potholes = [], onWardClick }) {
  const [open, setOpen] = useState(false)

  const wards = useMemo(() => {
    const map = {}
    potholes.forEach((p) => {
      const ward = p.ward || 'Unknown'
      if (!map[ward]) map[ward] = { name: ward, count: 0, totalSev: 0, lat: 0, lng: 0 }
      map[ward].count += 1
      map[ward].totalSev += p.severity
      map[ward].lat += p.lat
      map[ward].lng += p.lng
    })
    return Object.values(map)
      .map((w) => ({
        ...w,
        avgSev: w.totalSev / w.count,
        lat: w.lat / w.count,
        lng: w.lng / w.count,
      }))
      .sort((a, b) => b.avgSev - a.avgSev)
  }, [potholes])

  const totalReports = potholes.reduce((s, p) => s + p.report_count, 0)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-20 left-4 z-[1000] glass rounded-lg px-3 py-2 
                   text-xs font-semibold text-slate-300 hover:text-white
                   transition-all duration-300 hover:scale-105
                   ${open ? 'bg-cyan-600/30 border-cyan-500/50' : ''}`}
      >
        {open ? '✕ Close' : '📊 Wards'}
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed top-32 left-4 z-[1000] w-72 max-h-[calc(100vh-160px)] 
                   glass rounded-2xl overflow-hidden
                   transition-all duration-300 transform origin-top-left
                   ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-bold text-white">Ward Breakdown</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {wards.length} wards • {totalReports.toLocaleString()} total reports
          </p>
        </div>

        {/* Ward list */}
        <div className="overflow-y-auto max-h-[calc(100vh-220px)] p-2 space-y-1.5">
          {wards.map((ward) => (
            <button
              key={ward.name}
              onClick={() => onWardClick?.(ward.lat, ward.lng)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-700/50 
                        transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {ward.name}
                </span>
                <SeverityBadge severity={ward.avgSev} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(ward.avgSev / 10) * 100}%`,
                      backgroundColor:
                        ward.avgSev >= 9 ? '#991b1b' :
                        ward.avgSev >= 7 ? '#ef4444' :
                        ward.avgSev >= 4 ? '#f59e0b' : '#22c55e',
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono w-8 text-right">
                  {ward.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
