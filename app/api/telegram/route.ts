import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DailyReadingInsert } from '@/types'

interface TelegramUpdate {
  message?: {
    chat: {
      id: number
    }
    text?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify Telegram chat ID
    const telegramChatId = process.env.TELEGRAM_CHAT_ID
    if (!telegramChatId) {
      console.error('TELEGRAM_CHAT_ID not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse Telegram webhook payload
    const update: TelegramUpdate = await request.json()

    // Verify chat ID matches
    const chatId = update.message?.chat?.id
    if (!chatId || chatId.toString() !== telegramChatId) {
      console.warn(`Unauthorized chat ID: ${chatId}`)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse message text
    const messageText = update.message?.text
    if (!messageText) {
      return NextResponse.json({ ok: true }) // Ignore non-text messages
    }

    // Parse the message format: 
    // Option 1: "solar_inverter solar_meter smart_export smart_import" (uses today's date)
    // Option 2: "YYYY-MM-DD solar_inverter solar_meter smart_export smart_import" (uses specified date)
    const parts = messageText.trim().split(/\s+/)
    
    let targetDate: string
    let solarInverterReading: number
    let solarMeterReading: number
    let smartMeterExport: number
    let smartMeterImported: number

    if (parts.length === 4) {
      // Format: solar_inverter solar_meter smart_export smart_import (uses today)
      targetDate = new Date().toISOString().split('T')[0]
      const [solarInverter, solarMeter, smartExport, smartImported] = parts.map(
        (val) => parseFloat(val)
      )
      solarInverterReading = solarInverter
      solarMeterReading = solarMeter
      smartMeterExport = smartExport
      smartMeterImported = smartImported
    } else if (parts.length === 5) {
      // Format: YYYY-MM-DD solar_inverter solar_meter smart_export smart_import
      const dateStr = parts[0]
      const [solarInverter, solarMeter, smartExport, smartImported] = parts
        .slice(1)
        .map((val) => parseFloat(val))

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateStr)) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid date format. Use YYYY-MM-DD\n\nExample: 2024-01-15 18.5 29650.2 6.2 4060.5'
        )
        return NextResponse.json({ ok: true })
      }

      // Validate date is valid
      const parsedDate = new Date(dateStr)
      if (isNaN(parsedDate.getTime())) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid date. Please use a valid date in YYYY-MM-DD format.'
        )
        return NextResponse.json({ ok: true })
      }

      targetDate = dateStr
      solarInverterReading = solarInverter
      solarMeterReading = solarMeter
      smartMeterExport = smartExport
      smartMeterImported = smartImported
    } else {
      // Invalid format
      await sendTelegramMessage(
        chatId,
        '❌ Invalid format.\n\nFormat 1 (today): solar_inverter solar_meter smart_export smart_import\nExample: 18.5 29650.2 6.2 4060.5\n\nFormat 2 (with date): YYYY-MM-DD solar_inverter solar_meter smart_export smart_import\nExample: 2024-01-15 18.5 29650.2 6.2 4060.5'
      )
      return NextResponse.json({ ok: true })
    }

    // Validate parsed values
    if (
      isNaN(solarInverterReading) ||
      isNaN(solarMeterReading) ||
      isNaN(smartMeterExport) ||
      isNaN(smartMeterImported)
    ) {
      await sendTelegramMessage(
        chatId,
        '❌ Invalid numbers. Please send valid numeric values.'
      )
      return NextResponse.json({ ok: true })
    }

    // Insert into Supabase (will overwrite if date already exists)
    const supabase = createServerClient()
    const reading: DailyReadingInsert = {
      date: targetDate,
      solar_inverter_reading: solarInverterReading,
      solar_meter_reading: solarMeterReading,
      smart_meter_export: smartMeterExport,
      smart_meter_imported: smartMeterImported,
    }

    const { error } = await supabase
      .from('daily_readings')
      .upsert(reading, {
        onConflict: 'date',
      })

    if (error) {
      console.error('Supabase error:', error)
      await sendTelegramMessage(
        chatId,
        '❌ Error saving data. Please try again later.'
      )
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Get previous day's reading to calculate daily differences
    const targetDateObj = new Date(targetDate)
    const previousDay = new Date(targetDateObj)
    previousDay.setDate(previousDay.getDate() - 1)
    const previousDayStr = previousDay.toISOString().split('T')[0]

    const { data: previousReading } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', previousDayStr)
      .single()

    // Get base readings
    const { data: baseReading } = await supabase
      .from('base_readings')
      .select('*')
      .single()

    // Calculate daily differences
    let dailySolar = 0
    let dailyExport = 0
    let dailyImport = 0

    if (previousReading) {
      // Calculate from previous day
      dailySolar =
        solarInverterReading - Number(previousReading.solar_inverter_reading)
      dailyExport =
        smartMeterExport - Number(previousReading.smart_meter_export)
      dailyImport =
        smartMeterImported - Number(previousReading.smart_meter_imported)
    } else if (baseReading) {
      // Calculate from base readings (first day)
      dailySolar =
        solarInverterReading - Number(baseReading.solar_inverter_reading)
      dailyExport =
        smartMeterExport - Number(baseReading.smart_meter_export)
      dailyImport =
        smartMeterImported - Number(baseReading.smart_meter_imported)
    }

    // Calculate metrics
    const netUsage = dailyImport - dailyExport
    const selfConsumed = dailySolar - dailyExport
    const totalConsumption = dailyImport + selfConsumed

    // Send confirmation message
    const dateDisplay = targetDate === new Date().toISOString().split('T')[0] ? "Today's" : `Date: ${targetDate}`
    const confirmationMessage = `Saved ✅

📅 ${dateDisplay} Readings:
Solar Generated: ${dailySolar.toFixed(2)} kWh
Exported: ${dailyExport.toFixed(2)} kWh
Imported: ${dailyImport.toFixed(2)} kWh

💡 Calculations:
Net Usage: ${netUsage.toFixed(2)} kWh
Total Consumption: ${totalConsumption.toFixed(2)} kWh

${targetDate !== new Date().toISOString().split('T')[0] ? '⚠️ Note: Data overwritten for this date' : ''}`

    await sendTelegramMessage(chatId, confirmationMessage)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured')
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    })
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}
