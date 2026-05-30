"""
EcoSwap — FastAPI Backend
=========================
• WebSocket /ws          → browser frontend (state/counter updates)
• WebSocket /ws/esp32    → ESP32 hardware (commands & events)
• GET /video_feed        → MJPEG webcam stream with detection overlay
• POST /simulate/*       → trigger hardware events without physical ESP32
• GET /status            → current state JSON
• /admin/*               → admin auth + stats (JWT protected)
"""

import asyncio
import json
import logging
import time
from contextlib import asynccontextmanager
from enum import Enum
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from admin import router as admin_router
from camera import Camera
from coin_logic import calculate_coins, calculate_leftover
from config import settings
from database import end_session, init_db, log_detection, start_session
from detection import DetectionResult, EcoSwapDetector

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s")
logger = logging.getLogger("ecoswap")

# ── State machine ─────────────────────────────────────────────────────────────

class State(str, Enum):
    IDLE          = "IDLE"
    INLET_OPEN    = "INLET_OPEN"
    INLET_CLOSE   = "INLET_CLOSE"
    DETECTING     = "DETECTING"
    DISPENSING_BIN= "DISPENSING_BIN"
    RESETTING     = "RESETTING"
    FINISHING     = "FINISHING"
    SUMMARY       = "SUMMARY"


class SessionState:
    def __init__(self) -> None:
        self.state:            State        = State.IDLE
        self.bottles:          int          = 0
        self.cans:             int          = 0
        self.rejected:         int          = 0
        self.finish_requested: bool         = False
        self.session_id:       Optional[int]= None
        self.last_result:      Optional[str]= None
        self.last_confidence:  float        = 0.0
        self.last_detection:   Optional[DetectionResult] = None


session = SessionState()

# ── Hardware & peripherals ────────────────────────────────────────────────────

camera   = Camera(settings.CAMERA_INDEX)
detector = EcoSwapDetector(settings.MODEL_PATH, settings.CONFIDENCE_THRESHOLD)
esp32_ws: Optional[WebSocket] = None

# ── WebSocket connection manager (frontend) ───────────────────────────────────

class FrontendManager:
    def __init__(self) -> None:
        self._connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self._connections:
            self._connections.remove(ws)

    async def broadcast(self, msg: Dict[str, Any]) -> None:
        data = json.dumps(msg)
        dead: List[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


frontend = FrontendManager()

# ── ESP32 helpers ─────────────────────────────────────────────────────────────

async def _send_esp32(cmd: Dict[str, Any]) -> None:
    if esp32_ws is not None:
        try:
            await esp32_ws.send_text(json.dumps(cmd))
        except Exception as exc:
            logger.warning("ESP32 send failed: %s", exc)


# ── State helpers ─────────────────────────────────────────────────────────────

async def _transition(state: State) -> None:
    session.state = state
    await frontend.broadcast({"type": "STATE_CHANGE", "state": state.value})
    logger.info("State → %s", state.value)


async def _broadcast_counters() -> None:
    coins = calculate_coins(session.bottles, session.cans)
    await frontend.broadcast({
        "type":     "COUNTER_UPDATE",
        "bottles":  session.bottles,
        "cans":     session.cans,
        "rejected": session.rejected,
        "coins":    coins,
    })


# ── State machine actions ─────────────────────────────────────────────────────

async def handle_button_start() -> None:
    if session.state != State.IDLE:
        return
    session.bottles          = 0
    session.cans             = 0
    session.rejected         = 0
    session.finish_requested = False
    session.last_result      = None
    session.session_id       = start_session()
    await _transition(State.INLET_OPEN)
    await _send_esp32({"cmd": "OPEN_INLET"})
    await _broadcast_counters()


async def handle_item_detected() -> None:
    if session.state != State.INLET_OPEN:
        return
    await _transition(State.INLET_CLOSE)
    await _send_esp32({"cmd": "CLOSE_INLET"})
    asyncio.create_task(_delayed_detect(1.2))


async def _delayed_detect(delay: float) -> None:
    await asyncio.sleep(delay)
    await _run_detection()


async def _run_detection() -> None:
    await _transition(State.DETECTING)

    frame = camera.capture_snapshot()

    loop   = asyncio.get_event_loop()
    if frame is not None:
        result = await loop.run_in_executor(None, detector.detect, frame)
    else:
        result = DetectionResult(label="UNKNOWN", confidence=0.0)

    session.last_result     = result.label
    session.last_confidence = result.confidence
    session.last_detection  = result

    if session.session_id:
        log_detection(session.session_id, result.label, result.confidence)

    if result.label == "BOTTLE":
        session.bottles  += 1
    elif result.label == "CAN":
        session.cans     += 1
    else:
        session.rejected += 1

    coins = calculate_coins(session.bottles, session.cans)
    await frontend.broadcast({
        "type":          "DETECTION_RESULT",
        "result":        result.label,
        "confidence":    round(result.confidence, 3),
        "bottle_count":  session.bottles,
        "can_count":     session.cans,
        "rejected_count":session.rejected,
        "coins":         coins,
    })

    angle = 90 if result.label == "BOTTLE" else \
            180 if result.label == "CAN" else 270

    await _transition(State.DISPENSING_BIN)
    await _send_esp32({"cmd": "ROTATE_CHAMBER", "angle": angle})
    await asyncio.sleep(1.0)
    await _send_esp32({"cmd": "OPEN_CHAMBER_FLOOR"})
    asyncio.create_task(_delayed_reset(1.8))


async def _delayed_reset(delay: float) -> None:
    await asyncio.sleep(delay)
    await _send_esp32({"cmd": "CLOSE_CHAMBER_FLOOR"})
    await _send_esp32({"cmd": "RESET_CHAMBER"})
    await _transition(State.RESETTING)
    await asyncio.sleep(1.5)

    if session.finish_requested:
        await _do_finish()
    else:
        await _transition(State.INLET_OPEN)
        await _send_esp32({"cmd": "OPEN_INLET"})


async def handle_button_finish() -> None:
    if session.state in (State.IDLE, State.SUMMARY, State.FINISHING):
        return
    if session.state in (State.INLET_OPEN, State.RESETTING):
        await _do_finish()
    else:
        session.finish_requested = True


async def _do_finish() -> None:
    await _transition(State.FINISHING)

    coins      = calculate_coins(session.bottles, session.cans)
    leftover   = calculate_leftover(session.bottles, session.cans)

    if coins > 0:
        await _send_esp32({"cmd": "DISPENSE_COINS", "count": coins})
        await asyncio.sleep(coins * 0.6 + 0.5)

    if session.session_id:
        end_session(
            session.session_id,
            session.bottles, session.cans, session.rejected,
            coins,
            leftover["leftover_bottles"], leftover["leftover_cans"],
        )

    await frontend.broadcast({
        "type":             "SESSION_SUMMARY",
        "bottles":          session.bottles,
        "cans":             session.cans,
        "rejected":         session.rejected,
        "coins":            coins,
        "leftover_bottles": leftover["leftover_bottles"],
        "leftover_cans":    leftover["leftover_cans"],
    })
    await _transition(State.SUMMARY)
    asyncio.create_task(_auto_idle(18.0))


async def _auto_idle(delay: float) -> None:
    await asyncio.sleep(delay)
    if session.state == State.SUMMARY:
        await _transition(State.IDLE)


# ── ESP32 event dispatcher ────────────────────────────────────────────────────

async def handle_esp32_event(event: str) -> None:
    logger.info("ESP32 event: %s", event)
    dispatch = {
        "BUTTON_START":  handle_button_start,
        "BUTTON_FINISH": handle_button_finish,
        "ITEM_DETECTED": handle_item_detected,
    }
    handler = dispatch.get(event)
    if handler:
        await handler()


# ── MJPEG video feed ──────────────────────────────────────────────────────────

async def _video_generator():
    """Async generator yielding MJPEG frames (~30 fps)."""
    scan_offset = 0
    while True:
        frame = camera.get_frame()
        if frame is None:
            # Placeholder when camera is unavailable
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, "Camera unavailable", (130, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (34, 197, 94), 2,
                        cv2.LINE_AA)
        else:
            frame = frame.copy()

        h, w = frame.shape[:2]

        if session.state == State.DETECTING:
            # Green scanning line animation
            scan_offset = (scan_offset + 8) % h
            cv2.line(frame, (0, scan_offset), (w, scan_offset),
                     (34, 197, 94), 2)
            # Semi-transparent dark overlay tint
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (w, h), (0, 20, 0), -1)
            frame = cv2.addWeighted(overlay, 0.25, frame, 0.75, 0)
            # "Analyzing..." text
            cv2.putText(frame, "ANALYZING...", (w // 2 - 100, h - 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (34, 197, 94), 2,
                        cv2.LINE_AA)

        elif session.last_detection and session.state == State.DISPENSING_BIN:
            frame = detector.draw_detection(frame, session.last_detection)

        # State watermark (bottom-left)
        cv2.putText(frame, session.state.value.replace("_", " "),
                    (8, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.55,
                    (34, 197, 94), 1, cv2.LINE_AA)

        _, buf = cv2.imencode(".jpg", frame,
                              [cv2.IMWRITE_JPEG_QUALITY, 78])
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
               + buf.tobytes() + b"\r\n")

        await asyncio.sleep(1 / 28)  # ~28 fps


# ── FastAPI app ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    camera.start()
    logger.info("EcoSwap backend ready  ✓")
    yield
    camera.stop()


app = FastAPI(title="EcoSwap API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/admin")


# ── REST endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "camera": camera.is_available,
        "esp32":  esp32_ws is not None,
        "state":  session.state.value,
    }


@app.get("/status")
async def status():
    coins = calculate_coins(session.bottles, session.cans)
    return {
        "state":           session.state.value,
        "bottles":         session.bottles,
        "cans":            session.cans,
        "rejected":        session.rejected,
        "coins":           coins,
        "esp32_connected": esp32_ws is not None,
        "camera_online":   camera.is_available,
    }


@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(
        _video_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


# ── Simulation endpoints (no physical hardware needed) ───────────────────────

@app.post("/simulate/start")
async def sim_start():
    await handle_button_start()
    return {"ok": True}


@app.post("/simulate/item_detected")
async def sim_item():
    """
    Simulate an item being inserted.
    The frontend runs its own countdown before calling this, so we skip the
    sensor-settling delay and capture almost immediately (0.2 s).
    """
    if session.state != State.INLET_OPEN:
        return {"ok": False, "reason": f"state is {session.state.value}, expected INLET_OPEN"}
    await _transition(State.INLET_CLOSE)
    await _send_esp32({"cmd": "CLOSE_INLET"})
    asyncio.create_task(_delayed_detect(0.2))   # countdown already done on frontend
    return {"ok": True}


@app.post("/simulate/finish")
async def sim_finish():
    await handle_button_finish()
    return {"ok": True}


@app.post("/simulate/reset")
async def sim_reset():
    session.state            = State.IDLE
    session.bottles          = 0
    session.cans             = 0
    session.rejected         = 0
    session.finish_requested = False
    session.last_result      = None
    await frontend.broadcast({"type": "STATE_CHANGE", "state": "IDLE"})
    await _broadcast_counters()
    return {"ok": True}


# ── WebSocket: frontend ───────────────────────────────────────────────────────

@app.websocket("/ws")
async def ws_frontend(websocket: WebSocket):
    await frontend.connect(websocket)
    # Push current state immediately on connect
    coins = calculate_coins(session.bottles, session.cans)
    await websocket.send_text(json.dumps({
        "type":     "STATE_CHANGE",
        "state":    session.state.value,
        "bottles":  session.bottles,
        "cans":     session.cans,
        "rejected": session.rejected,
        "coins":    coins,
    }))
    try:
        while True:
            # Keep connection alive; client may send pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        frontend.disconnect(websocket)


# ── WebSocket: ESP32 ──────────────────────────────────────────────────────────

@app.websocket("/ws/esp32")
async def ws_esp32(websocket: WebSocket):
    global esp32_ws
    await websocket.accept()
    esp32_ws = websocket
    logger.info("ESP32 connected")
    await frontend.broadcast({"type": "ESP32_STATUS", "connected": True})
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                await handle_esp32_event(msg.get("event", ""))
            except json.JSONDecodeError:
                logger.warning("Bad JSON from ESP32: %s", raw)
    except WebSocketDisconnect:
        esp32_ws = None
        logger.info("ESP32 disconnected")
        await frontend.broadcast({"type": "ESP32_STATUS", "connected": False})
