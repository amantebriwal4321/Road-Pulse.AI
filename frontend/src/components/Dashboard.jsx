import { useState, useEffect } from 'react'

function StatCard({ label, value, icon, color = 'text-white', subtitle }) {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[150px]">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          {label}
        </p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {subtitle && (
          <p className="text-[9px] text-slate-500 -mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Road Health Score: 0–100 (higher = healthier)
 * Formula: 100 - (avgSeverity * 10)
 */
function computeRoadHealth(potholes) {
  if (!potholes.length) return { score: 100, grade: 'A+', color: 'text-green-400' }
  const avgSev = potholes.reduce((s, p) => s + p.severity, 0) / potholes.length
  const score = Math.max(0, Math.round(100 - avgSev * 10))
  let grade, color
  if (score >= 80) { grade = 'A'; color = 'text-green-400' }
  else if (score >= 60) { grade = 'B'; color = 'text-cyan-400' }
  else if (score >= 40) { grade = 'C'; color = 'text-amber-400' }
  else if (score >= 20) { grade = 'D'; color = 'text-orange-400' }
  else { grade = 'F'; color = 'text-red-400' }
  return { score, grade, color }
}

/**
 * Vehicle Damage Cost Estimator
 * Avg pothole damage = ₹3,500–₹8,000 per incident (tyres, suspension, alignment)
 * Estimated annual cost = openPotholes × avgReportCount × ₹500
 */
function estimateDamageCost(potholes) {
  if (!potholes.length) return '₹0'
  const totalReports = potholes.reduce((s, p) => s + p.report_count, 0)
  const cost = totalReports * 500 // ₹500 per affected driver
  if (cost >= 10000000) return `₹${(cost / 10000000).toFixed(1)}Cr`
  if (cost >= 100000) return `₹${(cost / 100000).toFixed(1)}L`
  if (cost >= 1000) return `₹${(cost / 1000).toFixed(0)}K`
  return `₹${cost}`
}

function getWorstWard(potholes) {
  if (!potholes.length) return '—'
  const wardStats = {}
  potholes.forEach((p) => {
    const ward = p.ward || 'Unknown'
    if (!wardStats[ward]) wardStats[ward] = { totalSev: 0, count: 0 }
    wardStats[ward].totalSev += p.severity
    wardStats[ward].count += 1
  })
  let worst = '—', worstScore = 0
  Object.entries(wardStats).forEach(([ward, s]) => {
    // Score = count × avgSeverity (prioritize both density and severity)
    const score = s.count * (s.totalSev / s.count)
    if (score > worstScore) { worstScore = score; worst = ward }
  })
  return worst
}

export default function Dashboard({ potholes = [] }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const totalOpen = potholes.length
  const criticalCount = potholes.filter((p) => p.severity >= 9).length
  const highCount = potholes.filter((p) => p.severity >= 7 && p.severity < 9).length
  const health = computeRoadHealth(potholes)
  const damageCost = estimateDamageCost(potholes)
  const worstWard = getWorstWard(potholes)

  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Road Health Score */}
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[150px]">
        <div className="relative w-10 h-10">
          <svg viewBox="0 0 36 36" className="w-10 h-10 transform -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#334155" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke={health.score >= 60 ? '#22c55e' : health.score >= 30 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${health.score} ${100 - health.score}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${health.color}`}>
            {health.grade}
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Road Health
          </p>
          <p className={`text-xl font-bold ${health.color}`}>{health.score}</p>
        </div>
      </div>

      <StatCard label="Open Potholes" value={totalOpen} icon="🕳️" color="text-blue-400" />
      <StatCard label="Critical" value={criticalCount} icon="🔴" color="text-red-400" />
      <StatCard label="High" value={highCount} icon="🟠" color="text-orange-400" />
      <StatCard
        label="Worst Road"
        value={worstWard}
        icon="⚠️"
        color="text-amber-400"
      />
      <StatCard
        label="Est. Damage"
        value={damageCost}
        icon="💰"
        color="text-yellow-400"
        subtitle="annual vehicle cost"
      />
      <StatCard label="Last Updated" value={timeStr} icon="🕐" color="text-cyan-400" />
    </div>
  )
}
