import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users,      setUsers]      = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({ name: '', role: 'VIEWER', status: 'ACTIVE' })
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [page,       setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users?page=${page}&limit=10`)
      setUsers(res.data.data.users)
      setPagination(res.data.data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, role: u.role, status: u.status })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await api.put(`/users/${editing.id}`, form)
      setShowModal(false)
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update user.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await api.delete(`/users/${id}`); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed to delete.') }
  }

  const roleBadge = (role) => {
    if (role === 'ADMIN')   return <span className="badge-admin">Admin</span>
    if (role === 'ANALYST') return <span className="badge-analyst">Analyst</span>
    return <span className="badge-viewer">Viewer</span>
  }

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">Manage user accounts and roles</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-3" />
            Loading...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border
                      ${u.status === 'ACTIVE'
                        ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400 font-mono">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(u)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      {u.id !== me?.id && (
                        <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} users</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-white mb-5">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="VIEWER">Viewer</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}