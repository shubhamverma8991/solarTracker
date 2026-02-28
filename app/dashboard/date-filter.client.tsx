'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function DateFilter({
  defaultStart,
  defaultEnd,
}: {
  defaultStart: string
  defaultEnd: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  const applyFilter = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(() => {
      const params = new URLSearchParams()
      params.set('start', start)
      params.set('end', end)

      router.push(`?${params.toString()}`)
      router.refresh()
    })
  }

  const refreshData = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-white text-lg animate-pulse">
            Loading data...
          </div>
        </div>
      )}

      <form
        onSubmit={applyFilter}
        className="mb-8 flex gap-4 items-end flex-wrap"
      >
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={refreshData}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </form>
    </>
  )
}