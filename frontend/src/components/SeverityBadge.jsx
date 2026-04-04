/**
 * Color-coded severity pill badge.
 * 0–3.9: green "Low"  |  4–6.9: amber "Medium"  |  7–8.9: red "High"  |  9–10: dark red "Critical"
 */
export default function SeverityBadge({ severity }) {
  let label, bgColor, textColor

  if (severity >= 9) {
    label = 'Critical'
    bgColor = 'bg-red-900/80'
    textColor = 'text-red-200'
  } else if (severity >= 7) {
    label = 'High'
    bgColor = 'bg-red-600/80'
    textColor = 'text-red-100'
  } else if (severity >= 4) {
    label = 'Medium'
    bgColor = 'bg-amber-600/80'
    textColor = 'text-amber-100'
  } else {
    label = 'Low'
    bgColor = 'bg-green-600/80'
    textColor = 'text-green-100'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}
