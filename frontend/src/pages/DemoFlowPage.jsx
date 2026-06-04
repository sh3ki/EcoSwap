import { useMemo, useState } from 'react'
import DemoWelcomePage from './demo/DemoWelcomePage'
import DemoCountingPage from './demo/DemoCountingPage'
import DemoThankYouPage from './demo/DemoThankYouPage'

const STEPS = ['BOTTLE', 'BOTTLE', 'BOTTLE', 'REJECTED', 'CAN', 'CAN', 'BOTTLE', 'BOTTLE']

function computePeso(bottles, cans) {
  return Math.floor(bottles / 5) + Math.floor(cans / 2)
}

export default function DemoFlowPage() {
  const [screen, setScreen] = useState('WELCOME')
  const [counts, setCounts] = useState({ bottles: 0, cans: 0, rejected: 0, step: 0, done: false })

  const peso = useMemo(() => computePeso(counts.bottles, counts.cans), [counts.bottles, counts.cans])

  const resetFlow = () => {
    setCounts({ bottles: 0, cans: 0, rejected: 0, step: 0, done: false })
    setScreen('WELCOME')
  }

  const startCounting = () => {
    setCounts({ bottles: 0, cans: 0, rejected: 0, step: 0, done: false })
    setScreen('COUNTING')
  }

  const advanceCounting = () => {
    setCounts((prev) => {
      if (prev.step >= STEPS.length) {
        setScreen('THANK_YOU')
        return prev
      }

      const next = { ...prev, step: prev.step + 1 }
      const currentStep = STEPS[prev.step]

      if (currentStep === 'BOTTLE') next.bottles += 1
      if (currentStep === 'CAN') next.cans += 1
      if (currentStep === 'REJECTED') next.rejected += 1

      if (next.step >= STEPS.length) next.done = true

      return next
    })
  }

  if (screen === 'WELCOME') {
    return <DemoWelcomePage onNext={startCounting} />
  }

  if (screen === 'COUNTING') {
    return (
      <DemoCountingPage
        bottles={counts.bottles}
        cans={counts.cans}
        rejected={counts.rejected}
        peso={peso}
        isComplete={counts.done}
        onLeftClick={advanceCounting}
      />
    )
  }

  return <DemoThankYouPage peso={peso} onNext={resetFlow} />
}
