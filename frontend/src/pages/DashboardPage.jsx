import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../services/api'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const fmt     = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { isAnalyst } = useAuth()
  const [summary,    setSummary]    = useState(null)
  const [monthly,    setMonthly]    = useState([])
  const [categories, setCategories] = useState([])
  const [activity,   setActivity]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/activity?limit=6'),
        ])
        setSummary(s.data.data)
        setActivity(a.data.data.activity)
        if (isAnalyst) {
          const [m, c] = await Promise.all([
            api.get('/dashboard/trends/monthly'),
            api.get('/dashboard/categories'),
          ])
          setMonthly(m.data.data.trends.slice(-6))
          setCategories(c.data.data.categories.slice(0, 6))
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [isAnalyst])

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Financial overview and insights</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Income"   value={fmt(summary.totalIncome)}   color="green" sub={`${summary.totalRecords} records total`} />
          <StatCard label="Total Expenses" value={fmt(summary.totalExpenses)} color="red" />
          <StatCard label="Net Balance"    value={fmt(summary.netBalance)}    color={summary.netBalance >= 0 ? 'green' : 'red'} />
          <StatCard label="Total Records"  value={summary.totalRecords}       color="slate" />
        </div>
      )}

      {isAnalyst && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="text-sm font-medium text-slate-300 mb-4">Monthly Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  stroke="#22c55e" fill="url(#gIncome)"  strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-medium text-slate-300 mb-4">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income"  name="Income"  radius={[0, 4, 4, 0]}>{categories.map((_, i) => <Cell key={i} fill="#22c55e" fillOpacity={0.7} />)}</Bar>
                <Bar dataKey="expense" name="Expense" radius={[0, 4, 4, 0]}>{categories.map((_, i) => <Cell key={i} fill="#ef4444" fillOpacity={0.7} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {activity.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>}
          {activity.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${rec.type === 'INCOME' ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'}`}>
                  {rec.type === 'INCOME' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{rec.category}</p>
                  <p className="text-xs text-slate-500">{fmtDate(rec.date)} · {rec.user?.name}</p>
                </div>
              </div>
              <span className={`font-mono text-sm font-medium ${rec.type === 'INCOME' ? 'text-brand-400' : 'text-red-400'}`}>
                {rec.type === 'INCOME' ? '+' : '-'}{fmt(rec.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}