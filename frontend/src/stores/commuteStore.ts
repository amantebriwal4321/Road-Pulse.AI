import { create } from 'zustand';

type CommuteStatus = 'idle' | 'routing' | 'driving' | 'report';

interface Detection {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  severityScore: number;
  timestamp: number;
}

interface TripStats {
  distance: number;
  duration: number;
  potholesLogged: number;
  dataPoints: number;
}

interface CommuteState {
  status: CommuteStatus;
  selectedRoute: 'A' | 'B' | null;
  currentDetections: Detection[];
  tripStats: TripStats;
  startDrive: () => void;
  addDetection: (d: Detection) => void;
  endDrive: () => void;
  selectRoute: (r: 'A' | 'B') => void;
  resetDrive: () => void;
}

export const useCommuteStore = create<CommuteState>((set) => ({
  status: 'idle',
  selectedRoute: null,
  currentDetections: [],
  tripStats: { distance: 0, duration: 0, potholesLogged: 0, dataPoints: 0 },
  startDrive: () => set({ status: 'driving', currentDetections: [] }),
  addDetection: (d) => set((s) => ({
    currentDetections: [...s.currentDetections, d],
    tripStats: { ...s.tripStats, potholesLogged: s.tripStats.potholesLogged + 1, dataPoints: s.tripStats.dataPoints + 12 },
  })),
  endDrive: () => set({
    status: 'report',
    tripStats: { distance: 8.3, duration: 32, potholesLogged: 7, dataPoints: 347 },
  }),
  selectRoute: (r) => set({ selectedRoute: r, status: 'routing' }),
  resetDrive: () => set({
    status: 'idle', selectedRoute: null, currentDetections: [], tripStats: { distance: 0, duration: 0, potholesLogged: 0, dataPoints: 0 },
  }),
}));
