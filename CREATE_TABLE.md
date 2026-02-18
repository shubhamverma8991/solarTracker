# Create Database Table - Quick Guide

## Error You're Seeing
```
Could not find the table 'public.daily_readings' in the schema cache
```

This means the table doesn't exist yet. Follow these steps:

## Steps to Create the Table

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/tdqxyxsuyeyiumbvqxzq/sql/new

2. **Copy the SQL Script:**
   - Open `database.sql` from this project
   - Copy the entire contents

3. **Paste and Run:**
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

4. **Verify Table Created:**
   - Go to: https://supabase.com/dashboard/project/tdqxyxsuyeyiumbvqxzq/editor
   - You should see `daily_readings` table in the list

## SQL Script (for quick copy-paste)

**Important:** Run the complete `database.sql` file which includes:
1. `base_readings` table (stores initial meter readings)
2. `daily_readings` table (stores daily cumulative readings)
3. Initial base readings insertion

The complete script is in `database.sql` - copy and run the entire file.

## After Creating the Table

1. **Refresh your Next.js app** (the error should disappear)
2. **Test the dashboard** at http://localhost:3000/dashboard
3. **Test Telegram bot** by sending: `18.5 12.3 6.2 5821`

## Troubleshooting

If you still get errors after creating the table:
- Make sure your `.env.local` file has the correct `SUPABASE_SERVICE_ROLE_KEY`
- Restart your Next.js dev server: `npm run dev`
- Check Supabase dashboard to confirm the table exists
