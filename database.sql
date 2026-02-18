-- Create base_readings table to store initial/base meter readings
-- This stores the starting point from which all calculations begin
CREATE TABLE IF NOT EXISTS base_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solar_inverter_reading NUMERIC NOT NULL DEFAULT 0,
  solar_meter_reading NUMERIC NOT NULL,
  smart_meter_export NUMERIC NOT NULL DEFAULT 0,
  smart_meter_imported NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_readings table for Solar Monitoring Service
-- Stores cumulative meter readings for each day
CREATE TABLE IF NOT EXISTS daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  solar_inverter_reading NUMERIC NOT NULL,
  solar_meter_reading NUMERIC NOT NULL,
  smart_meter_export NUMERIC NOT NULL,
  smart_meter_imported NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_readings_date ON daily_readings(date);

-- Create unique constraint to prevent duplicate entries for the same date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_readings_date_unique ON daily_readings(date);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE base_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;

-- Insert initial base readings
-- These are the starting values from which all calculations begin
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
) ON CONFLICT DO NOTHING;
