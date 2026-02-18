export interface BaseReading {
  id: string
  solar_inverter_reading: number
  solar_meter_reading: number
  smart_meter_export: number
  smart_meter_imported: number
  created_at: string
  updated_at: string
}

export interface DailyReading {
  id: string
  date: string
  solar_inverter_reading: number
  solar_meter_reading: number
  smart_meter_export: number
  smart_meter_imported: number
  created_at: string
}

export interface DailyReadingInsert {
  date: string
  solar_inverter_reading: number
  solar_meter_reading: number
  smart_meter_export: number
  smart_meter_imported: number
}

export interface MonthlyStats {
  totalSolar: number
  totalImport: number
  totalExport: number
  netUsage: number
  totalConsumption: number
}
