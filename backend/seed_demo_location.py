"""
Quick script to seed 4 potholes near the hackathon demo location
(BGS Flyover / Mysore Road area, Bengaluru — approx 12.940, 77.555)
"""
from db_client import insert_pothole_direct
from datetime import datetime, timezone

now = datetime.now(timezone.utc).isoformat()

# Place potholes within ~150-400 metres of hackathon location
DEMO_POTHOLES = [
    {
        "lat": 12.9408,
        "lng": 77.5560,
        "severity": 9.2,
        "report_count": 34,
        "status": "open",
        "ward": "Mysore Road",
        "city": "Bengaluru",
        "first_reported": now,
        "last_reported": now,
    },
    {
        "lat": 12.9390,
        "lng": 77.5545,
        "severity": 7.5,
        "report_count": 21,
        "status": "open",
        "ward": "Mysore Road",
        "city": "Bengaluru",
        "first_reported": now,
        "last_reported": now,
    },
    {
        "lat": 12.9420,
        "lng": 77.5535,
        "severity": 5.8,
        "report_count": 12,
        "status": "open",
        "ward": "Mysore Road",
        "city": "Bengaluru",
        "first_reported": now,
        "last_reported": now,
    },
    {
        "lat": 12.9378,
        "lng": 77.5570,
        "severity": 8.6,
        "report_count": 28,
        "status": "open",
        "ward": "Mysore Road",
        "city": "Bengaluru",
        "first_reported": now,
        "last_reported": now,
    },
]

print("Inserting demo potholes near hackathon location...")
for i, p in enumerate(DEMO_POTHOLES, 1):
    pid = insert_pothole_direct(p)
    status = "✅" if pid else "❌"
    print(f"  {status} Pothole {i}: {p['lat']}, {p['lng']} — severity {p['severity']} — id: {pid}")

print("\nDone! Reload the map to see them appear.")
