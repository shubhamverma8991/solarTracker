# Solar Monitoring Service

A production-ready Next.js 14 application for monitoring solar energy generation, import, export, and consumption. Integrated with Supabase (PostgreSQL) and Telegram Bot for data collection.

## Features

- 📊 Real-time solar monitoring dashboard
- 🤖 Telegram bot integration for easy data entry
- 💾 PostgreSQL database via Supabase
- 📱 Mobile-responsive dark mode UI
- 🔒 Secure API endpoints with chat ID verification
- ⚡ Server-side rendering with Next.js 14 App Router

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Bot:** Telegram Bot API
- **Linting:** ESLint

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── telegram/
│   │       └── route.ts          # Telegram webhook endpoint
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/
│   └── supabase.ts              # Supabase client utilities
├── types/
│   └── index.ts                 # TypeScript type definitions
├── database.sql                 # Database schema SQL
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name:** solar-tracker (or your preferred name)
   - **Database Password:** Use a strong password (save it securely)
   - **Region:** Choose the closest region
4. Wait for the project to be created (takes 1-2 minutes)

### 3. Set Up Database

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the `database.sql` file from this project
3. Copy and paste the entire SQL script into the SQL Editor
4. Click **Run** to execute the script
5. Verify the table was created by going to **Table Editor** → you should see `daily_readings`

### 4. Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under Project Settings)
   - **service_role key** (under Project API keys - **keep this secret!**)
   - **anon/public key** (under Project API keys)

### 5. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot:
   - Choose a name for your bot
   - Choose a username (must end with `bot`)
4. BotFather will give you a **Bot Token** - save this securely
5. To get your Chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` - that number is your Chat ID

### 6. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
TELEGRAM_CHAT_ID=your-telegram-chat-id-here
```

**Important:** 
- Replace all placeholder values with your actual credentials
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` has admin access - keep it secret!

### 7. Set Up Telegram Webhook

After deploying your application (see Deployment section), set up the webhook:

**For local development (using ngrok or similar):**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram"}'
```

**For Vercel deployment:**
Replace `your-domain.com` with your Vercel deployment URL.

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Sending Data via Telegram

Send a message to your Telegram bot in one of these formats:

**Format 1 (uses today's date):**
```
18.5 29650.2 6.2 4060.5
```

**Format 2 (specify date - overwrites if date exists):**
```
2024-01-15 18.5 29650.2 6.2 4060.5
```

Where:
- `2024-01-15` = Date in YYYY-MM-DD format (optional, defaults to today)
- `18.5` = Solar Inverter Reading (cumulative kWh)
- `29650.2` = Solar Meter Reading (cumulative kWh)
- `6.2` = Smart Meter Export (cumulative kWh)
- `4060.5` = Smart Meter Imported (cumulative kWh)

**Note:** 
- These are cumulative meter readings, not daily values. The system calculates daily differences automatically.
- If you send data for the same date twice, it will overwrite the previous entry.

The bot will respond with a confirmation message showing:
- Daily Solar Generated
- Daily Export
- Daily Import
- Net Usage
- Total Consumption

### Viewing Dashboard

Navigate to `/dashboard` to see:
- Total Solar Generation (current month)
- Total Import
- Total Export
- Net Usage
- Total Consumption

All metrics are calculated dynamically from your database.

## Deployment to Vercel

### Prerequisites

1. Create a [Vercel account](https://vercel.com)
2. Install Vercel CLI (optional): `npm i -g vercel`
3. Push your code to GitHub/GitLab/Bitbucket

### Deploy Steps

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Environment Variables:**
   - In project settings, go to **Environment Variables**
   - Add all variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your deployment URL (e.g., `https://your-app.vercel.app`)

4. **Set Telegram Webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/api/telegram"}'
   ```

5. **Verify Webhook:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

## Security Notes

- ✅ Service role key is only used server-side (never exposed to client)
- ✅ Telegram webhook verifies chat ID before processing
- ✅ Environment variables are not committed to version control
- ✅ Database uses Row Level Security (RLS) enabled
- ⚠️ Make sure to restrict RLS policies in production if needed

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### TypeScript

The project uses strict TypeScript. Types are defined in `/types/index.ts`.

### Database Schema

**`base_readings` table** (stores initial meter readings):
- `id` (UUID, Primary Key)
- `solar_inverter_reading` (NUMERIC) - Initial solar inverter reading
- `solar_meter_reading` (NUMERIC) - Initial solar meter reading
- `smart_meter_export` (NUMERIC) - Initial smart meter export reading
- `smart_meter_imported` (NUMERIC) - Initial smart meter import reading
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**`daily_readings` table** (stores daily cumulative meter readings):
- `id` (UUID, Primary Key)
- `date` (DATE, Unique)
- `solar_inverter_reading` (NUMERIC) - Cumulative solar inverter reading
- `solar_meter_reading` (NUMERIC) - Cumulative solar meter reading
- `smart_meter_export` (NUMERIC) - Cumulative smart meter export reading
- `smart_meter_imported` (NUMERIC) - Cumulative smart meter import reading
- `created_at` (TIMESTAMP)

**Message Format:**
Send to Telegram bot: `solar_inverter solar_meter smart_export smart_import`
Example: `18.5 29650.2 6.2 4060.5`

## Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and keys are correct
- Check that the `daily_readings` table exists
- Ensure RLS policies allow service role access

### Telegram Webhook Not Working

- Verify webhook URL is set correctly
- Check that your deployment URL is accessible
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
- Check server logs for error messages

### Dashboard Not Loading Data

- Verify environment variables are set correctly
- Check browser console for errors
- Verify database has data (check Supabase Table Editor)

## License

MIT

## Support

For issues or questions, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
