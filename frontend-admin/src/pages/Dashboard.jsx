import { ShoppingCart, Users, FileText, CreditCard } from 'lucide-react'

const stats = [
  { label: 'Total Orders',   value: '—', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
  { label: 'Customers',      value: '—', icon: Users,        color: 'bg-green-50 text-green-600' },
  { label: 'Invoices',       value: '—', icon: FileText,     color: 'bg-purple-50 text-purple-600' },
  { label: 'Payments Today', value: '—', icon: CreditCard,   color: 'bg-amber-50 text-amber-600' },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts — P2 will wire up real data */}
      <div className="card p-6 text-center text-gray-400 text-sm">
        Charts and recent activity will appear here once API routes are connected.
      </div>
    </div>
  )
}
