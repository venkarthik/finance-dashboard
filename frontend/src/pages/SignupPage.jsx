import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function SignupPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'VIEWER' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fadeIn relative">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-white">
            Fin<span className="text-brand-500">Flow</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Create your account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="label">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'VIEWER' }))}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150
                    ${form.role === 'VIEWER'
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                      : 'bg-surface-hover border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <p className="font-semibold">Viewer</p>
                  <p className="text-xs mt-0.5 opacity-70">View dashboard only</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'ANALYST' }))}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150
                    ${form.role === 'ANALYST'
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                      : 'bg-surface-hover border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <p className="font-semibold">Analyst</p>
                  <p className="text-xs mt-0.5 opacity-70">View + analytics</p>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}