"""
Twilio SMS alert system for RoadPulse.
Sends SMS alerts to the municipality when high-severity potholes are confirmed.
Never crashes the main request — all exceptions are caught and logged.
"""

import os
import logging
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("roadpulse.alerts")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
ALERT_PHONE_NUMBER = os.getenv("ALERT_PHONE_NUMBER", "")

# Minimum severity threshold for sending SMS alerts
SEVERITY_ALERT_THRESHOLD = 7.0


def send_pothole_alert(
    lat: float,
    lng: float,
    severity: float,
    report_count: int,
    ward: Optional[str] = None,
) -> bool:
    """
    Send SMS alert for a confirmed high-severity pothole.
    Only sends if severity >= 7.0.
    Returns True if SMS was sent, False otherwise.
    Never raises — all exceptions caught and logged.
    """
    # Guard: only alert for high-severity potholes
    if severity < SEVERITY_ALERT_THRESHOLD:
        logger.debug(
            "Severity %.1f below threshold %.1f — no SMS sent",
            severity, SEVERITY_ALERT_THRESHOLD,
        )
        return False

    # Guard: check Twilio credentials are configured
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ALERT_PHONE_NUMBER]):
        logger.warning(
            "Twilio credentials not configured — skipping SMS alert for "
            "pothole at (%.4f, %.4f) severity %.1f",
            lat, lng, severity,
        )
        return False

    try:
        from twilio.rest import Client as TwilioClient

        client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        message_body = (
            f"🚨 RoadPulse ALERT\n"
            f"New high-severity pothole confirmed.\n"
            f"Location: {lat:.4f}, {lng:.4f}\n"
            f"Ward: {ward or 'Unknown'}\n"
            f"Severity: {severity:.1f}/10\n"
            f"Reports: {report_count} independent users\n"
            f"View: https://roadpulse.vercel.app"
        )

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_FROM_NUMBER,
            to=ALERT_PHONE_NUMBER,
        )

        logger.info(
            "✅ SMS alert sent (SID: %s) for pothole at (%.4f, %.4f) severity %.1f",
            message.sid, lat, lng, severity,
        )
        return True

    except Exception as e:
        logger.error(
            "❌ Failed to send SMS alert for pothole at (%.4f, %.4f): %s",
            lat, lng, e,
        )
        return False
