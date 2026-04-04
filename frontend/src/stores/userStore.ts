import { create } from 'zustand';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
}

interface Vehicle {
  type: string;
  make?: string;
  model?: string;
}

interface Calibration {
  phoneTier: string;
  mountPosition: string;
  sensitivity: string;
}

interface UserStats {
  kmSurveyed: number;
  potholesLogged: number;
  repairsTriggered: number;
  damagePrevented: number;
  streak: number;
  reportsShared: number;
  badges: string[];
}

interface UserState {
  profile: UserProfile | null;
  vehicle: Vehicle | null;
  calibration: Calibration | null;
  isOnboarded: boolean;
  stats: UserStats;
  saveProfile: (p: UserProfile) => void;
  saveVehicle: (v: Vehicle) => void;
  saveCalibration: (c: Calibration) => void;
  completeOnboarding: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  vehicle: null,
  calibration: null,
  isOnboarded: false,
  stats: {
    kmSurveyed: 247,
    potholesLogged: 89,
    repairsTriggered: 3,
    damagePrevented: 6240,
    streak: 23,
    reportsShared: 14,
    badges: ['Road Scout', 'Pothole Hunter', 'Data Guardian'],
  },
  saveProfile: (p) => set({ profile: p }),
  saveVehicle: (v) => set({ vehicle: v }),
  saveCalibration: (c) => set({ calibration: c }),
  completeOnboarding: () => set({ isOnboarded: true }),
}));
