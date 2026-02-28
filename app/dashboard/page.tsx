// app/dashboard/page.tsx

import { createServerClient } from '@/lib/supabase'
import DateFilter from './date-filter.client'
import SolarChart from './solar-chart.client'
import ImportExportChart from './import-export-chart.client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Stats = {
  totalSolar: number
  totalImport: number
  totalExport: number
  netUsage: number
  totalConsumption: number
  billingUnit: number
}

async function getStats(startDate: string, endDate: string) {
  const supabase = createServerClient()

  // Base reading
  const { data: baseReading } = await supabase
    .from('base_readings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const base = baseReading ?? {
    smart_meter_export: 0,
    smart_meter_imported: 0,
  }

  // Range rows
  const { data: rangeRows } = await supabase
    .from('daily_readings')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  const rows = rangeRows ?? []

  // ✅ Total Solar (sum of daily inverter)
  const totalSolar = rows.reduce(
    (acc, r) => acc + Number(r.solar_inverter_reading ?? 0),
    0
  )

  // Get last reading in selected range
  const { data: lastReading } = await supabase
    .from('daily_readings')
    .select('*')
    .lte('date', endDate)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (!lastReading) {
    return {
      stats: {
        totalSolar: 0,
        totalImport: 0,
        totalExport: 0,
        netUsage: 0,
        totalConsumption: 0,
        billingUnit: 0,
      },
      dailyChartData: [],
    }
  }

  // Previous reading before start date
  const { data: previousReading } = await supabase
    .from('daily_readings')
    .select('*')
    .lt('date', startDate)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const reference = previousReading ?? base

  // Range import/export difference
  const totalExport =
    Number(lastReading.smart_meter_export ?? 0) -
    Number(reference.smart_meter_export ?? 0)

  const totalImport =
    Number(lastReading.smart_meter_imported ?? 0) -
    Number(reference.smart_meter_imported ?? 0)

  const safeExport = Math.max(0, totalExport)
  const safeImport = Math.max(0, totalImport)

  const netUsage = safeImport - safeExport
  const selfConsumed = Math.max(0, totalSolar - safeExport)
  const totalConsumption = safeImport + selfConsumed

  // 🔥 BILLING UNIT (actual meter reading difference)
  const finalImportReading = Number(lastReading.smart_meter_imported ?? 0)
  const finalExportReading = Number(lastReading.smart_meter_export ?? 0)

  const billingUnit = Math.max(
    0,
    finalImportReading - finalExportReading
  )

  // ✅ Convert cumulative → daily delta (for charts)
  const dailyChartData = rows.map((row, index) => {
    const prev = index === 0 ? null : rows[index - 1]

    const dailyImport = prev
      ? Number(row.smart_meter_imported) -
        Number(prev.smart_meter_imported)
      : 0

    const dailyExport = prev
      ? Number(row.smart_meter_export) -
        Number(prev.smart_meter_export)
      : 0

    const solar = Number(row.solar_inverter_reading ?? 0)

    const safeImportDaily = Math.max(0, dailyImport)
    const safeExportDaily = Math.max(0, dailyExport)

    const selfConsumedDaily = Math.max(0, solar - safeExportDaily)
    const used = safeImportDaily + selfConsumedDaily

    return {
      date: row.date.slice(5),
      solar,
      import: safeImportDaily,
      export: safeExportDaily,
      used,
    }
  })

  return {
    stats: {
      totalSolar: Number(totalSolar.toFixed(2)),
      totalImport: Number(safeImport.toFixed(2)),
      totalExport: Number(safeExport.toFixed(2)),
      netUsage: Number(netUsage.toFixed(2)),
      totalConsumption: Number(totalConsumption.toFixed(2)),
      billingUnit: Number(billingUnit.toFixed(2)),
    },
    dailyChartData,
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { start?: string; end?: string }
}) {
  const today = new Date()

  const defaultStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split('T')[0]

  const defaultEnd = today.toISOString().split('T')[0]

  const startDate = searchParams?.start ?? defaultStart
  const endDate = searchParams?.end ?? defaultEnd

  const { stats, dailyChartData } =
    await getStats(startDate, endDate)

  const cards = [
    { title: 'Solar', value: stats.totalSolar, icon: '☀️' },
    { title: 'Import', value: stats.totalImport, icon: '⬇️' },
    { title: 'Export', value: stats.totalExport, icon: '⬆️' },
    { title: 'Approx Bill Value', value: stats.netUsage, icon: '📊' },
    { title: 'Consumption', value: stats.totalConsumption, icon: '🔌' },
    { title: 'Bill Unit', value: stats.billingUnit, icon: '🧾' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">

        <h1 className="text-4xl font-bold mb-6">
          Solar Monitoring Dashboard
        </h1>

        <div className="mb-10 flex justify-end">
          <Link href="/dashboard/data">
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded">
              View Full Data
            </button>
          </Link>
        </div>

        <DateFilter defaultStart={startDate} defaultEnd={endDate} />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {cards.map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-lg border bg-gray-800 border-gray-700"
            >
              <div className="flex justify-between mb-3">
                <h2>{card.title}</h2>
                <span>{card.icon}</span>
              </div>
              <div className="text-3xl font-bold">
                {card.value.toFixed(2)} kWh
              </div>
            </div>
          ))}
        </div>

        {/* Chart 1: Daily Solar */}
        <div className="mb-10">
          <SolarChart data={dailyChartData} />
        </div>

        {/* Chart 2: Import vs Export vs Used */}
        <div className="mb-12">
          <ImportExportChart data={dailyChartData} />
        </div>

      </div>
    </div>
  )
}