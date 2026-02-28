'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DataTable({ data }: { data: any[] }) {
  const router = useRouter()

  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const applyFilter = () => {
    if (!start || !end) return
    router.push(`?start=${start}&end=${end}`)
    router.refresh()
  }

  return (
    <div className="mt-6">

      {/* Date Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
        />
        <button
          onClick={applyFilter}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Solar</th>
              <th className="border px-3 py-2">Export</th>
              <th className="border px-3 py-2">Import</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="text-center">
                <td className="border px-2 py-1">{row.date}</td>
                <td className="border px-2 py-1">{row.solar_inverter_reading}</td>
                <td className="border px-2 py-1">{row.smart_meter_export}</td>
                <td className="border px-2 py-1">{row.smart_meter_imported}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}