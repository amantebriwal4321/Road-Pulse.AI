/**
 * Map legend showing severity color coding.
 * Fixed bottom-left on map.
 */
export default function Legend() {
  const items = [
    { color: '#22c55e', label: 'Low (0–3.9)' },
    { color: '#f59e0b', label: 'Medium (4–6.9)' },
    { color: '#ef4444', label: 'High (7–8.9)' },
    { color: '#991b1b', label: 'Critical (9–10)' },
  ]

  return (
    <div className="fixed bottom-6 left-4 z-[1000] glass rounded-xl px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
        Severity
      </p>
      <div className="space-y-1">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] text-slate-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
