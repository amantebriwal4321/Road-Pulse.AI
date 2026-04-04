export interface WardData {
  name: string;
  healthScore: number;
  activeComplaints: number;
  repairCount: number;
  monthlyTrend: number[];
}

export const wards: WardData[] = [
  { name: 'Marathahalli', healthScore: 34, activeComplaints: 89, repairCount: 12, monthlyTrend: [72, 68, 65, 58, 52, 38, 31, 29, 34, 40, 45, 48] },
  { name: 'Silk Board', healthScore: 28, activeComplaints: 112, repairCount: 8, monthlyTrend: [65, 62, 58, 50, 44, 30, 25, 22, 28, 35, 38, 42] },
  { name: 'Whitefield', healthScore: 41, activeComplaints: 67, repairCount: 15, monthlyTrend: [78, 75, 72, 65, 58, 45, 38, 35, 41, 48, 52, 55] },
  { name: 'Koramangala', healthScore: 62, activeComplaints: 34, repairCount: 22, monthlyTrend: [80, 78, 75, 70, 65, 55, 48, 52, 58, 62, 65, 68] },
  { name: 'HSR Layout', healthScore: 55, activeComplaints: 45, repairCount: 18, monthlyTrend: [75, 72, 70, 62, 58, 48, 42, 45, 50, 55, 58, 60] },
  { name: 'BTM Layout', healthScore: 48, activeComplaints: 56, repairCount: 14, monthlyTrend: [70, 68, 64, 58, 52, 42, 36, 38, 44, 48, 52, 54] },
  { name: 'JP Nagar', healthScore: 71, activeComplaints: 23, repairCount: 25, monthlyTrend: [82, 80, 78, 74, 70, 62, 58, 62, 66, 71, 74, 76] },
  { name: 'Hebbal', healthScore: 45, activeComplaints: 58, repairCount: 16, monthlyTrend: [72, 70, 66, 60, 54, 40, 35, 38, 42, 45, 50, 52] },
  { name: 'Outer Ring Road', healthScore: 38, activeComplaints: 78, repairCount: 10, monthlyTrend: [68, 65, 60, 54, 48, 35, 30, 32, 36, 38, 42, 44] },
  { name: 'Sarjapur Road', healthScore: 42, activeComplaints: 62, repairCount: 13, monthlyTrend: [74, 70, 66, 60, 55, 42, 36, 38, 42, 45, 48, 50] },
  { name: 'Indiranagar', healthScore: 78, activeComplaints: 15, repairCount: 28, monthlyTrend: [85, 84, 82, 80, 76, 70, 65, 68, 72, 78, 80, 82] },
  { name: 'Jayanagar', healthScore: 74, activeComplaints: 19, repairCount: 26, monthlyTrend: [84, 82, 80, 76, 72, 65, 60, 64, 68, 74, 76, 78] },
  { name: 'Rajajinagar', healthScore: 58, activeComplaints: 42, repairCount: 20, monthlyTrend: [76, 74, 70, 65, 60, 50, 44, 48, 54, 58, 62, 64] },
  { name: 'Malleswaram', healthScore: 68, activeComplaints: 28, repairCount: 24, monthlyTrend: [82, 80, 78, 72, 68, 60, 55, 58, 64, 68, 72, 74] },
  { name: 'Electronic City', healthScore: 52, activeComplaints: 48, repairCount: 17, monthlyTrend: [74, 72, 68, 62, 56, 46, 40, 44, 48, 52, 56, 58] },
];

export const cityHealthTrend = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 64 },
  { month: 'May', score: 60 },
  { month: 'Jun', score: 48 },
  { month: 'Jul', score: 38 },
  { month: 'Aug', score: 35 },
  { month: 'Sep', score: 42 },
  { month: 'Oct', score: 52 },
  { month: 'Nov', score: 58 },
  { month: 'Dec', score: 62 },
];
