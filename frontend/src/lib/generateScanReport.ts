/**
 * generateScanReport — builds a polished RoadPulse PDF from simulation/scan data
 * using jsPDF.  Shared between the Citizen Hub simulation and Municipality exports.
 */
import jsPDF from "jspdf";
import type { DriveSimState, SimDetection } from "@/components/DriveSim";

/* ── colour helpers ──────────────────────────────────────────── */
const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

function sevColor(s: number): string {
  if (s >= 7) return "#ef4444";
  if (s >= 4) return "#f59e0b";
  return "#22c55e";
}
function sevLabel(s: number): string {
  if (s >= 7) return "HIGH";
  if (s >= 4) return "MEDIUM";
  return "LOW";
}

/* ── public types ────────────────────────────────────────────── */
export interface ScanReportData {
  /** Simulation telemetry at stop time */
  simState: DriveSimState;
  /** When the simulation started */
  startedAt: Date;
  /** When the simulation was stopped */
  stoppedAt: Date;
}

// Module-level storage so Municipality page can also download the same report
let _lastReport: ScanReportData | null = null;

export function setLastScanReport(data: ScanReportData) {
  _lastReport = data;
}
export function getLastScanReport(): ScanReportData | null {
  return _lastReport;
}

/* ── PDF generator ───────────────────────────────────────────── */
export function generateScanReport(data: ScanReportData): void {
  const { simState, startedAt, stoppedAt } = data;
  const { speed, distanceKm, scanCount, detections } = simState;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  /* ── Header band ──────────────────────────────────────────── */
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("ROADPULSE", 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("DIGITAL TWIN SCAN REPORT", 14, 23);

  // Date & report ID on right
  const reportId = `RP-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(reportId, W - 14, 14, { align: "right" });
  doc.text(stoppedAt.toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  }), W - 14, 20, { align: "right" });
  doc.text(stoppedAt.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  }), W - 14, 26, { align: "right" });

  y = 46;

  /* ── Summary metrics row ──────────────────────────────────── */
  const durationMs = stoppedAt.getTime() - startedAt.getTime();
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);

  const highCount = detections.filter((d) => d.severity >= 7).length;
  const medCount = detections.filter((d) => d.severity >= 4 && d.severity < 7).length;
  const lowCount = detections.filter((d) => d.severity < 4).length;

  const metrics = [
    { label: "DISTANCE", value: `${distanceKm} km` },
    { label: "DURATION", value: `${durationMin}m ${durationSec}s` },
    { label: "SCANS", value: String(scanCount) },
    { label: "DETECTIONS", value: String(detections.length) },
  ];

  const colW = (W - 28) / 4;
  metrics.forEach((m, i) => {
    const x = 14 + i * colW;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, colW - 4, 20, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, x + (colW - 4) / 2, y + 10, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + (colW - 4) / 2, y + 16, { align: "center" });
  });

  y += 28;

  /* ── Severity distribution ────────────────────────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("SEVERITY DISTRIBUTION", 14, y);
  y += 6;

  const sevItems = [
    { label: "HIGH (≥7)", count: highCount, color: "#ef4444", pct: detections.length ? Math.round((highCount / detections.length) * 100) : 0 },
    { label: "MEDIUM (4-7)", count: medCount, color: "#f59e0b", pct: detections.length ? Math.round((medCount / detections.length) * 100) : 0 },
    { label: "LOW (<4)", count: lowCount, color: "#22c55e", pct: detections.length ? Math.round((lowCount / detections.length) * 100) : 0 },
  ];

  sevItems.forEach((s) => {
    const rgb = hexToRgb(s.color);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.circle(18, y + 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${s.label}:  ${s.count}  (${s.pct}%)`, 24, y + 3.5);

    // progress bar
    const barX = 90;
    const barW = W - 90 - 14;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barX, y, barW, 5, 2, 2, "F");
    if (s.pct > 0) {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.roundedRect(barX, y, Math.max(4, barW * (s.pct / 100)), 5, 2, 2, "F");
    }
    y += 10;
  });

  y += 4;

  /* ── Detections table ─────────────────────────────────────── */
  if (detections.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("DETECTED POTHOLES", 14, y);
    y += 6;

    // Table header
    const cols = [
      { x: 14, w: 12, label: "#" },
      { x: 26, w: 32, label: "WARD" },
      { x: 58, w: 24, label: "SEVERITY" },
      { x: 82, w: 22, label: "LEVEL" },
      { x: 104, w: 28, label: "LATITUDE" },
      { x: 132, w: 28, label: "LONGITUDE" },
      { x: 160, w: 36, label: "DETECTED AT" },
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, W - 28, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    cols.forEach((c) => {
      doc.text(c.label, c.x + 2, y + 5);
    });
    y += 9;

    detections.forEach((det, i) => {
      if (y > 270) {
        doc.addPage();
        y = 14;
      }

      // Alternating row bg
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 2, W - 28, 8, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);

      doc.text(String(i + 1), 16, y + 3);
      doc.text(det.ward || "—", 28, y + 3);

      // Severity with colour
      const rgb = hexToRgb(sevColor(det.severity));
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      doc.setFont("helvetica", "bold");
      doc.text(det.severity.toFixed(1), 60, y + 3);

      doc.setFontSize(6);
      doc.text(sevLabel(det.severity), 84, y + 3);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7);
      doc.text(det.lat.toFixed(5), 106, y + 3);
      doc.text(det.lng.toFixed(5), 134, y + 3);

      const time = new Date(det.detectedAt);
      doc.text(time.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }), 162, y + 3);

      y += 8;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No potholes detected during this scan.", 14, y + 4);
    y += 12;
  }

  /* ── Footer ───────────────────────────────────────────────── */
  y = Math.max(y + 10, 260);
  if (y > 270) { doc.addPage(); y = 14; }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, W - 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Generated by RoadPulse Digital Twin Platform", 14, y);
  doc.text("roadpulse.ai · Bengaluru, India", 14, y + 4);
  doc.text(`Report ID: ${reportId}`, W - 14, y, { align: "right" });
  doc.text("Confidential — For Municipal Use Only", W - 14, y + 4, { align: "right" });

  /* ── Save ──────────────────────────────────────────────────── */
  const filename = `RoadPulse_Scan_Report_${reportId}.pdf`;
  doc.save(filename);
}
