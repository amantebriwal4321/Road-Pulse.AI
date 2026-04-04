import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import SeverityBadge from './SeverityBadge'
import { markFixed } from '../services/api'

// Severity → marker color mapping
function getSeverityColor(severity) {
  if (severity >= 9) return '#991b1b'   // dark red — critical
  if (severity >= 7) return '#ef4444'   // red — high
  if (severity >= 4) return '#f59e0b'   // amber — medium
  return '#22c55e'                       // green — low
}

// Severity → marker radius (severity 10 = 30px)
function getMarkerRadius(severity) {
  return Math.max(6, Math.min(30, severity * 3))
}

// Format date nicely
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Internal component to handle map center changes
function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 13, { duration: 1.5 })
  }, [center, zoom, map])
  return null
}

// Exposes the Leaflet map instance to the parent via callback
function MapRefSetter({ onMapRef }) {
  const map = useMap()
  useEffect(() => {
    if (onMapRef) onMapRef(map)
  }, [map, onMapRef])
  return null
}

export default function MapView({ potholes = [], mapCenter, mapZoom, onMapRef }) {
  const defaultCenter = [12.9716, 77.5946] // Bengaluru
  const defaultZoom = 12

  async function handleMarkFixed(id) {
    try {
      await markFixed(id)
    } catch (err) {
      console.error('Failed to mark fixed:', err)
    }
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="w-full h-full"
      zoomControl={true}
    >
      <MapRefSetter onMapRef={onMapRef} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CartoDB</a>'
        maxZoom={19}
      />

      {mapCenter && (
        <MapController center={mapCenter} zoom={mapZoom || 15} />
      )}

      {potholes.map((pothole) => (
        <CircleMarker
          key={pothole.id}
          center={[pothole.lat, pothole.lng]}
          radius={getMarkerRadius(pothole.severity)}
          pathOptions={{
            color: getSeverityColor(pothole.severity),
            fillColor: getSeverityColor(pothole.severity),
            fillOpacity: 0.7,
            weight: 2,
            opacity: 0.9,
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              {/* Severity header */}
              <div className="flex items-center justify-between mb-2">
                <SeverityBadge severity={pothole.severity} />
                <span className="text-sm font-mono font-bold text-slate-200">
                  {pothole.severity.toFixed(1)}/10
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reports</span>
                  <span className="font-medium">
                    {pothole.report_count} driver{pothole.report_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ward</span>
                  <span className="font-medium">{pothole.ward || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">First reported</span>
                  <span className="font-medium">{formatDate(pothole.first_reported)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium capitalize ${
                    pothole.status === 'open' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {pothole.status}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Coords</span>
                  <span className="font-mono text-slate-500">
                    {pothole.lat.toFixed(4)}, {pothole.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Mark as fixed button */}
              {pothole.status === 'open' && (
                <button
                  onClick={() => handleMarkFixed(pothole.id)}
                  className="mt-3 w-full py-1.5 px-3 bg-green-600 hover:bg-green-500 
                             text-white text-xs font-semibold rounded-lg 
                             transition-colors duration-200"
                >
                  ✓ Mark as Fixed
                </button>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
