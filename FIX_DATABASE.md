# Fix Database Schema Error

## Error You're Seeing
```
Error: Could not find the 'smart_meter_export' column of 'daily_readings' in the schema cache
```

## Solution

Your database table has **old column names**. You need to recreate it with the correct schema.

### Quick Fix (Recommended)

1. **Go to Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/tdqxyxsuyeyiumbvqxzq/sql/new

2. **Run this SQL** (drops and recreates the table):
   ```sql
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
   ```

3. **Click Run**

4. **Test again** - Send a message to your bot:
   ```
   18.5 29650.2 6.2 4060.5
   ```

### Alternative: Use the Migration Script

You can also use `database_migration.sql` which has options to:
- Drop and recreate (if no important data)
- Rename columns (if you have data to preserve)
- Add missing columns

### Verify It Worked

After running the SQL:
1. Go to **Table Editor** → `daily_readings`
2. Check the columns match:
   - `solar_inverter_reading`
   - `solar_meter_reading`
   - `smart_meter_export` ✅
   - `smart_meter_imported` ✅

Then try sending a message to your bot again!
