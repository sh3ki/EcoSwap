// Backend connection config
// Set VITE_BACKEND_HOST in .env to override (e.g. "192.168.1.50:8000")
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost:8000'

export const API_URL       = `http://${BACKEND_HOST}`
export const WS_URL        = `ws://${BACKEND_HOST}/ws`
export const VIDEO_FEED_URL= `http://${BACKEND_HOST}/video_feed`
