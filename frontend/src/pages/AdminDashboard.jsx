import { useState, useEffect, useCallback } from 'react'
import { useNavigate }  from 'react-router-dom'
import { API_URL }      from '../config'

function authHeaders() {
  const token = localStorage.getItem('eco_admin_token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [sessions, setSessions] = useState([])
  const [status,   setStatus]   = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [sRes, seRes, stRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`,    { headers: authHeaders() }),
        fetch(`${API_URL}/admin/sessions`, { headers: authHeaders() }),
        fetch(`${API_URL}/status`),
      ])

      if (sRes.status === 401) {
        localStorage.removeItem('eco_admin_token')
        navigate('/admin')
        return
      }

      setStats(await sRes.json())
      setSessions(await seRes.json())
      setStatus(await stRes.json())
    } catch {
      setError('Failed to load data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('eco_admin_token')
    if (!token) { navigate('/admin'); return }
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => clearInterval(t)
  }, [fetchData, navigate])

  function handleLogout() {
    localStorage.removeItem('eco_admin_token')
    navigate('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-eco-950">
        <span className="text-eco-600 text-sm animate-pulse-slow">Loading…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-eco-950 eco-grid-bg flex flex-col">

      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4
                         bg-eco-900 border-b border-eco-800">
        <div className="flex items-center gap-3">
          <span className="font-brand font-semibold text-eco-400 text-lg">eco-swap</span>
          <span className="text-eco-700 text-xs">|</span>
          <span className="text-eco-600 text-xs uppercase tracking-widest">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="text-eco-600 hover:text-eco-400 text-xs uppercase tracking-widest transition"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 text-xs uppercase tracking-widest transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">

        {error && (
          <div className="bg-red-900/30 border border-red-700/40 rounded-xl px-5 py-3
                          text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
            <StatCard label="Total Sessions"  value={stats.total_sessions} accent="text-eco-400" />
            <StatCard label="Bottles Collected" value={stats.total_bottles}  accent="text-eco-400" />
            <StatCard label="Cans Collected"  value={stats.total_cans}     accent="text-eco-300" />
            <StatCard label="Rejected Items"  value={stats.total_rejected} accent="text-red-400" />
            <StatCard label="Coins Dispensed" value={`₱${stats.total_coins}`} accent="text-eco-400" span2 />
            <StatCard label="Bottles Saved"
                      value={`${((stats.total_bottles + stats.total_cans) * 0.02).toFixed(2)} kg CO₂`}
                      accent="text-eco-600" span2 sub="estimated offset" />
          </div>
        )}

        {/* ── Live system status ──────────────────────────────────────────── */}
        {status && (
          <div className="eco-card rounded-2xl p-5 border border-eco-800 fade-in">
            <h2 className="text-eco-700 text-xs uppercase tracking-widest mb-4">
              Live System Status
            </h2>
            <div className="flex flex-wrap gap-4">
              <StatusPill label="State"   value={status.state} />
              <StatusPill label="ESP32"   value={status.esp32_connected ? 'Connected' : 'Offline'}
                          ok={status.esp32_connected} />
              <StatusPill label="Camera"  value={status.camera_online   ? 'Online'    : 'Offline'}
                          ok={status.camera_online} />
              <StatusPill label="Bottles" value={status.bottles} />
              <StatusPill label="Cans"    value={status.cans} />
              <StatusPill label="Coins"   value={`₱${status.coins}`} />
            </div>
          </div>
        )}

        {/* ── Session history ─────────────────────────────────────────────── */}
        <div className="eco-card rounded-2xl p-5 border border-eco-800 fade-in">
          <h2 className="text-eco-700 text-xs uppercase tracking-widest mb-4">
            Session History ({sessions.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-eco-700 text-xs uppercase tracking-widest border-b border-eco-800">
                  <Th>ID</Th>
                  <Th>Started</Th>
                  <Th>Ended</Th>
                  <Th>Bottles</Th>
                  <Th>Cans</Th>
                  <Th>Rejected</Th>
                  <Th>Coins</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-eco-800 py-8 text-xs">
                      No sessions recorded yet
                    </td>
                  </tr>
                )}
                {sessions.map((s) => (
                  <tr key={s.id}
                      className="border-b border-eco-800/50 hover:bg-eco-800/20 transition">
                    <Td>{s.id}</Td>
                    <Td>{fmtDate(s.started_at)}</Td>
                    <Td>{s.ended_at ? fmtDate(s.ended_at) : '—'}</Td>
                    <Td accent="text-eco-400">{s.bottles}</Td>
                    <Td accent="text-eco-300">{s.cans}</Td>
                    <Td accent="text-red-400">{s.rejected}</Td>
                    <Td accent="text-eco-400">₱{s.coins_dispensed}</Td>
                    <Td>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                                        ${s.ended_at
                                          ? 'bg-eco-900 text-eco-500 border border-eco-700'
                                          : 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/40'}`}>
                        {s.ended_at ? 'Complete' : 'Active'}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, span2, sub }) {
  return (
    <div className={`eco-card eco-card-glow rounded-2xl p-5 border border-eco-800
                     ${span2 ? 'col-span-2' : ''}`}>
      <p className="text-eco-700 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-brand font-bold text-4xl counter-num ${accent}`}>{value}</p>
      {sub && <p className="text-eco-800 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusPill({ label, value, ok }) {
  const color = ok === undefined ? 'text-eco-400'
              : ok               ? 'text-eco-400'
                                 : 'text-red-400'
  return (
    <div className="flex items-center gap-2 eco-card rounded-lg px-3 py-2 border border-eco-800">
      <span className="text-eco-700 text-xs">{label}:</span>
      <span className={`text-xs font-medium ${color}`}>{String(value)}</span>
    </div>
  )
}

function Th({ children }) {
  return <th className="text-left py-2 px-3 font-normal">{children}</th>
}

function Td({ children, accent }) {
  return (
    <td className={`py-2.5 px-3 font-mono ${accent ?? 'text-eco-600'}`}>
      {children}
    </td>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}
