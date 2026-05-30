import { createContext, useContext, useReducer, useCallback } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL = {
  state:           'IDLE',   // matches backend State enum
  bottles:         0,
  cans:            0,
  rejected:        0,
  coins:           0,
  lastResult:      null,     // "BOTTLE" | "CAN" | "UNKNOWN" | null
  lastConfidence:  0,
  summaryData:     null,     // SESSION_SUMMARY payload
  esp32Connected:  false,
  wsConnected:     false,
  showResultFlash: false,
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(s, action) {
  switch (action.type) {
    case 'WS_OPEN':
      return { ...s, wsConnected: true }

    case 'WS_CLOSE':
      return { ...s, wsConnected: false }

    case 'STATE_CHANGE':
      return {
        ...s,
        state:       action.state,
        bottles:     action.bottles  ?? s.bottles,
        cans:        action.cans     ?? s.cans,
        rejected:    action.rejected ?? s.rejected,
        coins:       action.coins    ?? s.coins,
        summaryData: action.state === 'IDLE' ? null : s.summaryData,
      }

    case 'COUNTER_UPDATE':
      return {
        ...s,
        bottles:  action.bottles,
        cans:     action.cans,
        rejected: action.rejected,
        coins:    action.coins,
      }

    case 'DETECTION_RESULT':
      return {
        ...s,
        bottles:         action.bottle_count,
        cans:            action.can_count,
        rejected:        action.rejected_count,
        coins:           action.coins,
        lastResult:      action.result,
        lastConfidence:  action.confidence,
        showResultFlash: true,
      }

    case 'CLEAR_RESULT_FLASH':
      return { ...s, showResultFlash: false }

    case 'SESSION_SUMMARY':
      return { ...s, summaryData: action }

    case 'ESP32_STATUS':
      return { ...s, esp32Connected: action.connected }

    default:
      return s
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [app, dispatch] = useReducer(reducer, INITIAL)

  const handleMessage = useCallback((msg) => {
    dispatch(msg)

    // Auto-clear the result flash after 2.8 s
    if (msg.type === 'DETECTION_RESULT') {
      setTimeout(() => dispatch({ type: 'CLEAR_RESULT_FLASH' }), 2800)
    }
  }, [])

  useWebSocket(handleMessage)

  return (
    <AppContext.Provider value={{ app, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
