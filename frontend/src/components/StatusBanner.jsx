import { useApp } from '../contexts/AppContext'

const STATE_LABELS = {
  IDLE:          { text: 'Ready',        color: 'text-eco-400',  dot: 'online' },
  INLET_OPEN:    { text: 'Insert Item',  color: 'text-eco-300',  dot: 'pulse'  },
  INLET_CLOSE:   { text: 'Closing Inlet',color: 'text-eco-300',  dot: 'pulse'  },
  DETECTING:     { text: 'Analyzing…',   color: 'text-eco-400',  dot: 'pulse'  },
  DISPENSING_BIN:{ text: 'Sorting',      color: 'text-eco-300',  dot: 'pulse'  },
  RESETTING:     { text: 'Resetting',    color: 'text-eco-300',  dot: 'pulse'  },
  FINISHING:     { text: 'Dispensing Coins', color: 'text-eco-400', dot: 'pulse' },
  SUMMARY:       { text: 'Session Complete', color: 'text-eco-400', dot: 'online' },
}

export default function StatusBanner() {
  const { app } = useApp()
  const info     = STATE_LABELS[app.state] ?? { text: app.state, color: 'text-eco-300', dot: 'online' }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-eco-900 border-b border-eco-700">
      {/* Left: brand */}
      <div className="flex items-center gap-3">
        <span className="font-brand font-semibold text-eco-400 text-sm tracking-widest uppercase">
          eco-swap
        </span>
        <span className="text-eco-700 text-xs">|</span>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${info.dot}`} />
          <span className={`text-xs font-medium tracking-wide uppercase ${info.color}`}>
            {info.text}
          </span>
        </div>
      </div>

      {/* Right: hardware status */}
      <div className="flex items-center gap-4 text-xs text-eco-700">
        <span className="flex items-center gap-1.5">
          <span className={`status-dot ${app.esp32Connected ? 'online' : 'offline'}`} />
          ESP32
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`status-dot ${app.wsConnected ? 'online' : 'offline'}`} />
          Backend
        </span>
      </div>
    </div>
  )
}
