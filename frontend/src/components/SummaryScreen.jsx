import { API_URL } from '../config'
import { useApp } from '../contexts/AppContext'

/**
 * SummaryScreen — shown when state === "SUMMARY"
 * Displays full session breakdown and coin payout.
 */
export default function SummaryScreen() {
  const { app } = useApp()
  const d        = app.summaryData ?? {}

  const bottles  = d.bottles  ?? app.bottles
  const cans     = d.cans     ?? app.cans
  const rejected = d.rejected ?? app.rejected
  const coins    = d.coins    ?? app.coins
  const leftoverB= d.leftover_bottles ?? 0
  const leftoverC= d.leftover_cans    ?? 0

  async function handleDismiss() {
    await fetch(`${API_URL}/simulate/reset`, { method: 'POST' })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center
                    eco-grid-bg eco-radial-glow p-8 overflow-auto">

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6 fade-in">

        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-eco-800 border border-eco-600
                           text-eco-400 text-xs font-medium tracking-widest uppercase mb-4">
            Session Complete
          </span>
          <h2 className="font-brand font-bold text-5xl text-eco-400 eco-glow-text">
            Thank you!
          </h2>
          <p className="ttext-eco-200 mt-2 text-sm">
            You've helped make the planet a little greener today.
          </p>
        </div>

        {/* Coin payout — hero */}
        <div className="eco-card eco-card-glow rounded-2xl px-8 py-8 flex flex-col items-center
                        border border-eco-500 shadow-eco-lg slide-up">
          <p className="ttext-eco-200 text-xs uppercase tracking-widest mb-1">Total Earned</p>
          <div className="font-brand font-bold text-8xl text-eco-400 eco-glow-text counter-num">
            ₱{coins}
          </div>
          <p className="ttext-eco-200 text-sm mt-2">{coins} Philippine peso coin{coins !== 1 ? 's' : ''}</p>
        </div>

        {/* Breakdown */}
        <div className="eco-card rounded-2xl p-5 border border-eco-800 slide-up"
             style={{ animationDelay: '0.1s' }}>
          <p className="text-eco-700 text-xs uppercase tracking-widest mb-4">Breakdown</p>
          <div className="space-y-3">
            <BreakdownRow label="Water Bottles" value={bottles} unit="items" color="text-eco-400" />
            <BreakdownRow label="Aluminum Cans"  value={cans}    unit="items" color="text-eco-300" />
            <BreakdownRow label="Rejected Items" value={rejected} unit="items" color="text-red-400" />
            <div className="h-px bg-eco-800 my-1" />
            <BreakdownRow label="Coins Dispensed" value={`₱${coins}`} unit="" color="text-eco-400" bold />
          </div>
        </div>

        {/* Leftover notice */}
        {(leftoverB > 0 || leftoverC > 0) && (
          <div className="eco-card rounded-xl px-5 py-3 border border-eco-800 slide-up"
               style={{ animationDelay: '0.2s' }}>
            <p className="text-eco-700 text-xs uppercase tracking-widest mb-1">
              Leftover (not rewarded this session)
            </p>
            <p className="ttext-eco-200 text-sm">
              {leftoverB > 0 && `${leftoverB} bottle${leftoverB !== 1 ? 's' : ''}`}
              {leftoverB > 0 && leftoverC > 0 && ', '}
              {leftoverC > 0 && `${leftoverC} can${leftoverC !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="eco-btn-primary rounded-xl py-4 text-sm tracking-widest w-full
                     slide-up"
          style={{ animationDelay: '0.25s' }}
        >
          Back to Home
        </button>

        <p className="text-center text-eco-800 text-xs">
          Screen resets automatically in a few seconds
        </p>

      </div>
    </div>
  )
}

function BreakdownRow({ label, value, unit, color, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-eco-300' : 'ttext-eco-200'}`}>
        {label}
      </span>
      <span className={`font-mono text-sm counter-num ${color} ${bold ? 'font-bold' : ''}`}>
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  )
}
