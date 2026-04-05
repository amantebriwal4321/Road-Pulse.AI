import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { useEffect, useCallback, type ReactNode } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { PotholeData } from "@/services/api";
import { markFixed } from "@/services/api";
import { UserLocationMarker } from "@/components/UserLocationMarker";
import { AnimatedRoute } from "@/components/AnimatedRoute";
import "leaflet/dist/leaflet.css";

/** ─── Severity helpers ─────────────────────────────────────── */
function getSeverityColor(severity: number): string {
  if (severity >= 7) return "#ef4444"; // red
  if (severity >= 4) return "#f59e0b"; // amber
  return "#22c55e"; // green
}

function getSeverityLabel(severity: number): string {
  if (severity >= 7) return "HIGH";
  if (severity >= 4) return "MEDIUM";
  return "LOW";
}

function getMarkerRadius(severity: number): number {
  return Math.max(4, Math.min(10, severity * 1.1));
}

/** ─── Internal sub-components ─────────────────────────────── */
function MapRefSetter({ onMapRef }: { onMapRef: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapRef(map);
  }, [map, onMapRef]);
  return null;
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

/** ─── Tile configs ──────────────────────────────────────────── */
const TILES = {
  // Clean light map — CartoDB Positron  ← NEW DEFAULT for all citizen views
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CartoDB</a>',
  },
  // Dark map — CartoDB DarkMatter (kept for municipality / drive views)
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CartoDB</a>',
  },
} as const;

/** ─── Props ─────────────────────────────────────────────────── */
interface LiveMapProps {
  potholes: PotholeData[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  flyTo?: [number, number] | null;
  flyToZoom?: number;
  onMapRef?: (map: LeafletMap) => void;
  showPopups?: boolean;
  tileMode?: "light" | "dark";
  userLocation?: [number, number] | null;
  routePath?: [number, number][] | null;
  routeDistanceKm?: number;
  routePotholesCount?: number;
  /** Children rendered inside MapContainer (e.g. DriveSim) */
  children?: ReactNode;
}

/** ─── Component ─────────────────────────────────────────────── */
export function LiveMap({
  potholes,
  height = "100%",
  center = [12.9716, 77.5946],
  zoom = 12,
  flyTo = null,
  flyToZoom = 15,
  onMapRef,
  showPopups = true,
  tileMode = "light",
  userLocation = null,
  routePath = null,
  routeDistanceKm,
  routePotholesCount,
  children,
}: LiveMapProps) {
  const tile = TILES[tileMode];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%", borderRadius: "0.5rem" }}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={19} />

      {onMapRef ? <MapRefSetter onMapRef={onMapRef} /> : null}
      {flyTo ? <FlyTo center={flyTo} zoom={flyToZoom} /> : null}
      {userLocation ? (
        <UserLocationMarker coords={userLocation} centerOnFirst />
      ) : null}

      {routePath && routePath.length > 1 && (
        <AnimatedRoute
          routePath={routePath}
          distanceKm={routeDistanceKm}
          potholesAvoided={routePotholesCount}
        />
      )}

      {potholes.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={getMarkerRadius(p.severity)}
          pathOptions={{
            color: getSeverityColor(p.severity),
            fillColor: getSeverityColor(p.severity),
            fillOpacity: 0.75,
            weight: 2,
            opacity: 0.9,
          }}
        >
          {showPopups ? (
            <Popup>
              <div
                style={{ minWidth: 200, fontFamily: "monospace", fontSize: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      backgroundColor: getSeverityColor(p.severity),
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {getSeverityLabel(p.severity)}
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    {p.severity.toFixed(1)}/10
                  </span>
                </div>
                <div style={{ lineHeight: 1.8 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ opacity: 0.6 }}>Reports</span>
                    <span>{p.report_count} drivers</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ opacity: 0.6 }}>Ward</span>
                    <span>{p.ward || "Unknown"}</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ opacity: 0.6 }}>Status</span>
                    <span
                      style={{
                        color: p.status === "open" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
                {p.status === "open" && (
                  <button
                    onClick={() => markFixed(p.id)}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      padding: "6px",
                      backgroundColor: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    ✓ Mark as Fixed
                  </button>
                )}
              </div>
            </Popup>
          ) : null}
        </CircleMarker>
      ))}

      {children}
    </MapContainer>
  );
}
