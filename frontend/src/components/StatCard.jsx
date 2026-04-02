export default function StatCard({ label, value, sub, color = 'green' }) {
  const colors = {
    green: 'text-brand-400',
    red:   'text-red-400',
    blue:  'text-blue-400',
    slate: 'text-slate-300',
  }
  return (
    <div className="card p-5 animate-fadeIn">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <p className={`font-display text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}