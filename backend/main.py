"""
RoadPulse — FastAPI main entry point.
All routing and request/response logic lives here.
Business logic lives in ai_validator.py, db operations in db_client.py.
"""

import logging
import time
from typing import Optional

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import RawReport, PotholeResponse, ReportResponse
from db_client import (
    get_all_potholes,
    insert_raw_report,
    upsert_pothole,
    mark_pothole_fixed,
    reset_database,
)
from ai_validator import validate_pothole
from alerts import send_pothole_alert

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("roadpulse.api")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="RoadPulse API",
    description="Crowdsourced pothole detection & urban digital twin",
    version="1.0.0",
)


# removed auto-reset on startup to preserve seeded data
# We'll uncomment it to clear the database perfectly every restart as requested
@app.on_event("startup")
async def startup_event():
    logger.info("Resetting the database to start fresh on this restart...")
    reset_database()



# CORS — allow all origins (required for frontend on different port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - start) * 1000, 1)
    logger.info("%s %s → %d (%.1fms)", request.method, request.url.path, response.status_code, elapsed)
    return response


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Server liveness check."""
    return {"status": "ok", "version": "1.0.0"}


@app.get("/potholes", response_model=list[PotholeResponse])
async def list_potholes(
    city: Optional[str] = "Bengaluru",
    min_severity: Optional[float] = 0.0,
):
    """
    Return all open potholes, ordered by severity DESC.
    Never crashes — returns empty list on error.
    """
    try:
        potholes = get_all_potholes(city=city, min_severity=min_severity)
        return potholes
    except Exception as e:
        logger.error("GET /potholes failed: %s", e)
        return JSONResponse(content=[], status_code=200)


@app.post("/report", response_model=ReportResponse)
async def submit_report(report: RawReport):
    """
    Ingest a raw bump report from a device.
    1. Save raw report to DB
    2. Run DBSCAN validation
    3. If confirmed → upsert pothole + send SMS alert if severe
    """
    # 1. Insert raw report
    report_id = insert_raw_report(
        lat=report.lat,
        lng=report.lng,
        severity_raw=report.severity_raw,
        speed_kmh=report.speed_kmh,
        device_id=report.device_id,
    )
    if not report_id:
        logger.warning("Failed to insert raw report, continuing with validation")

    # 2. Validate via DBSCAN
    result = validate_pothole(
        lat=report.lat,
        lng=report.lng,
        severity_raw=report.severity_raw,
    )

    # 3. If confirmed → upsert pothole
    if result["confirmed"]:
        pothole_id = upsert_pothole(
            lat=report.lat,
            lng=report.lng,
            severity=result["severity"],
            report_count=result["report_count"],
        )

        # Send SMS alert for high-severity potholes
        if result["severity"] and result["severity"] >= 7.0:
            send_pothole_alert(
                lat=report.lat,
                lng=report.lng,
                severity=result["severity"],
                report_count=result["report_count"],
            )

        return ReportResponse(
            message=f"Pothole confirmed with severity {result['severity']}/10",
            pothole_confirmed=True,
            pothole_id=pothole_id,
            severity=result["severity"],
            confidence=result["confidence"],
        )
    else:
        return ReportResponse(
            message=f"Report recorded. Confidence: {result['confidence']:.0%}. "
                    f"Need more reports to confirm.",
            pothole_confirmed=False,
            pothole_id=None,
            severity=None,
            confidence=result["confidence"],
        )


@app.post("/pothole/{pothole_id}/fix")
async def fix_pothole(pothole_id: str):
    """Mark a pothole as fixed."""
    success = mark_pothole_fixed(pothole_id)
    if success:
        return {"message": "Pothole marked as fixed", "id": pothole_id}
    raise HTTPException(status_code=404, detail=f"Pothole {pothole_id} not found")

@app.post("/reset")
async def reset_data():
    """Clear all potholes and raw reports from the database."""
    success = reset_database()
    if success:
        return {"message": "Database reset successfully"}
    raise HTTPException(status_code=500, detail="Failed to reset database")
