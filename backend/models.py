"""
Pydantic models for RoadPulse API request/response validation.
All GPS coordinates, severity scores, and speeds are range-checked.
"""

from typing import Optional
from pydantic import BaseModel, Field


class RawReport(BaseModel):
    """POST /report request body — a single accelerometer bump report."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")
    severity_raw: float = Field(..., ge=0, le=10, description="Raw severity 0-10")
    speed_kmh: float = Field(..., ge=0, le=200, description="Vehicle speed in km/h")
    device_id: str = Field(
        ..., min_length=1, max_length=100, description="Unique device identifier"
    )


class PotholeResponse(BaseModel):
    """GET /potholes response item — a confirmed pothole."""
    id: str
    lat: float
    lng: float
    severity: float
    report_count: int
    status: str
    ward: Optional[str] = None
    first_reported: str
    last_reported: str


class ReportResponse(BaseModel):
    """POST /report response — result of processing a bump report."""
    message: str
    pothole_confirmed: bool
    pothole_id: Optional[str] = None
    severity: Optional[float] = None
    confidence: Optional[float] = None
