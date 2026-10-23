-- Migration: 003_rename_hotels_to_events.sql
-- Description: No-op — duplicate of 002 (issue #367).
--
-- This migration originally duplicated the hotels → events rename performed by
-- 002_rename_hotels_to_events.sql. Running both caused redundant DDL on fresh
-- databases. 002 is the canonical rename: it renames hotels → events when
-- hotels exists (legacy SafeTrust databases) and is a no-op when it doesn't
-- (fresh databases). 006_normalize_events_primary_key.sql patches any
-- primary-key constraint fallout from environments that applied different
-- rename variants.
--
-- This file is kept rather than deleted because some environments may have it
-- recorded as already applied in their migration history.

-- Up Migration
SELECT 1;

-- Down Migration
SELECT 1;
