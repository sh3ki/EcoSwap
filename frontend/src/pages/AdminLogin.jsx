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
              <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                <defs>
                  <linearGradient id="adminG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"  stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                {/* Top semicircle */}
                <path d="M 9 24 A 15 15 0 0 1 39 24"
                      stroke="url(#adminG)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <path d="M 36 19 L 39 24 L 42 19"
                      stroke="url(#adminG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Bottom semicircle */}
                <path d="M 39 24 A 15 15 0 0 1 9 24"
                      stroke="url(#adminG)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <path d="M 12 29 L 9 24 L 6 29"
                      stroke="url(#adminG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Leaf */}
                <path d="M 21.5 8 Q 24 4 26.5 8 Q 24 11 21.5 8 Z" fill="#93c5fd"/>
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
