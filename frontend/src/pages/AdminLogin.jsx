import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? 'Login failed')
        return
      }
      const data = await res.json()
      localStorage.setItem('eco_admin_token', data.access_token)
      navigate('/admin/dashboard')
    } catch {
      setError('Cannot reach backend. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-eco-950 eco-grid-bg eco-radial-glow">

      <div className="relative z-10 w-full max-w-sm fade-in">

        {/* Card */}
        <div className="eco-card eco-card-glow rounded-2xl p-8 border border-eco-700">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-eco-800 border border-eco-600
                            flex items-center justify-center mb-4 shadow-eco-sm">
              <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"
                      stroke="#22c55e" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="4" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <h1 className="font-brand font-semibold text-eco-400 text-xl">eco-swap</h1>
            <p className="text-eco-700 text-xs mt-0.5 tracking-widest uppercase">Admin Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-eco-600 text-xs uppercase tracking-widest mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full bg-eco-900 border border-eco-700 rounded-lg px-3 py-2.5
                           text-eco-200 text-sm placeholder-eco-800 outline-none
                           focus:border-eco-500 focus:ring-1 focus:ring-eco-500/30 transition"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-eco-600 text-xs uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-eco-900 border border-eco-700 rounded-lg px-3 py-2.5
                           text-eco-200 text-sm placeholder-eco-800 outline-none
                           focus:border-eco-500 focus:ring-1 focus:ring-eco-500/30 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs py-2 px-3 bg-red-900/30 border border-red-700/40 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="eco-btn-primary w-full rounded-lg py-3 text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>

        <p className="text-center text-eco-800 text-xs mt-6">
          eco-swap admin portal — restricted access
        </p>
      </div>
    </div>
  )
}
