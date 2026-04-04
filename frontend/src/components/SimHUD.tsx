/**
 * SimHUD — Heads-up display overlay for the vehicle simulation.
 */
import { motion, AnimatePresence } from "framer-motion";
import type { DriveSimState, SimDetection } from "@/components/DriveSim";
import {
  Gauge,
  Route,
  Radar,
  AlertTriangle,
  StopCircle,
  Zap,
  ShieldAlert,
} from "lucide-react";

interface SimHUDProps {
  simState: DriveSimState;
  onStop: () => void;
}

function sevColor(s: number): string {
  if (s >= 7) return "#ef4444";
  if (s >= 4) return "#f59e0b";
  return "#22c55e";
}

export function SimHUD({ simState, onStop }: SimHUDProps) {
  const { speed, distanceKm, scanCount, detections, progress, active } =
    simState;

  if (!active) return null;

  const recentDetections = detections.slice(-3).reverse();

  return (
    <>
      {/* ── Top HUD bar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sim-hud-top"
      >
        <div className="sim-hud-live">
          <span className="sim-hud-live-dot" />
          <span className="sim-hud-live-text">SIMULATION ACTIVE</span>
        </div>

        <div className="sim-hud-stats">
          <div className="sim-hud-stat">
            <Gauge size={14} className="sim-hud-stat-icon" />
            <div>
              <span className="sim-hud-stat-value">{speed}</span>
              <span className="sim-hud-stat-unit">km/h</span>
            </div>
          </div>

          <div className="sim-hud-stat-sep" />

          <div className="sim-hud-stat">
            <Route size={14} className="sim-hud-stat-icon" />
            <div>
              <span className="sim-hud-stat-value">{distanceKm}</span>
              <span className="sim-hud-stat-unit">km</span>
            </div>
          </div>

          <div className="sim-hud-stat-sep" />

          <div className="sim-hud-stat">
            <Radar size={14} className="sim-hud-stat-icon" />
            <div>
              <span className="sim-hud-stat-value">{scanCount}</span>
              <span className="sim-hud-stat-unit">scans</span>
            </div>
          </div>

          <div className="sim-hud-stat-sep" />

          <div className="sim-hud-stat">
            <ShieldAlert
              size={14}
              className="sim-hud-stat-icon"
              style={{ color: detections.length > 0 ? "#ef4444" : undefined }}
            />
            <div>
              <span
                className="sim-hud-stat-value"
                style={{ color: detections.length > 0 ? "#ef4444" : undefined }}
              >
                {detections.length}
              </span>
              <span className="sim-hud-stat-unit">found</span>
            </div>
          </div>
        </div>

        <button className="sim-hud-stop" onClick={onStop}>
          <StopCircle size={14} />
          STOP
        </button>

        <div className="sim-hud-progress-track">
          <motion.div
            className="sim-hud-progress-fill"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* ── Detection feed (bottom-left) ─────────────────────────── */}
      <AnimatePresence>
        {recentDetections.length > 0 && (
          <motion.div
            className="sim-detection-feed"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sim-detection-feed-header">
              <Zap size={12} className="sim-detection-feed-icon" />
              <span>LIVE DETECTIONS</span>
            </div>
            {recentDetections.map((det, i) => (
              <DetectionItem key={det.id} det={det} isLatest={i === 0} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetectionItem({
  det,
  isLatest,
}: {
  det: SimDetection;
  isLatest: boolean;
}) {
  const isHigh = det.severity >= 7;

  return (
    <motion.div
      initial={isLatest ? { scale: 0.9, opacity: 0 } : {}}
      animate={{ scale: 1, opacity: 1 }}
      className={`sim-detection-item ${isLatest ? "latest" : ""}`}
    >
      <AlertTriangle
        size={12}
        style={{ color: sevColor(det.severity), flexShrink: 0 }}
      />
      <div className="sim-detection-item-content">
        <span className="sim-detection-item-label">
          {isHigh ? "HIGH" : "MEDIUM"} · Sev {det.severity.toFixed(1)}
        </span>
        <span className="sim-detection-item-meta">
          {det.ward}
        </span>
      </div>
      <span
        className="sim-detection-item-sev"
        style={{
          background: isHigh
            ? "rgba(239,68,68,0.15)"
            : "rgba(245,158,11,0.15)",
          color: sevColor(det.severity),
        }}
      >
        {det.severity.toFixed(1)}
      </span>
    </motion.div>
  );
}
