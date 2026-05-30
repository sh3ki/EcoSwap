import { useApp } from '../contexts/AppContext'

const STATE_LABELS = {
  IDLE:           { text: 'Ready',            dot: 'online' },
  INLET_OPEN:     { text: 'Insert Item',       dot: 'pulse'  },
  INLET_CLOSE:    { text: 'Closing Inlet',     dot: 'pulse'  },
  DETECTING:      { text: 'Analyzing…',        dot: 'pulse'  },
  DISPENSING_BIN: { text: 'Sorting',           dot: 'pulse'  },
  RESETTING:      { text: 'Resetting',         dot: 'pulse'  },
  FINISHING:      { text: 'Dispensing Coins',  dot: 'pulse'  },
  SUMMARY:        { text: 'Session Complete',  dot: 'online' },
}

export default function StatusBanner() {
  const { app } = useApp()
  const info = STATE_LABELS[app.state] ?? { text: app.state, dot: 'online' }

  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{
        background: 'linear-gradient(90deg, #030d1f 0%, #040f24 50%, #030d1f 100%)',
        borderBottom: '1px solid rgba(59,130,246,0.12)',
        boxShadow: '0 1px 0 rgba(59,130,246,0.06)',
      }}
    >
      {/* Left: brand + state */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Mini logo */}
          <svg viewBox="0 0 48 48" fill="none" className="w-5 h-5">
            <defs>
              <linearGradient id="bannerG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <path d="M 9 24 A 15 15 0 0 1 39 24" stroke="url(#bannerG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 36 19 L 39 24 L 42 19"    stroke="url(#bannerG)" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 39 24 A 15 15 0 0 1 9 24"  stroke="url(#bannerG)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 12 29 L 9 24 L 6 29"       stroke="url(#bannerG)" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 21.5 8 Q 24 4 26.5 8 Q 24 11 21.5 8 Z" fill="#93c5fd" />
          </svg>
          <span
            className="font-brand font-bold text-sm tracking-widest uppercase"
            style={{ color: '#60a5fa' }}
          >
            eco-swap
          </span>
        </div>

        <div
          className="w-px h-4"
          style={{ background: 'rgba(59,130,246,0.20)' }}
        />

        <div className="flex items-center gap-2">
          <span className={`status-dot ${info.dot}`} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(96,165,250,0.70)' }}
          >
            {info.text}
          </span>
        </div>
      </div>

      {/* Right: hardware indicators */}
      <div className="flex items-center gap-5">
        <HardwareChip
          label="ESP32"
          connected={app.esp32Connected}
        />
        <HardwareChip
          label="Backend"
          connected={app.wsConnected}
        />
      </div>
    </div>
  )
}

function HardwareChip({ label, connected }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
      style={{
        background: connected
          ? 'rgba(59,130,246,0.08)'
          : 'rgba(239,68,68,0.06)',
        border: connected
          ? '1px solid rgba(59,130,246,0.15)'
          : '1px solid rgba(239,68,68,0.15)',
      }}
    >
      <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
      <span
        className="text-xs font-medium"
        style={{ color: connected ? 'rgba(96,165,250,0.65)' : 'rgba(239,68,68,0.65)' }}
      >
        {label}
      </span>
    </div>
  )
}

