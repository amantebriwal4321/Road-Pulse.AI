-- ============================================================
-- RoadPulse — Supabase Database Setup
-- Run this entire script in the Supabase SQL Editor once.
-- ============================================================

-- 1. Enable PostGIS extension (required for spatial queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create potholes table
CREATE TABLE IF NOT EXISTS potholes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat DOUBLE PRECISION NOT NULL
        CHECK (lat BETWEEN -90 AND 90),
    lng DOUBLE PRECISION NOT NULL
        CHECK (lng BETWEEN -180 AND 180),
    severity DOUBLE PRECISION NOT NULL
        CHECK (severity BETWEEN 0 AND 10),
    report_count INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'fixed', 'investigating')),
    ward TEXT,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    first_reported TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_reported TIMESTAMPTZ NOT NULL DEFAULT now(),
    location GEOGRAPHY(Point, 4326)
        GENERATED ALWAYS AS (
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) STORED
);

-- 3. Create spatial index on location column (fast proximity queries)
CREATE INDEX IF NOT EXISTS idx_potholes_location
    ON potholes USING GIST (location);

-- 4. Create index on status column (fast filtering by open/fixed)
CREATE INDEX IF NOT EXISTS idx_potholes_status
    ON potholes (status);

-- 5. Create index on severity column (fast sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_potholes_severity
    ON potholes (severity);

-- 6. Create raw_reports table
CREATE TABLE IF NOT EXISTS raw_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat DOUBLE PRECISION NOT NULL
        CHECK (lat BETWEEN -90 AND 90),
    lng DOUBLE PRECISION NOT NULL
        CHECK (lng BETWEEN -180 AND 180),
    severity_raw DOUBLE PRECISION NOT NULL
        CHECK (severity_raw BETWEEN 0 AND 10),
    speed_kmh DOUBLE PRECISION NOT NULL
        CHECK (speed_kmh BETWEEN 0 AND 200),
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    pothole_id UUID REFERENCES potholes(id) ON DELETE SET NULL,
    location GEOGRAPHY(Point, 4326)
        GENERATED ALWAYS AS (
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) STORED
);

-- 7. Create spatial index on raw_reports location (for ST_DWithin queries)
CREATE INDEX IF NOT EXISTS idx_raw_reports_location
    ON raw_reports USING GIST (location);

-- 8. Create index on created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_raw_reports_created_at
    ON raw_reports (created_at);

-- ============================================================
-- Verify: run these after the above completes
-- SELECT count(*) FROM potholes;       -- should return 0
-- SELECT count(*) FROM raw_reports;    -- should return 0
-- SELECT PostGIS_version();            -- should return version string
-- ============================================================
