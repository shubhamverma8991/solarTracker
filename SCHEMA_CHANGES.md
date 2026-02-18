# Database Schema Changes Summary

## What Changed

The database schema has been updated to match your requirements:

### 1. New `base_readings` Table
Stores the initial/base meter readings from which all calculations begin.

**Initial Values:**
- Solar Inverter Reading: `0`
- Solar Meter Reading: `29631.5`
- Smart Meter Export: `0`
- Smart Meter Imported: `4057.04`

### 2. Updated `daily_readings` Table
Now stores cumulative meter readings (not daily differences).

**Fields:**
- `solar_inverter_reading` - Cumulative solar inverter reading
- `solar_meter_reading` - Cumulative solar meter reading
- `smart_meter_export` - Cumulative smart meter export reading
- `smart_meter_imported` - Cumulative smart meter import reading

### 3. Updated Telegram Message Format

**Old Format:** `solar_generation smart_import smart_export solar_meter_total`

**New Format:** `solar_inverter solar_meter smart_export smart_import`

**Example:** `18.5 29650.2 6.2 4060.5`

## How It Works

1. **Base Readings:** The system starts from the initial values stored in `base_readings`
2. **Daily Readings:** You send cumulative meter readings each day
3. **Calculations:** The system automatically calculates:
   - Daily differences (current reading - previous reading)
   - Monthly totals (sum of all daily differences)
   - Net usage, self-consumption, total consumption

## Next Steps

1. **Drop old tables** (if they exist):
   ```sql
   DROP TABLE IF EXISTS daily_readings CASCADE;
   ```

2. **Run the new `database.sql`** script in Supabase SQL Editor

3. **Update your Telegram messages** to use the new format:
   ```
   solar_inverter solar_meter smart_export smart_import
   ```

4. **Test:** Send a test message to your bot and check the dashboard

## Example Calculation

If you send readings:
- Day 1: `18.5 29650.2 6.2 4060.5`
- Day 2: `37.0 29668.7 12.4 4065.8`

**Day 1 calculations** (from base):
- Solar Generated: 18.5 - 0 = 18.5 kWh
- Export: 6.2 - 0 = 6.2 kWh
- Import: 4060.5 - 4057.04 = 3.46 kWh

**Day 2 calculations** (from Day 1):
- Solar Generated: 37.0 - 18.5 = 18.5 kWh
- Export: 12.4 - 6.2 = 6.2 kWh
- Import: 4065.8 - 4060.5 = 5.3 kWh

**Monthly Total:**
- Total Solar: 18.5 + 18.5 = 37.0 kWh
- Total Export: 6.2 + 6.2 = 12.4 kWh
- Total Import: 3.46 + 5.3 = 8.76 kWh
