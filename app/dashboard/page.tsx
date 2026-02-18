import { createServerClient } from '@/lib/supabase'
import { MonthlyStats } from '@/types'

async function getMonthlyStats(): Promise<MonthlyStats> {
  const supabase = createServerClient()

  // Get base readings (starting point)
  const { data: baseReading, error: baseError } = await supabase
    .from('base_readings')
    .select('*')
    .single()

  if (baseError) {
    console.error('Error fetching base readings:', baseError)
    throw new Error('Failed to fetch base readings')
  }

  // Get current month's start and end dates
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const startDate = firstDay.toISOString().split('T')[0]
  const endDate = lastDay.toISOString().split('T')[0]

  // Fetch readings for current month
  const { data: readings, error } = await supabase
    .from('daily_readings')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to fetch data')
  }

  if (!readings || readings.length === 0) {
    return {
      totalSolar: 0,
      totalImport: 0,
      totalExport: 0,
      netUsage: 0,
      totalConsumption: 0,
    }
  }

  // Get previous month's last reading if exists
  const prevMonthLastDay = new Date(firstDay)
  prevMonthLastDay.setDate(prevMonthLastDay.getDate() - 1)
  const prevMonthDate = prevMonthLastDay.toISOString().split('T')[0]

  const { data: prevMonthReading } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', prevMonthDate)
    .single()

  // Calculate daily differences and sum them up
  let totalSolar = 0
  let totalImport = 0
  let totalExport = 0

  for (let index = 0; index < readings.length; index++) {
    const reading = readings[index]
    const solarInverter = Number(reading.solar_inverter_reading) || 0
    const smartExport = Number(reading.smart_meter_export) || 0
    const smartImported = Number(reading.smart_meter_imported) || 0

    let previousSolar = 0
    let previousExport = 0
    let previousImport = 0

    if (index === 0) {
      // First reading of the month - compare with previous month's last reading or base
      if (prevMonthReading) {
        previousSolar = Number(prevMonthReading.solar_inverter_reading) || 0
        previousExport = Number(prevMonthReading.smart_meter_export) || 0
        previousImport = Number(prevMonthReading.smart_meter_imported) || 0
      } else if (baseReading) {
        previousSolar = Number(baseReading.solar_inverter_reading) || 0
        previousExport = Number(baseReading.smart_meter_export) || 0
        previousImport = Number(baseReading.smart_meter_imported) || 0
      }
    } else {
      // Compare with previous day in the same month
      const prevReading = readings[index - 1]
      previousSolar = Number(prevReading.solar_inverter_reading) || 0
      previousExport = Number(prevReading.smart_meter_export) || 0
      previousImport = Number(prevReading.smart_meter_imported) || 0
    }

    // Calculate daily differences (ensure non-negative)
    const dailySolar = Math.max(0, solarInverter - previousSolar)
    const dailyExport = Math.max(0, smartExport - previousExport)
    const dailyImport = Math.max(0, smartImported - previousImport)

    totalSolar += dailySolar
    totalExport += dailyExport
    totalImport += dailyImport
  }

  // Calculate derived metrics
  const netUsage = totalImport - totalExport
  const selfConsumed = totalSolar - totalExport
  const totalConsumption = totalImport + selfConsumed

  return {
    totalSolar,
    totalImport,
    totalExport,
    netUsage,
    totalConsumption,
  }
}

export default async function DashboardPage() {
  let stats: MonthlyStats
  let error: string | null = null

  try {
    stats = await getMonthlyStats()
  } catch (e) {
    error = 'Failed to load dashboard data'
    stats = {
      totalSolar: 0,
      totalImport: 0,
      totalExport: 0,
      netUsage: 0,
      totalConsumption: 0,
    }
  }

  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const cards = [
    {
      title: 'Total Solar Generation',
      value: stats.totalSolar.toFixed(2),
      unit: 'kWh',
      color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      icon: '☀️',
    },
    {
      title: 'Total Import',
      value: stats.totalImport.toFixed(2),
      unit: 'kWh',
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      icon: '⬇️',
    },
    {
      title: 'Total Export',
      value: stats.totalExport.toFixed(2),
      unit: 'kWh',
      color: 'bg-green-500/10 border-green-500/20 text-green-400',
      icon: '⬆️',
    },
    {
      title: 'Net Usage',
      value: stats.netUsage.toFixed(2),
      unit: 'kWh',
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      icon: '📊',
    },
    {
      title: 'Total Consumption',
      value: stats.totalConsumption.toFixed(2),
      unit: 'kWh',
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      icon: '🔌',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Solar Monitoring Dashboard</h1>
          <p className="text-gray-400">Statistics for {currentMonth}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`p-6 rounded-lg border ${card.color} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{card.value}</span>
                <span className="text-gray-400">{card.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Calculation Details</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong>Net Usage:</strong> Total Import - Total Export ={' '}
              {stats.totalImport.toFixed(2)} - {stats.totalExport.toFixed(2)} ={' '}
              {stats.netUsage.toFixed(2)} kWh
            </p>
            <p>
              <strong>Self Consumed:</strong> Solar Generation - Export ={' '}
              {stats.totalSolar.toFixed(2)} - {stats.totalExport.toFixed(2)} ={' '}
              {(stats.totalSolar - stats.totalExport).toFixed(2)} kWh
            </p>
            <p>
              <strong>Total Consumption:</strong> Import + Self Consumed ={' '}
              {stats.totalImport.toFixed(2)} +{' '}
              {(stats.totalSolar - stats.totalExport).toFixed(2)} ={' '}
              {stats.totalConsumption.toFixed(2)} kWh
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
