import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, X } from 'lucide-react'
import api from '../../api/axios'

const STATUS_OPTIONS = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const badgeClass = (status) => {
  const map = {
    pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
    shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export default function Orders() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  // ── Fetch ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => {
      const params = statusFilter !== 'All' ? { status: statusFilter } : {}
      return api.get('/orders', { params }).then(r => r.data)
    },
  })

  const orders = data?.data ?? (Array.isArray(data) ? data : [])

  // ── Open detail ──
  const openDetail = (order) => {
    setSelected(order)
    setNewStatus(order.status || 'pending')
  }

  // ── Status update mutation ──
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelected(null)
    },
  })

  const handleStatusSave = () => {
    if (selected) statusMutation.mutate({ id: selected._id, status: newStatus })
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">Failed to load orders. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Order No.</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Items</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total (₹)</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers start placing them</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o._id}
                      onClick={() => openDetail(o)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{o.orderNumber || o._id?.slice(-8)}</td>
                      <td className="px-4 py-3 text-gray-500">{o.customer?.name || o.customerName || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{o.items?.length ?? 0}</td>
                      <td className="px-4 py-3 text-gray-900">₹{o.totalAmount?.toLocaleString('en-IN') ?? o.grandTotal?.toLocaleString('en-IN') ?? '0'}</td>
                      <td className="px-4 py-3"><span className={badgeClass(o.status)}>{o.status || 'pending'}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Order No.</p>
                  <p className="font-medium text-gray-900 font-mono">{selected.orderNumber || selected._id?.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Customer</p>
                  <p className="font-medium text-gray-900">{selected.customer?.name || selected.customerName || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <span className={badgeClass(selected.status)}>{selected.status || 'pending'}</span>
                </div>
              </div>

              {/* Line items */}
              {selected.items && selected.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-medium text-gray-500">Product</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Qty</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Unit Price</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900">{item.product?.name || item.name || '—'}</td>
                          <td className="px-3 py-2 text-gray-500 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-gray-500 text-right">₹{item.unitPrice?.toLocaleString('en-IN') ?? item.price?.toLocaleString('en-IN') ?? '0'}</td>
                          <td className="px-3 py-2 text-gray-900 text-right">₹{((item.quantity || 0) * (item.unitPrice || item.price || 0)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-1 text-sm text-right">
                <p className="text-gray-500">Subtotal: <span className="text-gray-900 font-medium">₹{(selected.subtotal ?? selected.totalAmount ?? 0).toLocaleString('en-IN')}</span></p>
                {selected.tax != null && <p className="text-gray-500">Tax: <span className="text-gray-900 font-medium">₹{selected.tax.toLocaleString('en-IN')}</span></p>}
                {selected.discount != null && <p className="text-gray-500">Discount: <span className="text-gray-900 font-medium">-₹{selected.discount.toLocaleString('en-IN')}</span></p>}
                <p className="text-gray-700 font-semibold text-base">Grand Total: ₹{(selected.grandTotal ?? selected.totalAmount ?? 0).toLocaleString('en-IN')}</p>
              </div>

              {/* Status update */}
              <div className="border-t border-gray-200 pt-4 flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input">
                    {STATUS_OPTIONS.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleStatusSave} className="btn-primary" disabled={statusMutation.isPending}>
                  {statusMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
