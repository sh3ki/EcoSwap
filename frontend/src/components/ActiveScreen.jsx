import { useRef, useEffect, useState } from 'react'
import { API_URL } from '../config'
import { useApp } from '../contexts/AppContext'
import CameraFeed from './CameraFeed'

/**
 * ActiveScreen — shown during an active recycling session.
 * Left panel: live camera feed + simulation controls.
 * Right panel: counters, exchange rate reminder, FINISH button.
 */
export default function ActiveScreen() {
  const { app }                     = useApp()
  const [countdown, setCountdown]   = useState(null)  // null | 3 | 2 | 1
  const coins                       = app.coins
  const canDetect                   = app.state === 'INLET_OPEN' && countdown === null

  // Countdown: 3 → 2 → 1 → fire request
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      fetch(`${API_URL}/simulate/item_detected`, { method: 'POST' })
        .catch(() => {})
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleDetectClick() {
    if (!canDetect) return
    setCountdown(3)
  }

  async function handleFinish() {
    await fetch(`${API_URL}/simulate/finish`, { method: 'POST' })
  }

  return (
    <div className="flex-1 flex overflow-hidden eco-grid-bg min-h-0">
      {/* ── Camera ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-3 gap-2 min-h-0 min-w-0">
        <div className="flex-1 relative min-h-0">
          <CameraFeed />

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center
                            bg-eco-950/80 rounded-xl backdrop-blur-sm z-20">
              <p className="text-eco-600 text-xs uppercase tracking-widest mb-3">
                Hold item in front of camera
              </p>
              <div className="font-brand font-bold text-eco-400 eco-glow-text"
                   style={{ fontSize: '7rem', lineHeight: 1 }}>
                {countdown}
              </div>
              <p className="text-eco-600 text-xs mt-3 uppercase tracking-widest">
                capturing in {countdown} second{countdown !== 1 ? 's' : ''}…
              </p>
            </div>
          )}
        </div>

        {/* Detect button */}
        <button
          onClick={handleDetectClick}
          disabled={!canDetect}
          className={`w-full rounded-xl py-2.5 text-xs font-bold tracking-widest uppercase
                      transition-all duration-200 shrink-0
                      ${canDetect
                        ? 'eco-btn-primary cursor-pointer'
                        : 'bg-eco-900 border border-eco-800 text-eco-700 cursor-not-allowed'
                      }`}
        >
          {countdown !== null
            ? `Capturing in ${countdown}…`
            : app.state === 'INLET_OPEN'
              ? 'Hold Item to Camera → Click to Detect'
              : `Waiting… (${app.state.replace(/_/g, ' ')})`
          }
        </button>
      </div>

      {/* ── Stats panel ──────────────────────────────────────────────────── */}
      <aside className="w-72 flex flex-col gap-2 p-3 border-l border-eco-800
                        bg-eco-900/40 overflow-y-auto min-h-0">

        {/* Session header */}
        <div className="eco-card eco-card-glow rounded-xl px-3 py-2 flex items-center
                        justify-between shrink-0">
          <p className="text-eco-700 text-xs uppercase tracking-widest">Session</p>
          <p className="text-eco-400 font-brand font-semibold text-xs">Active</p>
        </div>

        {/* Bottle counter */}
        <CounterCard
          key={`b-${app.bottles}`}
          label="Water Bottles"
          count={app.bottles}
          target={5}
          accentClass="text-eco-400"
          borderClass="border-eco-600"
        />

        {/* Can counter */}
        <CounterCard
          key={`c-${app.cans}`}
          label="Aluminum Cans"
          count={app.cans}
          target={2}
          accentClass="text-eco-300"
          borderClass="border-eco-700"
        />

        {/* Rejected + Coins row */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div className="eco-card rounded-xl px-3 py-2 border border-eco-800">
            <p className="text-eco-700 text-xs uppercase tracking-widest">Rejected</p>
            <p className="text-red-400 font-mono text-2xl font-semibold counter-num mt-0.5">
              {app.rejected}
            </p>
          </div>
          <div className="eco-card eco-card-glow rounded-xl px-3 py-2 border border-eco-600">
            <p className="text-eco-600 text-xs uppercase tracking-widest">Coins</p>
            <p className="font-brand font-bold text-2xl text-eco-400 eco-glow-text counter-num mt-0.5">
              ₱{coins}
            </p>
          </div>
        </div>

        {/* Exchange reminder */}
        <div className="eco-card rounded-xl px-3 py-2 border border-eco-800 shrink-0">
          <p className="text-eco-700 text-xs uppercase tracking-widest mb-1.5">Rate</p>
          <div className="flex justify-between text-xs font-mono text-eco-600">
            <span>5 Bottles = ₱1</span>
            <span>2 Cans = ₱1</span>
          </div>
        </div>

        {/* FINISH button — pinned to bottom */}
        <button
          onClick={handleFinish}
          className="mt-auto eco-btn-danger rounded-xl py-3 text-xs tracking-widest shrink-0"
        >
          Finish Session
        </button>

      </aside>
    </div>
  )
}

// ── Counter card component ────────────────────────────────────────────────────

function CounterCard({ label, count, target, accentClass, borderClass }) {
  const prevRef = useRef(count)
  const bumping  = count !== prevRef.current
  useEffect(() => { prevRef.current = count }, [count])

  const progress = target > 0 ? (count % target) / target : 0
  const full      = target > 0 ? Math.floor(count / target) : 0

  return (
    <div className={`eco-card rounded-xl px-3 py-2.5 border ${borderClass} shrink-0`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-eco-700 text-xs uppercase tracking-widest">{label}</p>
        <span className={`text-xs font-mono ${accentClass} opacity-60`}>×{target} = ₱1</span>
      </div>

      <div className={`font-brand font-bold text-3xl counter-num ${accentClass}
                       ${bumping ? 'animate-[countBump_0.45s_ease-out_both]' : ''}`}>
        {count}
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-xs text-eco-700 mb-1">
          <span>{count % target}/{target} to next coin</span>
          <span className={accentClass}>{full} coin{full !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-1 rounded-full bg-eco-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
          />
        </div>
      </div>
    </div>
  )
}


