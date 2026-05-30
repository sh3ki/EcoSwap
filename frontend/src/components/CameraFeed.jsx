import { VIDEO_FEED_URL } from '../config'
import { useApp } from '../contexts/AppContext'

export default function CameraFeed() {
  const { app } = useApp()
  const isDetecting = app.state === 'DETECTING'

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl eco-card eco-card-glow">
      {/* MJPEG stream */}
      <img
        src={VIDEO_FEED_URL}
        alt="Live camera feed"
        className="w-full h-full object-cover"
        style={{ display: 'block' }}
        onError={(e) => { e.target.style.opacity = 0.3 }}
      />

      {/* Scan line overlay when detecting */}
      {isDetecting && <div className="scan-line pointer-events-none" />}

      {/* Corner decorations */}
      <span className="absolute top-2 left-2  w-5 h-5 border-t-2 border-l-2 border-eco-500 opacity-70 rounded-tl" />
      <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-eco-500 opacity-70 rounded-tr" />
      <span className="absolute bottom-2 left-2  w-5 h-5 border-b-2 border-l-2 border-eco-500 opacity-70 rounded-bl" />
      <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-eco-500 opacity-70 rounded-br" />

      {/* Detection result flash */}
      {app.showResultFlash && app.lastResult && (
        <ResultFlash result={app.lastResult} confidence={app.lastConfidence} />
      )}

      {/* Detecting label */}
      {isDetecting && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                        px-4 py-1.5 rounded-full bg-eco-900/80 border border-eco-600
                        text-eco-400 text-xs font-medium tracking-widest uppercase
                        animate-pulse-slow">
          Analyzing item…
        </div>
      )}
    </div>
  )
}

function ResultFlash({ result, confidence }) {
  const isBottle  = result === 'BOTTLE'
  const isCan     = result === 'CAN'
  const isUnknown = result === 'UNKNOWN'

  const label = isBottle ? 'Water Bottle' : isCan ? 'Aluminum Can' : 'Rejected'
  const icon  = isBottle ? '♻' : isCan ? '🥫' : '✕'
  const bg    = isUnknown
    ? 'bg-red-900/90 border-red-500 text-red-300'
    : 'bg-eco-800/90 border-eco-500 text-eco-300'
  const badge = isUnknown ? 'bg-red-500 text-white' : 'bg-eco-500 text-eco-950'

  return (
    <div className={`result-badge absolute inset-4 flex flex-col items-center justify-center
                     rounded-xl border-2 ${bg} backdrop-blur-sm`}>
      <span className={`text-sm font-bold px-3 py-1 rounded-full mb-3 ${badge} tracking-widest uppercase`}>
        {isUnknown ? 'NOT ACCEPTED' : 'ACCEPTED'}
      </span>
      <span className="text-5xl mb-2">{icon}</span>
      <span className="text-2xl font-brand font-semibold">{label}</span>
      <span className="text-xs mt-2 opacity-60">
        Confidence: {Math.round(confidence * 100)}%
      </span>
    </div>
  )
}
