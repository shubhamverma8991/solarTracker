import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Solar Monitoring Service</h1>
          <p className="text-xl text-gray-400 mb-12">
            Track your solar energy generation, import, export, and consumption
            in real-time
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </Link>
          </div>

          <div className="mt-16 p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-left">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400">1.</span>
                <span>
                  Send daily readings via Telegram bot in the format:{' '}
                  <code className="bg-gray-700 px-2 py-1 rounded">
                    solar_inverter solar_meter smart_export smart_import
                  </code>
                  <br />
                  <span className="text-sm text-gray-400 ml-6">
                    Example: 18.5 29650.2 6.2 4060.5
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">2.</span>
                <span>
                  Data is automatically saved to Supabase database
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400">3.</span>
                <span>
                  View monthly statistics and analytics on the dashboard
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
