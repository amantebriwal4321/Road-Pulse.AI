import { create } from 'zustand';

interface EmergencyItem {
  id: string;
  roadName: string;
  ward: string;
  severityScore: number;
  reportCount: number;
  status: 'pending' | 'dispatched' | 'resolved';
}

interface MunicipalityState {
  emergencyQueue: EmergencyItem[];
  selectedReportId: string | null;
  dispatchCrew: (id: string) => void;
  markResolved: (id: string) => void;
  selectReport: (id: string) => void;
}

export const useMunicipalityStore = create<MunicipalityState>((set) => ({
  emergencyQueue: [
    { id: 'e1', roadName: 'Silk Board Junction', ward: 'Ward 52', severityScore: 9.4, reportCount: 47, status: 'pending' },
    { id: 'e2', roadName: 'Marathahalli Bridge', ward: 'Ward 83', severityScore: 8.7, reportCount: 34, status: 'pending' },
    { id: 'e3', roadName: 'Whitefield Main Rd', ward: 'Ward 85', severityScore: 8.2, reportCount: 28, status: 'pending' },
    { id: 'e4', roadName: 'Outer Ring Road', ward: 'Ward 74', severityScore: 7.9, reportCount: 21, status: 'pending' },
    { id: 'e5', roadName: 'Sarjapur Road', ward: 'Ward 67', severityScore: 7.5, reportCount: 19, status: 'pending' },
  ],
  selectedReportId: null,
  dispatchCrew: (id) => set((s) => ({
    emergencyQueue: s.emergencyQueue.map((e) => e.id === id ? { ...e, status: 'dispatched' as const } : e),
  })),
  markResolved: (id) => set((s) => ({
    emergencyQueue: s.emergencyQueue.map((e) => e.id === id ? { ...e, status: 'resolved' as const } : e),
  })),
  selectReport: (id) => set({ selectedReportId: id }),
}));
