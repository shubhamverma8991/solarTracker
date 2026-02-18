# Quick Setup Checklist

## Your Supabase Details (from images)

Based on your Supabase project:


**Security note:** don’t store your database password, service role key, or Telegram bot token in repo files. Put them only in `.env.local` (local) and in Vercel Environment Variables (prod).

## Quick Start Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env.local` file** (copy from `env.example`):

   ```env

   ```

3. **Get your Supabase keys:**

  
   - Copy the `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

4. **Run database SQL:**

  
   - Copy contents of `database.sql`
   - Paste and click "Run"

5. **Create Telegram Bot:**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow instructions
   - Save the bot token → `TELEGRAM_BOT_TOKEN`
   - Get your chat ID by messaging your bot, then visit:
     `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response → `TELEGRAM_CHAT_ID`

6. **Run the app:**

   ```bash
   npm run dev
   ```

7. **Set Telegram webhook** (after deploying or using ngrok for local):

   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram"}'
   ```

## Test It

1. Send a message to your Telegram bot: `18.5 12.3 6.2 5821`
2. You should receive a confirmation message
3. Visit `http://localhost:3000/dashboard` to see your data

## Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!
5. Set webhook URL to your Vercel domain

See `README.md` for detailed instructions.
