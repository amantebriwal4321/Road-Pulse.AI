"""
AI validation for RoadPulse — DBSCAN spatial clustering.
Determines whether a raw report should be confirmed as a pothole.

Algorithm:
  - eps = 0.00005 degrees (~5 metres at Bengaluru latitude)
  - min_samples = 3 (need 3+ independent reports to confirm)
  - Severity = mean of all severity_raw values in the cluster
"""

import logging
import numpy as np
from sklearn.cluster import DBSCAN

from db_client import get_nearby_raw_reports

logger = logging.getLogger("roadpulse.ai")

# DBSCAN parameters — do not change without written justification
DBSCAN_EPS = 0.00005        # ~5 metres at Bengaluru latitude (12.97°N)
DBSCAN_MIN_SAMPLES = 3      # minimum independent reports to confirm
NEARBY_RADIUS_METRES = 5.0  # search radius for nearby reports
LOOKBACK_DAYS = 7            # only consider reports from last 7 days


def validate_pothole(
    lat: float,
    lng: float,
    severity_raw: float,
) -> dict:
    """
    Check if enough nearby reports exist to confirm a pothole.

    Returns:
        {
            "confirmed": bool,
            "severity": float | None,     # weighted mean if confirmed
            "report_count": int,
            "confidence": float,          # 0.0 to 1.0
        }
    """
    # 1. Fetch nearby raw reports within 5m from last 7 days
    nearby_reports = get_nearby_raw_reports(
        lat, lng,
        radius_metres=NEARBY_RADIUS_METRES,
        days=LOOKBACK_DAYS,
    )

    # Include the current report in the count
    total_reports = len(nearby_reports) + 1

    # 2. Not enough reports yet
    if total_reports < DBSCAN_MIN_SAMPLES:
        confidence = round(total_reports / DBSCAN_MIN_SAMPLES, 2)
        logger.info(
            "Not enough reports (%d/%d) at (%.5f, %.5f) — confidence %.2f",
            total_reports, DBSCAN_MIN_SAMPLES, lat, lng, confidence,
        )
        return {
            "confirmed": False,
            "severity": None,
            "report_count": total_reports,
            "confidence": confidence,
        }

    # 3. Run DBSCAN on the coordinates
    coords = [[r["lat"], r["lng"]] for r in nearby_reports]
    coords.append([lat, lng])  # add current report

    severities = [r["severity_raw"] for r in nearby_reports]
    severities.append(severity_raw)

    coords_array = np.array(coords)
    db = DBSCAN(eps=DBSCAN_EPS, min_samples=DBSCAN_MIN_SAMPLES, metric="euclidean")
    labels = db.fit_predict(coords_array)

    # 4. Check if any valid cluster exists (label != -1)
    valid_mask = labels != -1
    if not np.any(valid_mask):
        confidence = round(min(total_reports / DBSCAN_MIN_SAMPLES, 0.99), 2)
        logger.info(
            "DBSCAN found no valid cluster at (%.5f, %.5f) — %d reports, confidence %.2f",
            lat, lng, total_reports, confidence,
        )
        return {
            "confirmed": False,
            "severity": None,
            "report_count": total_reports,
            "confidence": confidence,
        }

    # 5. Cluster confirmed — compute weighted severity
    cluster_severities = np.array(severities)[valid_mask]
    weighted_severity = round(float(np.mean(cluster_severities)), 1)
    weighted_severity = max(0.0, min(10.0, weighted_severity))  # clamp 0–10
    cluster_count = int(np.sum(valid_mask))

    logger.info(
        "✅ Pothole CONFIRMED at (%.5f, %.5f) — severity %.1f, %d reports in cluster",
        lat, lng, weighted_severity, cluster_count,
    )

    return {
        "confirmed": True,
        "severity": weighted_severity,
        "report_count": cluster_count,
        "confidence": 1.0,
    }
