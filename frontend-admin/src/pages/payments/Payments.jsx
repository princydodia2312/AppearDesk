import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CreditCard, X } from 'lucide-react'
import api from '../../api/axios'

const METHOD_OPTIONS = ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other']

const badgeClass = (status) => {
  const map = { completed: 'badge-green', success: 'badge-green', pending: 'badge-yellow', failed: 'badge-red' }
  return map[status] || 'badge-blue'
}

const emptyForm = { invoiceId: '', amount: '', method: 'cash', notes: '' }

export default function Payments() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  // ── Fetch ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(r => r.data),
  })

  const payments = data?.data ?? (Array.isArray(data) ? data : [])

  // ── Create mutation ──
  const createMutation = useMutation({
    mutationFn: (body) => api.post('/payments', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); closeModal() },
  })

  const closeModal = () => { setModalOpen(false); setForm(emptyForm) }

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({ ...form, amount: Number(form.amount) })
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500 mt-1">Record and track payment transactions</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">Failed to load payments. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Invoice No.</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Amount (₹)</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Method</th>
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
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No payments recorded</p>
                      <p className="text-gray-400 text-xs mt-1">Record your first payment to get started</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{p.invoice?.invoiceNumber || p.invoiceId || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.invoice?.customer?.name || p.customerName || '—'}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.method?.replace('_', ' ') || '—'}</td>
                      <td className="px-4 py-3"><span className={badgeClass(p.status)}>{p.status || 'completed'}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.createdAt || p.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                <input name="invoiceId" value={form.invoiceId} onChange={onChange} className="input" placeholder="Paste invoice ID…" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={onChange} required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select name="method" value={form.method} onChange={onChange} className="input">
                  {METHOD_OPTIONS.map(m => (
                    <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={onChange} rows={3} className="input" placeholder="Optional notes…" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Recording…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
