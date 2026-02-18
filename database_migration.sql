-- Migration script to fix column names in daily_readings table
-- Run this if you get "Could not find the 'smart_meter_export' column" error

-- Option 1: Drop and recreate the table (loses existing data)
-- Uncomment the lines below if you don't have important data yet

-- DROP TABLE IF EXISTS daily_readings CASCADE;
-- CREATE TABLE daily_readings (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   date DATE NOT NULL,
--   solar_inverter_reading NUMERIC NOT NULL,
--   solar_meter_reading NUMERIC NOT NULL,
--   smart_meter_export NUMERIC NOT NULL,
--   smart_meter_imported NUMERIC NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX idx_daily_readings_date ON daily_readings(date);
-- CREATE UNIQUE INDEX idx_daily_readings_date_unique ON daily_readings(date);
-- ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;

-- Option 2: Alter existing table (preserves data)
-- Check what columns exist first, then rename if needed

-- If columns are named differently, rename them:
-- ALTER TABLE daily_readings RENAME COLUMN old_column_name TO smart_meter_export;
-- ALTER TABLE daily_readings RENAME COLUMN old_column_name TO smart_meter_imported;

-- Option 3: Add missing columns if they don't exist
-- ALTER TABLE daily_readings 
--   ADD COLUMN IF NOT EXISTS smart_meter_export NUMERIC,
--   ADD COLUMN IF NOT EXISTS smart_meter_imported NUMERIC;

-- RECOMMENDED: Drop and recreate (if no important data)
-- This ensures the schema matches exactly

DROP TABLE IF EXISTS daily_readings CASCADE;

CREATE TABLE daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  solar_inverter_reading NUMERIC NOT NULL,
  solar_meter_reading NUMERIC NOT NULL,
  smart_meter_export NUMERIC NOT NULL,
  smart_meter_imported NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_readings_date ON daily_readings(date);
CREATE UNIQUE INDEX idx_daily_readings_date_unique ON daily_readings(date);
ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;
