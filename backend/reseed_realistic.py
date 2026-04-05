"""
RoadPulse — Realistic Re-Seed
Clears existing data and inserts ~180 potholes placed at REAL
Bengaluru road coordinates (intersections, junctions, and known
bad-road stretches) with natural scatter.

Run:  python reseed_realistic.py
"""

import random
import time
from datetime import datetime, timedelta, timezone
from db_client import reset_database, insert_pothole_direct, insert_raw_report_direct
from location_utils import ROAD_POINTS

# ---------------------------------------------------------------------------
# REAL Bengaluru road coordinates — curated from actual locations
# Each entry: (lat, lng, ward_name, description)
# Scatter is applied per-road so markers follow road patterns, not grids
# ---------------------------------------------------------------------------

def scatter(val: float, road_scatter: float = 0.005) -> float:
    """Add slight scatter to simulate potholes along a road (not exactly on the point)."""
    return round(val + random.uniform(-road_scatter, road_scatter), 6)


def random_datetime_in_last_n_days(n: int) -> datetime:
    now = datetime.now(timezone.utc)
    delta = timedelta(seconds=random.randint(0, n * 86400))
    return now - delta


def main():
    print("=" * 60)
    print("  RoadPulse — Realistic Re-Seed")
    print("  Clearing old data, inserting realistic road potholes")
    print("=" * 60)

    # Step 1: Clear existing data
    print("\n🗑️  Clearing existing data...")
    if reset_database():
        print("   ✅ Database cleared\n")
    else:
        print("   ❌ Failed to clear — continuing anyway\n")

    start = time.time()
    total = 0
    reports_total = 0

    for base_lat, base_lng, ward, desc in ROAD_POINTS:
        # Each road point gets 1-3 potholes scattered along the road
        num = random.choices([1, 2, 3], weights=[40, 45, 15])[0]
        for _ in range(num):
            lat = scatter(base_lat)
            lng = scatter(base_lng)
            severity = round(random.choice([
                random.uniform(3.0, 5.0),   # low
                random.uniform(5.0, 7.5),   # medium
                random.uniform(7.5, 9.8),   # high
            ]), 1)
            report_count = random.randint(3, 50)
            status = "fixed" if random.random() < 0.08 else "open"

            first_reported = random_datetime_in_last_n_days(90)
            secs = (datetime.now(timezone.utc) - first_reported).total_seconds()
            last_reported = first_reported + timedelta(
                seconds=random.randint(0, max(1, int(secs)))
            )

            data = {
                "lat": lat,
                "lng": lng,
                "severity": severity,
                "report_count": report_count,
                "status": status,
                "ward": ward,
                "city": "Bengaluru",
                "first_reported": first_reported.isoformat(),
                "last_reported": last_reported.isoformat(),
            }

            pid = insert_pothole_direct(data)
            if pid:
                total += 1
                print(f"  ✅ {ward:20s} | sev {severity:4.1f} | {desc}")

                # Add 2-4 raw reports per pothole
                for _ in range(random.randint(2, 4)):
                    r_lat = round(lat + random.uniform(-0.00003, 0.00003), 6)
                    r_lng = round(lng + random.uniform(-0.00003, 0.00003), 6)
                    r_sev = round(max(0, min(10, severity + random.uniform(-1.5, 1.5))), 1)
                    r_time = first_reported + timedelta(
                        seconds=random.randint(0, max(1, int(secs)))
                    )
                    rid = insert_raw_report_direct({
                        "lat": r_lat, "lng": r_lng,
                        "severity_raw": r_sev,
                        "speed_kmh": round(random.uniform(10, 60), 1),
                        "device_id": f"seed-{random.randint(1000, 9999)}",
                        "created_at": r_time.isoformat(),
                        "pothole_id": pid,
                    })
                    if rid:
                        reports_total += 1

    elapsed = round(time.time() - start, 1)
    print(f"\n{'='*60}")
    print(f"  DONE — {total} potholes, {reports_total} raw reports ({elapsed}s)")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
