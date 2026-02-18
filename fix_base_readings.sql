-- Fix duplicate base_readings entries
-- Run this in Supabase SQL Editor to ensure only one base reading exists

-- Delete all base readings
DELETE FROM base_readings;

-- Insert the single correct base reading
INSERT INTO base_readings (
  solar_inverter_reading,
  solar_meter_reading,
  smart_meter_export,
  smart_meter_imported
) VALUES (
  0,           -- Solar Inverter Reading (initial)
  29631.5,     -- Solar Meter Reading (initial)
  0,           -- Smart Meter Export (initial)
  4057.04      -- Smart Meter Imported (initial)
);

-- Verify only one row exists
SELECT COUNT(*) as total_base_readings FROM base_readings;
-- Should return 1
