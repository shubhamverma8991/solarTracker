# Troubleshooting: "Error saving data" in Telegram

## Common Causes & Solutions

### 1. Database Table Doesn't Exist ⚠️ (Most Likely)

**Symptom:** Error message when sending data to Telegram bot

**Solution:**
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/tdqxyxsuyeyiumbvqxzq/sql/new
2. Copy the entire `database.sql` file
3. Paste and click **Run**
4. Verify tables exist: Go to Table Editor → you should see `daily_readings` and `base_readings`

### 2. Row Level Security (RLS) Blocking Inserts

**Symptom:** Permission denied errors

**Solution:**
The service role key should bypass RLS, but if you're still getting errors:

1. Go to Supabase Dashboard → Authentication → Policies
2. For `daily_readings` table, ensure service role can insert
3. Or temporarily disable RLS for testing:
   ```sql
   ALTER TABLE daily_readings DISABLE ROW LEVEL SECURITY;
   ```

### 3. Environment Variables Not Set

**Symptom:** Connection errors

**Check:**
- `.env.local` file exists in project root
- Contains all required variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://tdqxyxsuyeyiumbvqxzq.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  TELEGRAM_BOT_TOKEN=your-bot-token
  TELEGRAM_CHAT_ID=your-chat-id
  ```
- Restart dev server after changing `.env.local`

### 4. Check Server Logs

**To see detailed error:**
1. Check your terminal where `npm run dev` is running
2. Look for error messages starting with "Supabase error:"
3. The new error handler will show more details

### 5. Verify Database Connection

**Test in Supabase Dashboard:**
1. Go to Table Editor → `daily_readings`
2. Try manually inserting a row
3. If that fails, there's a database issue

## Quick Test

Send this message to your bot:
```
18.5 29650.2 6.2 4060.5
```

If it works, the date format might be the issue. Try:
```
2026-02-11 22.20 22.2 20.5 4061.98
```

## Still Not Working?

Check the server terminal logs - the updated error handler will show exactly what's wrong.
