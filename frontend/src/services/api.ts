import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export interface PotholeData {
  id: string;
  lat: number;
  lng: number;
  severity: number;
  report_count: number;
  status: string;
  ward: string | null;
  first_reported: string;
  last_reported: string;
}

export interface ReportRequest {
  lat: number;
  lng: number;
  severity_raw: number;
  speed_kmh: number;
  device_id: string;
}

export interface ReportResponse {
  pothole_confirmed: boolean;
  pothole_id?: string;
  severity?: number;
  confidence?: number;
  message: string;
  error?: boolean;
}

export async function getPotholes(minSeverity = 0): Promise<PotholeData[]> {
  const res = await api.get<PotholeData[]>("/potholes", {
    params: { min_severity: minSeverity },
  });
  return res.data;
}

export async function reportPothole(
  data: ReportRequest,
): Promise<ReportResponse> {
  const res = await api.post<ReportResponse>("/report", data);
  return res.data;
}

export async function reportBulkPotholes(
  data: ReportRequest[],
): Promise<ReportResponse[]> {
  const res = await api.post<ReportResponse[]>("/report/bulk", data);
  return res.data;
}

export async function markFixed(id: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(`/pothole/${id}/fix`);
  return res.data;
}

export default api;
