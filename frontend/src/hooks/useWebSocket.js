import { useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '../config'

/**
 * Connects to the backend WebSocket with automatic reconnection.
 * Calls onMessage(parsedObject) for every server message.
 */
export function useWebSocket(onMessage) {
  const ws         = useRef(null)
  const retryTimer = useRef(null)
  const onMsgRef   = useRef(onMessage)
  onMsgRef.current = onMessage

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(WS_URL)
      ws.current = socket

      socket.onopen = () => {
        console.log('[WS] Connected')
        if (retryTimer.current) {
          clearTimeout(retryTimer.current)
          retryTimer.current = null
        }
      }

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          onMsgRef.current(msg)
        } catch {
          // non-JSON frame — ignore
        }
      }

      socket.onclose = () => {
        console.log('[WS] Disconnected — retrying in 2 s…')
        retryTimer.current = setTimeout(connect, 2000)
      }

      socket.onerror = (err) => {
        console.error('[WS] Error', err)
        socket.close()
      }
    } catch (err) {
      console.error('[WS] Could not create WebSocket', err)
      retryTimer.current = setTimeout(connect, 2000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
      ws.current?.close()
    }
  }, [connect])
}
