import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, IndianRupee, Users, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'

export default function Reports() {
  // ── Summary stats ──
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => api.get('/reports/summary').then(r => r.data),
  })

  // ── Monthly chart data ──
  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['reports', 'monthly'],
    queryFn: () => api.get('/reports/monthly').then(r => r.data),
  })

  const monthlyData = Array.isArray(monthly) ? monthly : monthly?.data ?? []

  const stats = [
    {
      label: 'Total Orders',
      value: summary?.totalOrders ?? '—',
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Revenue',
      value: summary?.totalRevenue != null ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '—',
      icon: IndianRupee,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Customers',
      value: summary?.totalCustomers ?? '—',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Pending Invoices',
      value: summary?.pendingInvoices ?? '—',
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-1">Business overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            {summaryLoading ? (
              <div className="animate-pulse flex items-center justify-between">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        {monthlyLoading ? (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
            Loading chart…
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
            No monthly data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
