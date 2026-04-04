export interface Pothole {
  id: string;
  lat: number;
  lng: number;
  severity: 'smooth' | 'rough' | 'pothole' | 'critical';
  severityScore: number;
  reportCount: number;
  confirmedCount: number;
  firstSeen: string;
  lastConfirmed: string;
  repairStatus: 'open' | 'scheduled' | 'in-progress' | 'resolved';
  ward: string;
  roadName: string;
  autoComplaintFiled: boolean;
}

const areas = [
  { name: 'Silk Board Junction', lat: 12.9166, lng: 77.6236, ward: 'Ward 52' },
  { name: 'Marathahalli Bridge', lat: 12.9591, lng: 77.6974, ward: 'Ward 83' },
  { name: 'Hebbal Flyover', lat: 13.0358, lng: 77.5970, ward: 'Ward 7' },
  { name: 'Whitefield Main Road', lat: 12.9698, lng: 77.7499, ward: 'Ward 85' },
  { name: 'BTM Layout', lat: 12.9121, lng: 77.6102, ward: 'Ward 68' },
  { name: 'HSR Layout', lat: 12.9116, lng: 77.6389, ward: 'Ward 72' },
  { name: 'Koramangala', lat: 12.9279, lng: 77.6271, ward: 'Ward 70' },
  { name: 'Outer Ring Road', lat: 12.9611, lng: 77.6387, ward: 'Ward 74' },
  { name: 'Sarjapur Road', lat: 12.8854, lng: 77.6964, ward: 'Ward 67' },
  { name: 'JP Nagar', lat: 12.9004, lng: 77.5834, ward: 'Ward 64' },
];

const severities: Pothole['severity'][] = ['smooth', 'rough', 'pothole', 'critical'];

export const potholes: Pothole[] = Array.from({ length: 200 }, (_, i) => {
  const area = areas[i % areas.length];
  const sev = severities[Math.floor(Math.random() * 4)];
  const score = sev === 'smooth' ? 1 + Math.random() * 2 : sev === 'rough' ? 3 + Math.random() * 2 : sev === 'pothole' ? 5 + Math.random() * 2 : 7 + Math.random() * 3;
  return {
    id: `PTH-${String(i + 1).padStart(4, '0')}`,
    lat: area.lat + (Math.random() - 0.5) * 0.01,
    lng: area.lng + (Math.random() - 0.5) * 0.01,
    severity: sev,
    severityScore: Math.round(score * 10) / 10,
    reportCount: Math.floor(Math.random() * 60) + 1,
    confirmedCount: Math.floor(Math.random() * 40) + 1,
    firstSeen: '2024-0' + (Math.floor(Math.random() * 9) + 1) + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
    lastConfirmed: '2024-10-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
    repairStatus: ['open', 'scheduled', 'in-progress', 'resolved'][Math.floor(Math.random() * 4)] as Pothole['repairStatus'],
    ward: area.ward,
    roadName: area.name,
    autoComplaintFiled: Math.random() > 0.5,
  };
});
