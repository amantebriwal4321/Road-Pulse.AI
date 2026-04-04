import axios from "axios";

// In production, set VITE_API_URL to your Railway backend URL
// e.g. https://roadpulse-backend-production.up.railway.app
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Get all open potholes, optionally filtered by minimum severity.
 */
export async function getPotholes(minSeverity = 0) {
  const res = await api.get("/potholes", {
    params: { min_severity: minSeverity },
  });
  return res.data;
}

/**
 * Submit a raw pothole report from a device/simulator.
 */
export async function reportPothole(data) {
  const res = await api.post("/report", data);
  return res.data;
}

/**
 * Mark a pothole as fixed.
 */
export async function markFixed(id) {
  const res = await api.post(`/pothole/${id}/fix`);
  return res.data;
}

/**
 * Reset all demo data.
 */
export async function resetDemo() {
  const res = await api.post("/reset");
  return res.data;
}

export default api;
