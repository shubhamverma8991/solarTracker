'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddReadingModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    date: '',
    solar: '',
    export: '',
    importVal: '',
  })

  const handleSubmit = async () => {
    await supabase.from('daily_readings').insert({
      date: form.date,
      solar_inverter_reading: Number(form.solar),
      smart_meter_export: Number(form.export),
      smart_meter_imported: Number(form.importVal),
    })

    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 px-4 py-2 rounded mb-6"
      >
        Add Reading
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 space-y-4">

            <h2 className="text-xl font-semibold">Add Reading</h2>

            <input
              type="date"
              className="w-full bg-gray-700 p-2 rounded"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              type="number"
              placeholder="Solar"
              className="w-full bg-gray-700 p-2 rounded"
              onChange={(e) => setForm({ ...form, solar: e.target.value })}
            />

            <input
              type="number"
              placeholder="Export"
              className="w-full bg-gray-700 p-2 rounded"
              onChange={(e) => setForm({ ...form, export: e.target.value })}
            />

            <input
              type="number"
              placeholder="Import"
              className="w-full bg-gray-700 p-2 rounded"
              onChange={(e) =>
                setForm({ ...form, importVal: e.target.value })
              }
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}