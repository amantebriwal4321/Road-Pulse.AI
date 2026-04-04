-- ============================================================
-- RoadPulse — Supabase RPC Functions for PostGIS Queries
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Find raw_reports within radius of a point (last N days)
CREATE OR REPLACE FUNCTION get_nearby_reports(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius DOUBLE PRECISION DEFAULT 5.0,
    p_days INTEGER DEFAULT 7
)
RETURNS SETOF raw_reports
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM raw_reports
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius
    )
    AND created_at >= now() - (p_days || ' days')::interval
    ORDER BY created_at DESC;
$$;

-- 2. Find potholes within radius of a point (for dedup / upsert)
CREATE OR REPLACE FUNCTION get_nearby_potholes(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius DOUBLE PRECISION DEFAULT 5.0
)
RETURNS SETOF potholes
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM potholes
    WHERE status = 'open'
    AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius
    )
    ORDER BY ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) ASC
    LIMIT 1;
$$;
