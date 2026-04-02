import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@finance.com',   password: 'password123' },
      analyst: { email: 'analyst@finance.com', password: 'password123' },
      viewer:  { email: 'viewer@finance.com',  password: 'password123' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fadeIn relative">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-white">Fin<span className="text-brand-500">Flow</span></h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your finance dashboard</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-4 card p-4">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {['admin', 'analyst', 'viewer'].map((role) => (
              <button key={role} onClick={() => fillDemo(role)}
                className="text-xs py-2 px-3 rounded-lg bg-surface-hover hover:bg-surface-border
                           border border-surface-border text-slate-400 hover:text-slate-200
                           transition-all duration-150 capitalize font-medium">
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">Click a role to fill credentials</p>
        </div>
      </div>
    </div>
  )
}