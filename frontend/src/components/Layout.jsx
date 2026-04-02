import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/records',   label: 'Records',   icon: '≡' },
  { to: '/users',     label: 'Users',     icon: '◉', adminOnly: true },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className="w-60 flex flex-col border-r border-surface-border bg-surface-card shrink-0">
        <div className="px-6 py-5 border-b border-surface-border">
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Fin<span className="text-brand-500">Flow</span>
          </span>
          <p className="text-xs text-slate-500 mt-0.5">Finance Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon, adminOnly }) => {
            if (adminOnly && !isAdmin) return null
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                {label}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-secondary text-sm py-2">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}