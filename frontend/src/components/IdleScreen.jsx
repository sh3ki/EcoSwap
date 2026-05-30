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
             background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)'
           }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-8 fade-in">

        {/* Logo mark */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl
                        bg-eco-800 border border-eco-600 shadow-eco-md">
          <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
            <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"
                  stroke="#22c55e" strokeWidth="1.5" fill="none"/>
            <path d="M15 20 Q15 14 20 14 Q25 14 25 20 Q25 26 20 26 Q15 26 15 20"
                  stroke="#4ade80" strokeWidth="1.5" fill="none"/>
            <circle cx="20" cy="20" r="2" fill="#22c55e"/>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-brand font-bold text-7xl tracking-tight eco-glow-text
                         text-eco-400 leading-none mb-3">
            eco-swap
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
