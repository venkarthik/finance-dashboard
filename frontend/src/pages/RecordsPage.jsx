import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const fmt     = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const CATEGORIES = ['Salary', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Entertainment', 'Freelance', 'Rent', 'Other']
const emptyForm  = { amount: '', type: 'INCOME', category: '', date: '', notes: '' }

export default function RecordsPage() {
  const { isAdmin } = useAuth()
  const [records,    setRecords]    = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [filters,    setFilters]    = useState({ page: 1, type: '', category: '', search: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: filters.page, limit: 10 })
      if (filters.type)     params.append('type',     filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.search)   params.append('search',   filters.search)
      const res = await api.get(`/records?${params}`)
      setRecords(res.data.data.records)
      setPagination(res.data.data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit   = (rec) => {
    setEditing(rec)
    setForm({ amount: rec.amount, type: rec.type, category: rec.category, date: rec.date.slice(0,10), notes: rec.notes || '' })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.amount || !form.category || !form.date) { setError('Amount, category and date are required.'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editing) await api.put(`/records/${editing.id}`, payload)
      else         await api.post('/records', payload)
      setShowModal(false)
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save record.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try { await api.delete(`/records/${id}`); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed to delete.') }
  }

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Records</h1>
          <p className="text-slate-400 text-sm mt-1">Manage financial transactions</p>
        </div>
        {isAdmin && <button onClick={openCreate} className="btn-primary">+ Add Record</button>}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[160px]" placeholder="Search category or notes..."
          value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        <select className="input w-36" value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select className="input w-40" value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-secondary px-3" onClick={() => setFilters({ page: 1, type: '', category: '', search: '' })}>Clear</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-3" />
            Loading...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No records found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['Date', 'Type', 'Category', 'Amount', 'Notes', isAdmin && 'Actions'].filter(Boolean).map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-300 font-mono">{fmtDate(rec.date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={rec.type === 'INCOME' ? 'badge-income' : 'badge-expense'}>
                      {rec.type === 'INCOME' ? '↑' : '↓'} {rec.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-300">{rec.category}</td>
                  <td className={`px-5 py-3.5 text-sm font-mono font-medium ${rec.type === 'INCOME' ? 'text-brand-400' : 'text-red-400'}`}>
                    {rec.type === 'INCOME' ? '+' : '-'}{fmt(rec.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[160px] truncate">{rec.notes || '—'}</td>
                  {isAdmin && (
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(rec)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(rec.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} records</span>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
            <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-white mb-5">{editing ? 'Edit Record' : 'New Record'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount</label>
                  <input className="input" type="number" placeholder="0.00" value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes <span className="text-slate-600">(optional)</span></label>
                <input className="input" placeholder="Add a note..." value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Create record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}