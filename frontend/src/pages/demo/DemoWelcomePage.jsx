export default function DemoWelcomePage({ onNext }) {
  const handleMouseDown = (event) => {
    if (event.button !== 0) return
    onNext()
  }

  return (
    <div
      className="min-h-screen eco-grid-bg flex items-center justify-center px-6"
      onMouseDown={handleMouseDown}
      style={{
        background: `
          radial-gradient(ellipse 130% 55% at 50% -8%, rgba(59,130,246,0.28) 0%, transparent 52%),
          radial-gradient(ellipse 60% 70% at 5%  90%, rgba(29,78,216,0.14)  0%, transparent 55%),
          radial-gradient(ellipse 60% 70% at 95% 90%, rgba(37,99,235,0.12)  0%, transparent 55%),
          linear-gradient(180deg, #020b18 0%, #030d1f 40%, #040e22 80%, #030c1a 100%)
        `,
      }}
    >
      <div className="eco-card eco-card-glow border border-eco-700 rounded-3xl p-8 md:p-12 max-w-3xl w-full text-center slide-up">
        <span className="inline-block px-4 py-1.5 rounded-full bg-eco-800 border border-eco-600 text-eco-400 text-xs font-medium tracking-widest uppercase mb-4">
           EcoSwap
        </span>

        <h1 className="font-brand font-bold text-4xl md:text-6xl text-eco-100 leading-tight eco-glow-text">
          Ecoswap <br/>
          <p className="text-eco-300 md:text-4xl mt-2"> Turning your trash into cash </p>
        </h1>

        <p className="text-eco-300 text-base md:text-xl mt-10">
          Press the blue button to start.
          <br />
          Insert 5 bottles or 2 cans in exchange for 1 peso.
        </p>

        <div className="mt-7 eco-card rounded-2xl px-5 py-4 border border-eco-800">
          <p className="text-eco-200 text-xs uppercase tracking-widest mb-2">Exchange Rate</p>
          <div className="flex items-center justify-center gap-6 text-eco-400 font-mono text-sm md:text-base">
            <span>5 Bottles = 1 Peso</span>
            <span>2 Cans = 1 Peso</span>
          </div>
        </div>

        <button
          type="button"
          className="eco-btn-primary mt-8 px-8 py-4 rounded-xl text-sm md:text-base tracking-widest"
          onMouseDown={handleMouseDown}
        >
          Press the blue button below
        </button>

      </div>
    </div>
  )
}
