export default function DemoThankYouPage({ peso, onNext }) {
  const handleMouseDown = (event) => {
    if (event.button !== 0) return
    onNext()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center eco-grid-bg eco-radial-glow p-8"
      onMouseDown={handleMouseDown}
    >
      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6 fade-in">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-eco-800 border border-eco-600 text-eco-400 text-xs font-medium tracking-widest uppercase mb-4">
            Session Complete
          </span>
          <h2 className="font-brand font-bold text-5xl text-eco-400 eco-glow-text">Thank you!</h2>
        </div>

        <div className="eco-card eco-card-glow rounded-2xl px-8 py-8 flex flex-col items-center border border-eco-500 shadow-eco-lg slide-up">
          <p className="ttext-eco-200 text-xs uppercase tracking-widest mb-1">Total Earned</p>
          <div className="font-brand font-bold text-7xl text-eco-400 eco-glow-text counter-num">{peso}</div>
          <p className="ttext-eco-200 text-sm mt-1">Peso Exchanged</p>
        </div>

        <div className="eco-card rounded-2xl p-6 border border-eco-800 text-center slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-3xl md:text-4xl font-black text-eco-100 leading-tight eco-glow-text">
          {peso} peso exchanged. <br/>Thank you.
          </h3>
          
        </div>
      </div>
    </div>
  )
}
