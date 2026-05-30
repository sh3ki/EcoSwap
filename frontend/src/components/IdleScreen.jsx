/**
 * IdleScreen — shown when state === "IDLE"
 * Full-screen landing with logo, tagline, exchange rates.
 */
import { API_URL } from '../config'

async function startSimulation() {
  await fetch(`${API_URL}/simulate/start`, { method: 'POST' })
}
export default function IdleScreen() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center
                    eco-grid-bg eco-radial-glow overflow-hidden select-none">

      {/* Ambient glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full pointer-events-none"
           style={{
             background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)'
           }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-8 fade-in">

        {/* Logo mark — ecoswap circular-arrow icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-2xl
                        bg-eco-800 border border-eco-600 shadow-eco-md">
          <EcoSwapIcon className="w-14 h-14" />
        </div>

        {/* Title — two-tone brand like the logo image */}
        <div className="text-center">
          <h1 className="font-brand font-bold text-7xl tracking-tight leading-none mb-3">
            <span className="text-eco-300">eco</span>
            <span className="text-eco-400 eco-glow-text">swap</span>
          </h1>
          <p className="text-eco-600 text-lg font-light tracking-[0.25em] uppercase">
            turning your trash into cash
          </p>
        </div>

        {/* Exchange rate cards */}
        <div className="flex gap-5">
          <ExchangeCard
            count="5"
            label="Water Bottles"
            reward="₱1"
            hint="plastic PET"
          />
          <ExchangeCard
            count="2"
            label="Aluminum Cans"
            reward="₱1"
            hint="beverage cans"
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex items-center gap-3">
            <span className="status-dot online pulse" />
            <span className="text-eco-500 text-sm font-medium tracking-wide uppercase">
              Ready — Press START on the device
            </span>
          </div>

          {/* Simulation shortcut */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <button
              onClick={startSimulation}
              className="eco-btn-primary rounded-xl px-8 py-3 text-sm"
            >
              Start Demo (No Hardware)
            </button>
            <p className="text-eco-800 text-xs">
              Use your laptop webcam to simulate item detection
            </p>
          </div>
        </div>

      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px
                      bg-gradient-to-r from-transparent via-eco-600 to-transparent opacity-40" />
    </div>
  )
}

// ── EcoSwap Icon SVG ─────────────────────────────────────────────────────────
function EcoSwapIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="iconG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Top semicircle: left (9,24) clockwise over top to right (39,24) */}
      <path d="M 9 24 A 15 15 0 0 1 39 24"
            stroke="url(#iconG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Arrowhead at right end — V tip at (39,24) opening upward, shows downward (CW) flow */}
      <path d="M 36 19 L 39 24 L 42 19"
            stroke="url(#iconG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Bottom semicircle: right (39,24) clockwise under bottom to left (9,24) */}
      <path d="M 39 24 A 15 15 0 0 1 9 24"
            stroke="url(#iconG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Arrowhead at left end — V tip at (9,24) opening downward, shows upward (CW) flow */}
      <path d="M 12 29 L 9 24 L 6 29"
            stroke="url(#iconG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Leaf accent at top peak of arc */}
      <path d="M 21.5 8 Q 24 4 26.5 8 Q 24 11 21.5 8 Z" fill="#93c5fd" />
    </svg>
  )
}

function ExchangeCard({ count, label, reward, hint }) {
  return (
    <div className="eco-card eco-card-glow rounded-xl px-7 py-5 flex flex-col items-center
                    gap-1 min-w-[150px] slide-up">
      <span className="text-4xl font-brand font-bold text-eco-400">{count}×</span>
      <span className="text-eco-300 text-sm font-medium text-center">{label}</span>
      <span className="text-eco-700 text-xs">{hint}</span>
      <div className="mt-2 h-px w-full bg-eco-700 opacity-40" />
      <span className="text-eco-500 text-xs uppercase tracking-widest mt-1">equals</span>
      <span className="text-3xl font-brand font-bold text-eco-400">{reward}</span>
    </div>
  )
}
