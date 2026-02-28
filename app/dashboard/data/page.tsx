import { createServerClient } from '@/lib/supabase'
import DataTable from '../data/data-table.client'
import AddReadingModal from '../data/add-reading-modal.client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DataPage({
  searchParams,
}: {
  searchParams?: { start?: string; end?: string }
}) {
  const supabase = createServerClient()

  const startDate = searchParams?.start
  const endDate = searchParams?.end

  let query = supabase
    .from('daily_readings')
    .select('*')
    .order('date', { ascending: false })

  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate)
  }

  const { data } = await query

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Full Data Table
      </h1>

      {/* <AddReadingModal /> */}

      <DataTable data={data ?? []} />
    </div>
  )
}