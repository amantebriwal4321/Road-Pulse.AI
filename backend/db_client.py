"""
Database client for RoadPulse — all Supabase read/write operations.
No other file should talk to Supabase directly.
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional

from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the same directory as this script
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

logger = logging.getLogger("roadpulse.db")

_client: Optional[Client] = None


def _get_client() -> Client:
    """Lazy-init the Supabase client so import doesn't crash without creds."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment / .env"
            )
        _client = create_client(url, key)
    return _client


# ---------------------------------------------------------------------------
# Potholes
# ---------------------------------------------------------------------------

def get_all_potholes(
    city: str = "Bengaluru",
    min_severity: float = 0.0,
) -> list[dict]:
    """Return all open potholes, ordered by severity DESC."""
    try:
        sb = _get_client()
        query = (
            sb.table("potholes")
            .select("id, lat, lng, severity, report_count, status, ward, first_reported, last_reported")
            .eq("status", "open")
            .eq("city", city)
            .gte("severity", min_severity)
            .order("severity", desc=True)
        )
        response = query.execute()
        return response.data or []
    except Exception as e:
        logger.error("get_all_potholes failed: %s", e)
        return []


def get_pothole_by_id(pothole_id: str) -> Optional[dict]:
    """Return a single pothole by ID."""
    try:
        sb = _get_client()
        response = (
            sb.table("potholes")
            .select("*")
            .eq("id", pothole_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error("get_pothole_by_id failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Raw reports
# ---------------------------------------------------------------------------

def get_nearby_raw_reports(
    lat: float,
    lng: float,
    radius_metres: float = 5.0,
    days: int = 7,
) -> list[dict]:
    """
    Fetch raw_reports within `radius_metres` of (lat, lng) from last `days` days.
    Uses PostGIS ST_DWithin via Supabase RPC.
    """
    try:
        sb = _get_client()
        response = sb.rpc(
            "get_nearby_reports",
            {
                "p_lat": lat,
                "p_lng": lng,
                "p_radius": radius_metres,
                "p_days": days,
            },
        ).execute()
        return response.data or []
    except Exception as e:
        logger.error("get_nearby_raw_reports failed: %s", e)
        return []


def insert_raw_report(
    lat: float,
    lng: float,
    severity_raw: float,
    speed_kmh: float,
    device_id: str,
) -> Optional[str]:
    """Insert a raw report and return its UUID."""
    try:
        sb = _get_client()
        response = (
            sb.table("raw_reports")
            .insert({
                "lat": lat,
                "lng": lng,
                "severity_raw": severity_raw,
                "speed_kmh": speed_kmh,
                "device_id": device_id,
            })
            .execute()
        )
        if response.data:
            return response.data[0]["id"]
        return None
    except Exception as e:
        logger.error("insert_raw_report failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Upsert pothole (create or merge with existing nearby)
# ---------------------------------------------------------------------------

def upsert_pothole(
    lat: float,
    lng: float,
    severity: float,
    report_count: int = 1,
    ward: Optional[str] = None,
) -> Optional[str]:
    """
    If a pothole exists within 5 m: update severity (weighted avg),
    increment report_count, update last_reported.
    Otherwise: insert a new pothole.
    Returns the pothole ID.
    """
    try:
        sb = _get_client()

        # Check for existing pothole within 5 metres
        nearby = sb.rpc(
            "get_nearby_potholes",
            {"p_lat": lat, "p_lng": lng, "p_radius": 5.0},
        ).execute()

        now = datetime.now(timezone.utc).isoformat()

        if nearby.data and len(nearby.data) > 0:
            # Merge into the closest existing pothole
            existing = nearby.data[0]
            old_count = existing["report_count"]
            old_severity = existing["severity"]
            new_count = old_count + report_count
            # Weighted average severity
            new_severity = round(
                (old_severity * old_count + severity * report_count) / new_count,
                1,
            )
            new_severity = max(0, min(10, new_severity))  # clamp 0–10

            response = (
                sb.table("potholes")
                .update({
                    "severity": new_severity,
                    "report_count": new_count,
                    "last_reported": now,
                })
                .eq("id", existing["id"])
                .execute()
            )
            return existing["id"]
        else:
            # Insert new pothole
            response = (
                sb.table("potholes")
                .insert({
                    "lat": round(lat, 6),
                    "lng": round(lng, 6),
                    "severity": round(max(0, min(10, severity)), 1),
                    "report_count": report_count,
                    "status": "open",
                    "ward": ward,
                    "city": "Bengaluru",
                    "first_reported": now,
                    "last_reported": now,
                })
                .execute()
            )
            if response.data:
                return response.data[0]["id"]
            return None
    except Exception as e:
        logger.error("upsert_pothole failed: %s", e)
        return None


def mark_pothole_fixed(pothole_id: str) -> bool:
    """Mark a pothole as fixed. Returns True on success."""
    try:
        sb = _get_client()
        now = datetime.now(timezone.utc).isoformat()
        response = (
            sb.table("potholes")
            .update({"status": "fixed", "last_reported": now})
            .eq("id", pothole_id)
            .execute()
        )
        return bool(response.data)
    except Exception as e:
        logger.error("mark_pothole_fixed failed: %s", e)
        return False


# ---------------------------------------------------------------------------
# Seed helpers (used only by seed_data.py)
# ---------------------------------------------------------------------------

def insert_pothole_direct(data: dict) -> Optional[str]:
    """Direct insert for seeding — bypasses merge logic."""
    try:
        sb = _get_client()
        response = sb.table("potholes").insert(data).execute()
        if response.data:
            return response.data[0]["id"]
        return None
    except Exception as e:
        logger.error("insert_pothole_direct failed: %s", e)
        return None


def insert_raw_report_direct(data: dict) -> Optional[str]:
    """Direct insert for seeding raw_reports."""
    try:
        sb = _get_client()
        response = sb.table("raw_reports").insert(data).execute()
        if response.data:
            return response.data[0]["id"]
        return None
    except Exception as e:
        logger.error("insert_raw_report_direct failed: %s", e)
        return None
