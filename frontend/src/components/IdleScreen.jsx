/**
 * IdleScreen — shown when state === "IDLE"
 * Full-screen landing with atmospheric sky-blue hero design.
 */
import { API_URL } from '../config'

async function startSimulation() {
  await fetch(`${API_URL}/simulate/start`, { method: 'POST' })
}

// ── Palette constants (used inline to bypass stale Tailwind cache) ─────────
const B = {
  sky:    '#93c5fd',
  bright: '#60a5fa',
  mid:    '#3b82f6',
  deep:   '#1d4ed8',
  dark:   '#071525',
  darker: '#040c18',
  border: 'rgba(59,130,246,0.18)',
  borderBright: 'rgba(59,130,246,0.35)',
  dimText: 'rgba(147,197,253,0.45)',
  midText: 'rgba(96,165,250,0.65)',
}

export default function IdleScreen() {
  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(ellipse 130% 55% at 50% -8%, rgba(59,130,246,0.28) 0%, transparent 52%),
          radial-gradient(ellipse 60% 70% at 5%  90%, rgba(29,78,216,0.14)  0%, transparent 55%),
          radial-gradient(ellipse 60% 70% at 95% 90%, rgba(37,99,235,0.12)  0%, transparent 55%),
          linear-gradient(180deg, #020b18 0%, #030d1f 40%, #040e22 80%, #030c1a 100%)
        `,
      }}
    >
      {/* ── Decorative grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Top aurora beam ── */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 30%, rgba(96,165,250,0.8) 50%, rgba(59,130,246,0.6) 70%, transparent 100%)' }}
      />

      {/* ── Decorative orb corners ── */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.10) 0%, transparent 70%)' }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 fade-in">

        {/* Logo mark */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-3xl pointer-events-none"
              style={{ boxShadow: '0 0 50px rgba(59,130,246,0.30), 0 0 100px rgba(59,130,246,0.10)' }}
            />
            <div
              className="relative flex items-center justify-center w-28 h-28 rounded-3xl"
              style={{
                background: `linear-gradient(145deg, rgba(15,39,77,0.85) 0%, rgba(7,21,37,0.95) 100%)`,
                border: `1px solid ${B.borderBright}`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)`,
              }}
            >
              <EcoSwapIcon className="w-16 h-16" />
            </div>
          </div>

          {/* Brand wordmark */}
          <div className="text-center">
            <h1
              className="font-brand font-black leading-none mb-3"
              style={{ fontSize: '5rem', letterSpacing: '-0.02em' }}
            >
              <span style={{ color: B.sky }}>eco</span>
              <span
                style={{
                  color: B.bright,
                  textShadow: `0 0 28px rgba(96,165,250,0.55), 0 0 56px rgba(59,130,246,0.25)`,
                }}
              >swap</span>
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: B.dimText, letterSpacing: '0.30em', textTransform: 'uppercase' }}
            >
              Turning Your Trash Into Cash
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-40 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${B.borderBright}, transparent)` }}
        />

        {/* Exchange rate cards */}
        <div className="flex gap-5">
          <ExchangeCard
            count="5"
            label="Water Bottles"
            reward="₱1"
            hint="Plastic PET"
            icon={<BottleIcon />}
          />
          <ExchangeCard
            count="2"
            label="Aluminum Cans"
            reward="₱1"
            hint="Beverage Cans"
            icon={<CanIcon />}
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="flex items-center gap-2.5">
            <span className="status-dot online pulse" />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: B.midText }}
            >
              Ready — Press START on the Device
            </span>
          </div>
          <button
            onClick={startSimulation}
            className="eco-btn-primary rounded-2xl text-sm font-bold"
            style={{ padding: '14px 40px', minWidth: 260, letterSpacing: '0.10em' }}
          >
            START DEMO (NO HARDWARE)
          </button>
          <p className="text-xs" style={{ color: 'rgba(59,130,246,0.30)' }}>
            Simulate using your laptop webcam
          </p>
        </div>
      </div>

      {/* ── Bottom horizon line ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent)' }}
      />
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
      <path d="M 9 24 A 15 15 0 0 1 39 24"
            stroke="url(#iconG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 36 19 L 39 24 L 42 19"
            stroke="url(#iconG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 39 24 A 15 15 0 0 1 9 24"
            stroke="url(#iconG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 12 29 L 9 24 L 6 29"
            stroke="url(#iconG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 21.5 8 Q 24 4 26.5 8 Q 24 11 21.5 8 Z" fill="#93c5fd" />
    </svg>
  )
}

// ── Item icons ────────────────────────────────────────────────────────────────
function BottleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"
         stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6" />
      <path d="M8.5 2v2.5a4 4 0 00-2 3.5V19a2 2 0 002 2h7a2 2 0 002-2V8a4 4 0 00-2-3.5V2" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" />
    </svg>
  )
}

function CanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"
         stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13a7 2.5 0 0014 0v-13" />
      <line x1="5" y1="10.5" x2="19" y2="10.5" />
    </svg>
  )
}

// ── Exchange card ─────────────────────────────────────────────────────────────
function ExchangeCard({ count, label, reward, hint, icon }) {
  return (
    <div
      className="relative flex flex-col items-center gap-2 rounded-2xl slide-up"
      style={{
        padding: '28px 32px',
        minWidth: 165,
        background: `linear-gradient(160deg, rgba(15,39,77,0.70) 0%, rgba(7,21,37,0.85) 100%)`,
        border: '1px solid rgba(59,130,246,0.14)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 0 1px rgba(59,130,246,0.06), 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }}
      />

      {/* Icon pill */}
      <div
        className="flex items-center justify-center w-11 h-11 rounded-xl mb-1"
        style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.18)' }}
      >
        {icon}
      </div>

      <span className="font-brand font-black text-4xl" style={{ color: '#60a5fa' }}>{count}×</span>
      <span className="text-sm font-semibold text-center" style={{ color: '#93c5fd' }}>{label}</span>
      <span className="text-xs" style={{ color: 'rgba(96,165,250,0.40)' }}>{hint}</span>

      <div className="w-full h-px my-1" style={{ background: 'rgba(59,130,246,0.10)' }} />

      <span
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: 'rgba(96,165,250,0.45)' }}
      >equals</span>
      <span className="font-brand font-black text-3xl" style={{ color: '#60a5fa' }}>{reward}</span>
    </div>
  )
}

