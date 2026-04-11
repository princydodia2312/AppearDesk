import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, X } from 'lucide-react'
import api from '../../api/axios'

const STATUS_OPTIONS = ['All', 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']

const badgeClass = (status) => {
  const map = {
    draft: 'badge-gray', sent: 'badge-blue', paid: 'badge-green',
    overdue: 'badge-red', cancelled: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  // ── Fetch ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => {
      const params = statusFilter !== 'All' ? { status: statusFilter } : {}
      return api.get('/invoices', { params }).then(r => r.data)
    },
  })

  const invoices = data?.data ?? (Array.isArray(data) ? data : [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage invoices</p>
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
          <div className="p-8 text-center text-red-500 text-sm">Failed to load invoices. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Invoice No.</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total (₹)</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No invoices found</p>
                      <p className="text-gray-400 text-xs mt-1">Invoices will appear here once they are generated</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv._id}
                      onClick={() => setSelected(inv)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{inv.invoiceNumber || inv._id?.slice(-8)}</td>
                      <td className="px-4 py-3 text-gray-500">{inv.customer?.name || inv.customerName || '—'}</td>
                      <td className="px-4 py-3 text-gray-900 font-bold">₹{(inv.total || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={badgeClass(inv.status)}>{inv.status || 'draft'}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(inv.dueDate)}</td>
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
              <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Invoice No.</p>
                  <p className="font-medium text-gray-900 font-mono">{selected.invoiceNumber || selected._id?.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Customer</p>
                  <p className="font-medium text-gray-900">{selected.customer?.name || selected.customerName || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Due Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selected.dueDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <span className={badgeClass(selected.status)}>{selected.status || 'draft'}</span>
                </div>
              </div>

              {/* Line items */}
              {selected.items && selected.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-medium text-gray-500">Description</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Qty</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Unit Price</th>
                        <th className="px-3 py-2 font-medium text-gray-500 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900">{item.description || '—'}</td>
                          <td className="px-3 py-2 text-gray-500 text-right">{item.qty}</td>
                          <td className="px-3 py-2 text-gray-500 text-right">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-gray-900 text-right">₹{(item.total || (item.qty * item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-1 text-sm text-right">
                <p className="text-gray-500">Subtotal: <span className="text-gray-900 font-medium">₹{(selected.subtotal || 0).toLocaleString('en-IN')}</span></p>
                {selected.tax != null && <p className="text-gray-500">Tax: <span className="text-gray-900 font-medium">₹{selected.tax.toLocaleString('en-IN')}</span></p>}
                {selected.discount != null && selected.discount > 0 && <p className="text-gray-500">Discount: <span className="text-emerald-600 font-medium">-₹{selected.discount.toLocaleString('en-IN')}</span></p>}
                <p className="text-gray-900 font-bold text-lg">Total: ₹{(selected.total || 0).toLocaleString('en-IN')}</p>
                {selected.status === 'paid' && selected.paidAt && (
                   <p className="text-xs text-green-600 font-medium">Fully Paid on {formatDate(selected.paidAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
