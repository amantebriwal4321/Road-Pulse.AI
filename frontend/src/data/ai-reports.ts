export interface AIReport {
  id: string;
  ward: string;
  roadName: string;
  dateRange: string;
  evidenceCount: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  aiProcessed: boolean;
  pdfReady: boolean;
  costEstimate: string;
  analysis: string;
  recommendedAction: string;
  similarCase: string;
  priorityTier: string;
  deteriorationProbability: number;
}

export const aiReports: AIReport[] = [
  {
    id: 'RPT-2024-0847',
    ward: 'Ward 52',
    roadName: 'Marathahalli Bridge Junction',
    dateRange: 'Sep 15 – Oct 3, 2024',
    evidenceCount: 89,
    severityBreakdown: { critical: 23, high: 34, medium: 22, low: 10 },
    aiProcessed: true,
    pdfReady: true,
    costEstimate: '₹45,000 – ₹72,000',
    analysis: 'PATTERN DETECTED: This cluster shows a 340% increase in severity over 18 days, consistent with post-monsoon sub-base erosion. The affected junction has 89 independent citizen confirmations across 14 vehicle types, indicating a genuine infrastructure failure rather than sensor anomaly.',
    recommendedAction: 'Immediate pothole patching (estimated 2 crew-days). Without intervention, model predicts 23% probability of road surface collapse within 14 days based on deterioration curve.',
    similarCase: 'Koramangala 80 Feet Road (resolved in 6 days, ₹58,000 spend, 78% report reduction post-repair).',
    priorityTier: 'CRITICAL — Tier 1',
    deteriorationProbability: 23,
  },
  {
    id: 'RPT-2024-0832',
    ward: 'Ward 83',
    roadName: 'Silk Board Flyover Approach',
    dateRange: 'Sep 8 – Sep 28, 2024',
    evidenceCount: 67,
    severityBreakdown: { critical: 15, high: 28, medium: 18, low: 6 },
    aiProcessed: true,
    pdfReady: true,
    costEstimate: '₹38,000 – ₹55,000',
    analysis: 'STRUCTURAL ANALYSIS: Load-bearing surface showing fatigue cracking pattern typical of heavy-vehicle corridor. Accelerometer data from 67 commuter twins indicates progressive deterioration with 4.2x acceleration during peak traffic hours.',
    recommendedAction: 'Full-depth repair with reinforced base layer. Temporary speed restriction recommended (30 km/h).',
    similarCase: 'Hebbal Flyover approach (resolved in 8 days, ₹62,000 spend).',
    priorityTier: 'CRITICAL — Tier 1',
    deteriorationProbability: 31,
  },
  {
    id: 'RPT-2024-0819',
    ward: 'Ward 85',
    roadName: 'Whitefield Main Road – ITPL Stretch',
    dateRange: 'Sep 1 – Sep 22, 2024',
    evidenceCount: 54,
    severityBreakdown: { critical: 8, high: 22, medium: 18, low: 6 },
    aiProcessed: true,
    pdfReady: false,
    costEstimate: '₹28,000 – ₹45,000',
    analysis: 'DRAINAGE FAILURE: Pattern consistent with waterlogging-induced erosion. Report density correlates with monsoon drainage map bottlenecks. 54 confirmations from diverse vehicle types.',
    recommendedAction: 'Combined pothole repair + drainage clearing. Root cause is blocked storm drain at ITPL junction.',
    similarCase: 'Varthur Road drainage fix (resolved in 10 days, ₹41,000).',
    priorityTier: 'HIGH — Tier 2',
    deteriorationProbability: 18,
  },
  {
    id: 'RPT-2024-0805',
    ward: 'Ward 74',
    roadName: 'Outer Ring Road – Bellandur Stretch',
    dateRange: 'Aug 20 – Sep 15, 2024',
    evidenceCount: 42,
    severityBreakdown: { critical: 5, high: 18, medium: 14, low: 5 },
    aiProcessed: true,
    pdfReady: true,
    costEstimate: '₹22,000 – ₹35,000',
    analysis: 'WEAR PATTERN: High-traffic corridor showing normal wear acceleration. Twin data shows 2.1x faster deterioration than average for this road class due to heavy commercial vehicle use.',
    recommendedAction: 'Surface resurfacing of 200m stretch. Schedule during off-peak (10PM–5AM).',
    similarCase: 'ORR near Marathahalli (resolved in 4 days, ₹28,000).',
    priorityTier: 'HIGH — Tier 2',
    deteriorationProbability: 15,
  },
  {
    id: 'RPT-2024-0791',
    ward: 'Ward 67',
    roadName: 'Sarjapur Road – Wipro Junction',
    dateRange: 'Aug 12 – Sep 8, 2024',
    evidenceCount: 38,
    severityBreakdown: { critical: 3, high: 15, medium: 15, low: 5 },
    aiProcessed: false,
    pdfReady: false,
    costEstimate: '₹18,000 – ₹30,000',
    analysis: 'EMERGING CLUSTER: New deterioration zone forming near Wipro junction. Currently moderate severity but trajectory suggests escalation to critical within 3 weeks if unaddressed.',
    recommendedAction: 'Preventive patching recommended. Early intervention can prevent ₹50,000+ in emergency repair costs.',
    similarCase: 'HSR Layout 27th Main (early intervention, ₹15,000, 92% issue prevention).',
    priorityTier: 'MEDIUM — Tier 3',
    deteriorationProbability: 42,
  },
];
