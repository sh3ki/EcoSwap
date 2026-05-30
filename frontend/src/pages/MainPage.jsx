import { useApp } from '../contexts/AppContext'
import StatusBanner from '../components/StatusBanner'
import IdleScreen   from '../components/IdleScreen'
import ActiveScreen from '../components/ActiveScreen'
import SummaryScreen from '../components/SummaryScreen'

const ACTIVE_STATES = new Set([
  'INLET_OPEN', 'INLET_CLOSE', 'DETECTING',
  'DISPENSING_BIN', 'RESETTING', 'FINISHING',
])

export default function MainPage() {
  const { app } = useApp()

  let Screen
  if (app.state === 'IDLE')                    Screen = IdleScreen
  else if (ACTIVE_STATES.has(app.state))       Screen = ActiveScreen
  else if (app.state === 'SUMMARY')            Screen = SummaryScreen
  else                                         Screen = IdleScreen

  return (
    <div className="h-screen flex flex-col bg-eco-950 overflow-hidden">
      <StatusBanner />
      <Screen />
    </div>
  )
}
