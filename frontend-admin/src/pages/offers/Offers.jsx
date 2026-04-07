import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react'
import api from '../../api/axios'

const TYPE_OPTIONS = ['percentage', 'fixed', 'free_shipping']

const emptyForm = {
  title: '', code: '', type: 'percentage', value: '',
  minOrderAmount: '', maxUses: '', startDate: '', endDate: '', isActive: true,
}

export default function Offers() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // ── Fetch ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: () => api.get('/offers').then(r => r.data),
  })

  const offers = data?.data ?? (Array.isArray(data) ? data : [])

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (body) => api.post('/offers', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/offers/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['offers'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/offers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  })

  // ── Helpers ──
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (o) => {
    setEditing(o)
    setForm({
      title: o.title || '',
      code: o.code || '',
      type: o.type || 'percentage',
      value: o.value ?? '',
      minOrderAmount: o.minOrderAmount ?? '',
      maxUses: o.maxUses ?? '',
      startDate: o.startDate ? o.startDate.slice(0, 10) : '',
      endDate: o.endDate ? o.endDate.slice(0, 10) : '',
      isActive: o.isActive ?? true,
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm) }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) deleteMutation.mutate(id)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const body = {
      ...form,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    }
    if (editing) updateMutation.mutate({ id: editing._id, body })
    else createMutation.mutate(body)
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const typeLabel = (t) => {
    const map = { percentage: 'Percentage', fixed: 'Fixed Amount', free_shipping: 'Free Shipping' }
    return map[t] || t
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Offers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage promotional offers and discount codes</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Offer
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">Failed to load offers. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Value</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Usage</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Active</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Expires</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Tag size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No offers found</p>
                      <p className="text-gray-400 text-xs mt-1">Create your first promotional offer</p>
                    </td>
                  </tr>
                ) : (
                  offers.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.title}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-gray-100 text-gray-800 font-mono text-xs">{o.code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{typeLabel(o.type)}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {o.type === 'percentage' ? `${o.value}%` : o.type === 'fixed' ? `₹${o.value?.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{o.usedCount ?? 0}/{o.maxUses ?? '∞'}</td>
                      <td className="px-4 py-3">
                        {o.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.endDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(o)} className="text-gray-400 hover:text-primary-600 p-1 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(o._id)} className="text-gray-400 hover:text-red-500 p-1 ml-1 transition-colors"><Trash2 size={15} /></button>
                      </td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Offer' : 'Add Offer'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" value={form.title} onChange={onChange} required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input name="code" value={form.code} onChange={onChange} required className="input font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" value={form.type} onChange={onChange} className="input">
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{typeLabel(t)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input name="value" type="number" min="0" step="0.01" value={form.value} onChange={onChange} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input name="minOrderAmount" type="number" min="0" value={form.minOrderAmount} onChange={onChange} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input name="maxUses" type="number" min="0" value={form.maxUses} onChange={onChange} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={onChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={onChange} className="input" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} id="offerActive" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="offerActive" className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
