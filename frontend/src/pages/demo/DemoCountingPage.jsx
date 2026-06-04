function CounterCard({ label, value, valueClass = 'text-eco-400' }) {
  return (
    <div className="eco-card eco-card-glow rounded-2xl p-6 border border-eco-700 w-full max-w-xs text-center">
      <p className="text-eco-200 text-xs uppercase tracking-widest">{label}</p>
      <p className={`counter-num font-brand font-bold text-5xl md:text-6xl mt-2 ${valueClass}`}>{value}</p>
    </div>
  )
}

export default function DemoCountingPage({ bottles, cans, rejected, peso, isComplete, onLeftClick }) {
  const handleMouseDown = (event) => {
    if (event.button !== 0) return
    onLeftClick()
  }

  return (
    <div
      className="min-h-screen flex eco-grid-bg"
      onMouseDown={handleMouseDown}
      style={{
        background: `
          radial-gradient(ellipse 120% 60% at 50% -10%, rgba(59,130,246,0.20) 0%, transparent 56%),
          linear-gradient(180deg, #020b18 0%, #030d1f 45%, #040e22 100%)
        `,
      }}
    >
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center text-center min-h-0">
          <div className="max-w-6xl w-full fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-eco-800 border border-eco-600 text-eco-400 text-xs font-medium tracking-widest uppercase mb-5">
              Bottle and Can Identification
            </span>
            <h2 className="font-brand font-bold text-4xl md:text-6xl text-eco-100 eco-glow-text">
              EcoSwap - Active Session
            </h2>
            <p className="text-eco-300 mt-4 text-sm md:text-lg">
              Insert bottles or cans below in exchange for coins
            </p>

            <div className="mt-10 flex flex-col md:flex-row gap-6 justify-center items-center">
              <CounterCard label="Water Bottles" value={bottles} valueClass="text-eco-400" />
              <CounterCard label="Aluminum Cans" value={cans} valueClass="text-eco-300" />
              <CounterCard label="Rejected" value={rejected} valueClass="text-red-400" />
            </div>

            <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="eco-card eco-card-glow rounded-xl px-3 py-2 border border-eco-600 md:col-span-1">
                <p className="text-eco-600 text-xs uppercase tracking-widest">Coins</p>
                <p className="font-brand font-bold text-3xl text-eco-400 eco-glow-text counter-num mt-1">{peso} Peso</p>
              </div>

              <div className="eco-card rounded-xl px-3 py-2 border border-eco-800 md:col-span-1">
                <p className="text-eco-200 text-xs uppercase tracking-widest mb-1.5">Rate</p>
                <div className="text-xs font-mono text-eco-200">
                  <div>5 Bottles = 1 Peso</div>
                  <div>2 Cans = 1 Peso</div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
