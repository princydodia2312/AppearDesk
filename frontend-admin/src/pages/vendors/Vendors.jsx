import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Truck, X } from 'lucide-react'
import api from '../../api/axios'

const emptyForm = {
  name: '', email: '', phone: '', company: '',
  address: { street: '', city: '', state: '', zip: '', country: '' },
  isActive: true,
}

export default function Vendors() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // ── Fetch ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendors', search],
    queryFn: () => api.get('/vendors', { params: { search } }).then(r => r.data),
  })

  const vendors = data?.data ?? (Array.isArray(data) ? data : [])

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (body) => api.post('/vendors', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/vendors/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vendors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  })

  // ── Helpers ──
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (v) => {
    setEditing(v)
    setForm({
      name: v.name || '',
      email: v.email || '',
      phone: v.phone || '',
      company: v.company || '',
      address: {
        street: v.address?.street || '',
        city: v.address?.city || '',
        state: v.address?.state || '',
        zip: v.address?.zip || '',
        country: v.address?.country || '',
      },
      isActive: v.isActive ?? true,
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm) }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) deleteMutation.mutate(id)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) updateMutation.mutate({ id: editing._id, body: form })
    else createMutation.mutate(form)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onAddressChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, address: { ...prev.address, [name]: value } }))
  }

  const statusBadge = (active) =>
    active !== false ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Vendors</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your vendor directory</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">Failed to load vendors. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 font-medium text-gray-500">City</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Truck size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No vendors found</p>
                      <p className="text-gray-400 text-xs mt-1">Add your first vendor to get started</p>
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-4 py-3 text-gray-500">{v.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{v.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{v.company || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{v.address?.city || '—'}</td>
                      <td className="px-4 py-3">{statusBadge(v.isActive)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-primary-600 p-1 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(v._id)} className="text-gray-400 hover:text-red-500 p-1 ml-1 transition-colors"><Trash2 size={15} /></button>
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
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" value={form.name} onChange={onChange} required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" value={form.email} onChange={onChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input name="company" value={form.company} onChange={onChange} className="input" />
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Address</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input name="street" value={form.address.street} onChange={onAddressChange} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input name="city" value={form.address.city} onChange={onAddressChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input name="state" value={form.address.state} onChange={onAddressChange} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input name="zip" value={form.address.zip} onChange={onAddressChange} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input name="country" value={form.address.country} onChange={onAddressChange} className="input" />
                </div>
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
