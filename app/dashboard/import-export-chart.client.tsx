'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function ImportExportChart({
  data,
}: {
  data: any[]
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">
        Daily Import vs Export vs Used
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="import"
              stroke="#3b82f6"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="export"
              stroke="#22c55e"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="used"
              stroke="#f97316"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}