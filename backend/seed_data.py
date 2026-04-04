"""
RoadPulse — Seed Data Generator
Generates 250 synthetic potholes across 8 real Bengaluru areas
and inserts them into Supabase along with corresponding raw_reports.

Run: python seed_data.py
"""

import random
import time
from datetime import datetime, timedelta, timezone

from db_client import insert_pothole_direct, insert_raw_report_direct

# ---------------------------------------------------------------------------
# Bengaluru areas — real high-traffic, notoriously bad-road zones
# ---------------------------------------------------------------------------
AREAS = [
    {
        "name": "Silk Board Junction",
        "ward": "Silk Board",
        "center_lat": 12.9165,
        "center_lng": 77.6229,
        "spread": 0.005,
        "count": 40,
    },
    {
        "name": "Marathahalli Bridge",
        "ward": "Marathahalli",
        "center_lat": 12.9591,
        "center_lng": 77.6974,
        "spread": 0.005,
        "count": 35,
    },
    {
        "name": "Old Airport Road",
        "ward": "Old Airport Road",
        "center_lat": 12.9700,
        "center_lng": 77.6499,
        "spread": 0.008,
        "count": 30,
    },
    {
        "name": "Hosur Road / KR Puram",
        "ward": "KR Puram",
        "center_lat": 12.9784,
        "center_lng": 77.6408,
        "spread": 0.006,
        "count": 30,
    },
    {
        "name": "Bannerghatta Road",
        "ward": "Bannerghatta",
        "center_lat": 12.8900,
        "center_lng": 77.5970,
        "spread": 0.010,
        "count": 25,
    },
    {
        "name": "Bellary Road",
        "ward": "Bellary Road",
        "center_lat": 13.0200,
        "center_lng": 77.5800,
        "spread": 0.008,
        "count": 25,
    },
    {
        "name": "Outer Ring Road",
        "ward": "Outer Ring Road",
        "center_lat": 12.9350,
        "center_lng": 77.6900,
        "spread": 0.010,
        "count": 30,
    },
    {
        "name": "Tumkur Road",
        "ward": "Tumkur Road",
        "center_lat": 13.0100,
        "center_lng": 77.5400,
        "spread": 0.008,
        "count": 35,
    },
]


def random_datetime_in_last_n_days(n: int) -> datetime:
    """Return a random datetime within the last n days."""
    now = datetime.now(timezone.utc)
    delta = timedelta(seconds=random.randint(0, n * 86400))
    return now - delta


def random_coord(center: float, spread: float) -> float:
    """Return a random coordinate scattered around center ± spread."""
    return round(center + random.uniform(-spread, spread), 6)


def generate_severity() -> float:
    """Random severity between 3.0 and 9.5, rounded to 1 decimal."""
    return round(random.uniform(3.0, 9.5), 1)


def generate_report_count() -> int:
    """Random report count between 3 and 47."""
    return random.randint(3, 47)


def generate_status() -> str:
    """90% open, 10% fixed."""
    return "fixed" if random.random() < 0.10 else "open"


def main():
    print("=" * 60)
    print("  RoadPulse — Seed Data Generator")
    print("  Target: 250 potholes + 750+ raw reports")
    print("=" * 60)
    print()

    start_time = time.time()
    total_potholes = 0
    total_reports = 0
    skipped = 0
    pothole_number = 0

    expected_total = sum(a["count"] for a in AREAS)
    print(f"Planned: {expected_total} potholes across {len(AREAS)} areas\n")

    for area in AREAS:
        print(f"📍 {area['name']} — {area['count']} potholes")

        for i in range(area["count"]):
            pothole_number += 1
            lat = random_coord(area["center_lat"], area["spread"])
            lng = random_coord(area["center_lng"], area["spread"])
            severity = generate_severity()
            report_count = generate_report_count()
            status = generate_status()

            # Random timestamps within last 90 days
            first_reported = random_datetime_in_last_n_days(90)
            # last_reported is between first_reported and now
            seconds_since_first = (
                datetime.now(timezone.utc) - first_reported
            ).total_seconds()
            last_reported = first_reported + timedelta(
                seconds=random.randint(0, max(1, int(seconds_since_first)))
            )

            # Insert pothole
            pothole_data = {
                "lat": lat,
                "lng": lng,
                "severity": severity,
                "report_count": report_count,
                "status": status,
                "ward": area["ward"],
                "city": "Bengaluru",
                "first_reported": first_reported.isoformat(),
                "last_reported": last_reported.isoformat(),
            }

            pothole_id = insert_pothole_direct(pothole_data)

            if pothole_id:
                total_potholes += 1
                print(
                    f"  Inserting pothole {pothole_number} of {expected_total}... "
                    f"severity={severity}, reports={report_count}, status={status}"
                )

                # Insert 3+ corresponding raw_reports per pothole
                num_reports = max(3, random.randint(3, min(report_count, 8)))
                for j in range(num_reports):
                    # Scatter raw reports slightly around pothole location
                    report_lat = round(lat + random.uniform(-0.00003, 0.00003), 6)
                    report_lng = round(lng + random.uniform(-0.00003, 0.00003), 6)
                    report_severity = round(
                        severity + random.uniform(-1.5, 1.5), 1
                    )
                    report_severity = max(0.0, min(10.0, report_severity))

                    # Random time between first_reported and last_reported
                    report_delta = (last_reported - first_reported).total_seconds()
                    report_time = first_reported + timedelta(
                        seconds=random.randint(0, max(1, int(report_delta)))
                    )

                    report_data = {
                        "lat": report_lat,
                        "lng": report_lng,
                        "severity_raw": report_severity,
                        "speed_kmh": round(random.uniform(10, 60), 1),
                        "device_id": f"seed-device-{random.randint(1000, 9999)}",
                        "created_at": report_time.isoformat(),
                        "pothole_id": pothole_id,
                    }

                    report_id = insert_raw_report_direct(report_data)
                    if report_id:
                        total_reports += 1
            else:
                skipped += 1
                print(
                    f"  ⚠️  Pothole {pothole_number} SKIPPED (insert failed)"
                )

        print()

    elapsed = round(time.time() - start_time, 1)

    print("=" * 60)
    print("  SEED DATA COMPLETE")
    print("=" * 60)
    print(f"  Potholes inserted:  {total_potholes}")
    print(f"  Potholes skipped:   {skipped}")
    print(f"  Raw reports inserted: {total_reports}")
    print(f"  Time taken:         {elapsed}s")
    print()
    open_count = total_potholes - int(total_potholes * 0.10)
    print(f"  Expected open potholes on GET /potholes: ~{open_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
