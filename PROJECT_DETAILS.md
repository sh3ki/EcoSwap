# EcoSwap — Project Details (Single Source of Truth)

> **Version:** 1.1 | **Date:** 2026-05-23
> This document is the single source of truth for the EcoSwap reverse vending machine project. All hardware, software, architecture, communication protocols, and development steps are defined here.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Hardware Components](#3-hardware-components)
4. [Mechanical Design](#4-mechanical-design)
5. [State Machine & Flow](#5-state-machine--flow)
6. [Coin Exchange Rules](#6-coin-exchange-rules)
7. [Software Stack](#7-software-stack)
8. [Object Detection Module](#8-object-detection-module)
9. [ESP32 Firmware](#9-esp32-firmware)
10. [Web Application](#10-web-application)
11. [Communication Protocol](#11-communication-protocol)
12. [Project File Structure](#12-project-file-structure)
13. [Wiring & Pin Mapping](#13-wiring--pin-mapping)
14. [Development Roadmap](#14-development-roadmap)
15. [Open Questions & Decisions](#15-open-questions--decisions)

---

## 1. Project Overview

**EcoSwap** is a DIY reverse vending machine (RVM) that accepts recyclable plastic water bottles and aluminum cans in exchange for Philippine peso coins (₱1 coins).

| Attribute        | Detail                                          |
|------------------|-------------------------------------------------|
| Purpose          | Incentivize recycling by dispensing coins       |
| Accepted items   | PET water bottles, aluminum beverage cans       |
| Reward rate      | 5 water bottles = ₱1 coin, 2 aluminum cans = ₱1 coin |
| Processing unit  | Laptop (object detection + UI + business logic) |
| Hardware MCU     | ESP32 (servo control + sensors + buttons)       |
| UI               | Web application running on the laptop           |
| Camera           | Laptop webcam (built-in or USB)                 |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        LAPTOP                           │
│                                                         │
│  ┌──────────────┐    WebSocket    ┌──────────────────┐  │
│  │  Web App UI  │◄───────────────►│  Python Backend  │  │
│  │  (Browser)   │                 │  (Flask/FastAPI) │  │
│  └──────────────┘                 └────────┬─────────┘  │
│                                            │            │
│                                   ┌────────▼─────────┐  │
│                                   │  OpenCV + AI     │  │
│                                   │  (Object Detect) │  │
│                                   └────────┬─────────┘  │
│                                            │ WebSocket  │
└────────────────────────────────────────────┼────────────┘
                                             │ WiFi (same LAN)
                                             │
                              ┌──────────────▼──────────────┐
                              │           ESP32              │
                              │                             │
                              │  • Servo A (inlet door)     │
                              │  • Servo B (chamber rotate) │
                              │  • Servo C (chamber floor)  │
                              │  • Servo D (coin dispenser) │
                              │  • Ultrasonic (HC-SR04)     │
                              │  • START button             │
                              │  • FINISH button            │
                              └─────────────────────────────┘
```

### Data Flow Summary

1. User presses **START** button (ESP32) → ESP32 notifies Backend → Backend updates UI.
2. ESP32 opens the inlet door (Servo A).
3. Ultrasonic sensor detects item inserted → ESP32 closes inlet door → notifies Backend.
4. Backend triggers webcam capture → AI model classifies item.
5. Backend sends classification result to ESP32.
6. ESP32 rotates chamber (Servo B) to target bin, opens chamber floor (Servo C).
7. Item falls into bin → ESP32 notifies Backend → Backend updates count on UI.
8. Inlet door re-opens, cycle repeats.
9. User presses **FINISH** → Backend computes coins earned → signals ESP32 to dispense coins (Servo D).

---

## 3. Hardware Components

### 3.1 Core Electronics

| # | Component                  | Qty | Purpose                              | Notes                        |
|---|----------------------------|-----|--------------------------------------|------------------------------|
| 1 | **ESP32 Dev Board**        | 1   | Main MCU, WiFi, servo & sensor ctrl  | ESP32-WROOM-32 recommended   |
| 2 | **Laptop**                 | 1   | AI processing, UI, business logic    | User-provided                |
| 3 | **Webcam**                 | 1   | Object detection camera              | Built-in or USB webcam       |

### 3.2 Actuators

| # | Component                         | Qty | Purpose                              |
|---|-----------------------------------|-----|--------------------------------------|
| 4 | **Servo Motor (MG996R or MG90S)** | 4   | A: Inlet door, B: Chamber rotate, C: Chamber floor, D: Coin dispenser |
| 5 | **Servo Motor (standard SG90)**   | 1   | Alternative for lighter mechanisms   |
| — | *(Optional)* **PCA9685 16-ch PWM Servo Driver** | 1 | I2C-controlled servo driver board — see note below |

> **Servo Selection Guide:**
> - `MG996R` (metal gear, high torque) — use for the inlet door and coin dispenser where more force is needed.
> - `MG90S` (metal gear, mini) — use for chamber rotation and chamber floor.
> - `SG90` (plastic gear, light) — suitable only for small, lightweight mechanisms.
>
> **No motor driver (e.g. L298N) is needed.** Servo motors have built-in control circuits. They connect directly to the ESP32: Signal pin → ESP32 GPIO (PWM), VCC → external 5V rail, GND → common ground. Motor drivers are only required for DC motors or stepper motors, which this project does not use.
>
> **PCA9685 (Optional):** A 16-channel I2C PWM servo driver board. Communicates with the ESP32 using only 2 wires (SDA + SCL) and controls all servos through those. Benefits: frees up ESP32 GPIO pins, provides more precise 12-bit PWM signals via its own dedicated oscillator, and cleanly separates servo power from ESP32 logic. For 4 servos it is not required — direct ESP32 GPIO control works fine — but it is a clean and future-proof upgrade if you have one available. Use the `Adafruit_PWMServoDriver` Arduino library to control it.

### 3.3 Sensors

| # | Component                  | Qty | Purpose                              |
|---|----------------------------|-----|--------------------------------------|
| 6 | **HC-SR04 Ultrasonic**     | 1   | Detects when item enters the inlet   |
| 7 | Alternatively: **IR Obstacle Sensor (FC-51)** | 1 | Simpler alternative to detect item passage |
| 8 | Alternatively: **Laser + LDR (beam-break)** | 1 set | Most reliable for detecting item pass-through |

> **Recommended:** Laser beam-break sensor (laser diode + LDR/phototransistor) — most reliable for detecting a bottle or can passing through the inlet opening. The ultrasonic may have dead zones or false triggers due to tube geometry. IR obstacle sensor is a mid-tier option.

### 3.4 Input Devices

| # | Component                  | Qty | Purpose                              |
|---|----------------------------|-----|--------------------------------------|
| 9 | **Push Button (momentary)** | 2  | START and FINISH buttons             |
| 10| **10kΩ resistor**          | 2   | Pull-down resistors for buttons      |

### 3.5 Power

| # | Component                       | Qty | Purpose                              |
|---|---------------------------------|-----|--------------------------------------|
| 11| **5V/2A–3A Power Supply (DC)**  | 1   | Powers ESP32 and all servo motors. 2A works since servos move sequentially; 3A if you want extra headroom. |
| 12| **Capacitor 100µF (electrolytic)** | 1 | *(Optional but recommended)* Place across 5V/GND rail near servos. Absorbs current spikes to prevent ESP32 resets or servo jitter. If build is stable without it, skip it. |
| 13| **Buck Converter (LM2596)**     | 1   | Only needed if using a 12V supply — steps it down to 5V. Skip if using a 5V supply directly. |

> **Important:** Do NOT power servos from the ESP32 3.3V or 5V pin — it cannot supply enough current and will damage the board. Use an external 5V supply. Share GND between the supply and the ESP32.

### 3.6 Coin Dispenser Mechanism

DIY servo-driven coin tube.

**Servo Coin Tube (DIY)**
- A vertical PVC pipe (~26mm inner diameter, ~15cm long) holds a stack of ₱1 coins.
- At the bottom is a servo-driven rotating paddle/gate attached to the servo horn.
- To dispense one coin: servo rotates from `0°` to `60°` then back to `0°` — the paddle sweeps the bottom coin out of the tube into a tray.
- To dispense N coins: repeat the pulse N times with a short delay (~500ms) between each.
- Easy to refill from the top of the tube.
- ₱1 coin is 20mm diameter — use PVC pipe with ~22–24mm inner diameter for smooth flow.

> **Tip:** Use an **MG996R** servo for this — the coin stack can be heavy and needs enough torque to reliably push coins out one at a time.

### 3.7 Structural / Miscellaneous

| # | Component                              | Qty | Notes                                                    |
|---|----------------------------------------|-----|----------------------------------------------------------|
| 14| Plywood / MDF sheets                   | —   | Frame, bin walls, base, top panel                        |
| 15| **Clear acrylic sheet** (3–4mm thick)  | 1   | Detection chamber walls — transparent for webcam view    |
| 16| **PVC pipe (~90–110mm dia, ~30cm)**    | 1   | Inlet chute — wide enough for bottles and cans           |
| 17| PVC pipe (~22–24mm dia, ~15cm)         | 1   | Coin dispenser tube                                      |
| 18| **LED strip or LED ring (5V, white)**  | 1   | Inside detection chamber for consistent lighting         |
| 19| Jumper wires (M-M, M-F)                | —   | Wiring                                                   |
| 20| Breadboard or PCB                      | 1   | Prototyping connections                                  |
| 21| USB-A to Micro-USB / USB-C cable       | 1   | Flashing ESP32 firmware                                  |
| 22| 3x Bins (labeled)                      | 3   | Bottle bin, Can bin, Rejected bin                        |

---

## 4. Mechanical Design

### 4.1 Physical Layout (Top-Down View)

```
┌──────────────────────────────────────────┐
│               FRONT PANEL                │
│                                          │
│         [START]         [FINISH]         │  ← buttons
│                                          │
│              ┌───────┐                   │
│              │ INLET │  ← Servo A opens/closes this
│              │ CHUTE │                   │
│              └───┬───┘                   │
│                  │                       │
│              ┌───▼───┐  ← detection chamber (rotates)
│              │ CHAMBER│                  │
│              │[WEBCAM]│                  │
│              └───────┘                   │
│                                          │
│  [BOTTLE BIN]  [CAN BIN]  [REJECT BIN]   │
│                                          │
│         [COIN DISPENSER SLOT]            │
└──────────────────────────────────────────┘
```

### 4.2 Inlet Chute (PVC Pipe)

- Made from **PVC pipe (~90–110mm inner diameter)** — wide enough to accept a standard 500mL water bottle (~65mm dia) or a standard aluminum can (~66mm dia) inserted upright or slightly tilted.
- Length: ~25–30cm vertical drop so the item falls cleanly into the detection chamber.
- The top of the PVC pipe is where the inlet door (Servo A) sits.
- The bottom of the PVC pipe opens directly into the detection chamber.

### 4.3 Inlet Door Mechanism (Servo A)

- A servo-driven flap mounted at the **top opening of the PVC inlet chute**.
- `0°` = closed (blocks the opening), `90°` = open (item can be inserted).
- The flap should be sized to fully cover the pipe opening when closed.

### 4.4 Detection Chamber (Servo B — Rotation)

- A small **enclosed box (~12cm × 12cm × 20cm)** that receives and holds the item while the camera analyzes it.
- **Walls: clear acrylic (3–4mm thick)** on all sides — the webcam can see through from any angle without any gap or hole.
- Frame/base of the chamber: plywood or 3D printed bracket mounted on the rotating platform.
- **Interior lighting: LED strip or LED ring light mounted inside the chamber** pointing at the item. This is important — it eliminates inconsistent ambient lighting and ensures the AI model always sees the item under the same conditions, greatly improving detection accuracy.
- The webcam is positioned externally, pointing at the acrylic wall of the chamber.
- Rotation stops (Servo B):
  - `0°` (center) → inlet alignment (item drops in from PVC chute above)
  - `90°` (right) → bottle bin alignment
  - `180°` (left) → can bin alignment
  - `270°` or `-45°` → reject bin alignment
- Adjust angles based on physical bin placement.

### 4.5 Chamber Floor (Servo C — Drop)

- The bottom of the acrylic chamber is a servo-driven trapdoor.
- `0°` = closed (item rests on floor), `90°` = open (item falls into bin below).

### 4.6 Item Passage Detection (Sensor inside PVC chute)

- Positioned **inside the PVC inlet chute**, mounted horizontally across the pipe.
- Detects when an item passes through the chute, triggering the inlet door to close.
- For HC-SR04: when the distance reading drops below a threshold (e.g., < 8–10cm inside the pipe), an item is detected.
- For laser beam-break: laser mounted on one side of the pipe, LDR on the opposite side — item breaks the beam.

---

## 5. State Machine & Flow

```
           ┌─────────────┐
           │    IDLE     │  ← System waiting, display idle UI
           └──────┬──────┘
                  │ User presses START button
                  ▼
           ┌─────────────┐
           │  INLET OPEN │  ← Servo A opens inlet door
           └──────┬──────┘
                  │ Beam-break / ultrasonic detects item
                  ▼
           ┌──────────────┐
           │ INLET CLOSE  │  ← Servo A closes; item in chute
           └──────┬───────┘
                  │ Item falls into detection chamber
                  ▼
           ┌──────────────────┐
           │ DETECT (CAMERA)  │  ← Webcam captures image; AI classifies
           └────────┬─────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       BOTTLE      CAN      NEITHER
          │         │         │
          ▼         ▼         ▼
   Chamber→      Chamber→  Chamber→
   Bottle bin    Can bin   Reject bin
          │         │         │
          └─────────┴─────────┘
                    │ Servo C opens chamber floor; item drops
                    ▼
           ┌──────────────────┐
           │ UPDATE COUNT     │  ← Backend increments bottle/can counter
           │ + RESET CHAMBER  │  ← Servo B returns to 0°; Servo C closes
           └──────────┬───────┘
                      │
          ┌───────────┴──────────┐
          │                      │
          ▼                      ▼
   User presses FINISH    (back to INLET OPEN)
          │
          ▼
   ┌─────────────────────┐
   │  CALCULATE COINS    │  ← Apply coin exchange rules
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  DISPENSE COINS     │  ← Servo D pulses N times for N coins
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  SESSION SUMMARY    │  ← Show summary on UI; reset counters
   └──────────┬──────────┘
              │
              ▼
           ┌─────────────┐
           │    IDLE     │
           └─────────────┘
```

### State Definitions

| State           | Description                                          |
|-----------------|------------------------------------------------------|
| `IDLE`          | System ready, waiting for START                     |
| `INLET_OPEN`    | Inlet door is open, waiting for item                |
| `INLET_CLOSE`   | Item detected, door closing, item dropping to chamber|
| `DETECTING`     | Camera capturing and AI classifying item            |
| `DISPENSING_BIN`| Chamber rotating and dropping item into correct bin  |
| `RESETTING`     | Chamber returning to home, preparing for next item  |
| `FINISHING`     | FINISH pressed, calculating and dispensing coins    |
| `SUMMARY`       | Showing session results to user                     |

---

## 6. Coin Exchange Rules

```
Total ₱1 Coins = floor(bottles / 5) + floor(cans / 2)
Leftover bottles = bottles mod 5   (not rewarded this session)
Leftover cans    = cans mod 2      (not rewarded this session)
```

### Examples

| Bottles | Cans | Coins Earned | Leftover |
|---------|------|--------------|----------|
| 5       | 0    | ₱1           | 0 B, 0 C |
| 10      | 0    | ₱2           | 0 B, 0 C |
| 4       | 0    | ₱0           | 4 B, 0 C |
| 0       | 2    | ₱1           | 0 B, 0 C |
| 0       | 5    | ₱2           | 0 B, 1 C |
| 6       | 3    | ₱2           | 1 B, 1 C |
| 5       | 2    | ₱2           | 0 B, 0 C |

> **Note:** Leftover items are NOT carried over to the next user's session. They are counted as recycled but do not yield a coin for the current session.

---

## 7. Software Stack

### 7.1 Backend (Laptop)

| Layer              | Technology                  | Purpose                                      |
|--------------------|-----------------------------|----------------------------------------------|
| Language           | Python 3.10+                | Core logic                                   |
| Web Framework      | FastAPI                     | REST API + WebSocket server                  |
| ASGI Server        | Uvicorn                     | Run FastAPI                                  |
| Camera Interface   | OpenCV (`cv2`)              | Webcam capture                               |
| AI Model           | Ultralytics YOLOv8 (nano)   | Object detection/classification              |
| Hardware Comms     | WebSocket (to ESP32)        | Send/receive commands to ESP32               |
| State Management   | Python (in-memory)          | Session state, counters                      |

### 7.2 Frontend (Web App on Laptop)

| Layer              | Technology                  | Purpose                                      |
|--------------------|-----------------------------|----------------------------------------------|
| Framework          | React (Vite)                | UI components                                |
| Styling            | Tailwind CSS                | Responsive design                            |
| Real-time          | WebSocket (native browser)  | Live updates from backend                   |
| HTTP               | Fetch API / Axios           | REST calls to backend                        |

### 7.3 ESP32 Firmware

| Layer              | Technology                  | Purpose                                      |
|--------------------|-----------------------------|----------------------------------------------|
| Language           | Arduino C++ (Arduino IDE)   | Firmware                                     |
| WiFi               | `WiFi.h`                    | Connect to LAN                               |
| WebSocket          | `WebSocketsClient` (library)| Connect to backend WebSocket                 |
| Servo Control      | `ESP32Servo` (library)      | PWM servo control                            |
| Sensor Reading     | `NewPing` (library)         | HC-SR04 ultrasonic                           |

### 7.4 AI / Machine Learning

| Item               | Detail                                              |
|--------------------|-----------------------------------------------------|
| Model              | YOLOv8n (nano) — lightweight, fast on CPU           |
| Classes            | `water_bottle`, `aluminum_can`, `unknown`           |
| Training data      | Custom dataset + augmented images from public sets  |
| Inference engine   | Ultralytics Python package                          |
| Fallback           | OpenCV HSV color + shape heuristics (backup)        |
| Confidence threshold| 0.65 (below this → classified as `unknown`)        |

---

## 8. Object Detection Module

### 8.1 Detection Pipeline

```
Webcam Frame
    │
    ▼
OpenCV capture (cv2.VideoCapture)
    │
    ▼
Pre-process: resize to 640×640, normalize
    │
    ▼
YOLOv8n inference
    │
    ▼
Filter detections (confidence > 0.65)
    │
    ├── class: water_bottle → return "BOTTLE"
    ├── class: aluminum_can → return "CAN"
    └── else / empty         → return "UNKNOWN"
```

### 8.2 Training Data Sources

- [Google Open Images Dataset](https://storage.googleapis.com/openimages/web/index.html) — search for "bottle" and "can"
- [Roboflow Universe](https://universe.roboflow.com) — search for existing bottle/can detection datasets (many are free)
- Custom photos: take ~100–200 photos of your actual bottles and cans in various orientations under the detection chamber lighting.

### 8.3 Model Training Steps (Summary)

1. Collect and annotate dataset (Roboflow recommended for annotation).
2. Export in YOLOv8 format.
3. Train: `yolo train model=yolov8n.pt data=ecoswap.yaml epochs=50 imgsz=640`
4. Validate and export model to `best.pt`.
5. Load `best.pt` in the backend for inference.

---

## 9. ESP32 Firmware

### 9.1 Responsibilities

- Connect to WiFi and establish WebSocket connection to laptop backend.
- Listen for commands from backend and execute servo actions.
- Read ultrasonic/IR sensor and send events to backend.
- Read button presses and send events to backend.

### 9.2 WebSocket Message Format (ESP32 side)

**ESP32 → Backend (Events):**
```json
{ "event": "BUTTON_START" }
{ "event": "BUTTON_FINISH" }
{ "event": "ITEM_DETECTED" }
```

**Backend → ESP32 (Commands):**
```json
{ "cmd": "OPEN_INLET" }
{ "cmd": "CLOSE_INLET" }
{ "cmd": "ROTATE_CHAMBER", "angle": 90 }
{ "cmd": "OPEN_CHAMBER_FLOOR" }
{ "cmd": "CLOSE_CHAMBER_FLOOR" }
{ "cmd": "DISPENSE_COINS", "count": 2 }
{ "cmd": "RESET_CHAMBER" }
```

### 9.3 Servo Angle Map

| Servo | Function          | Closed/Home | Open/Active                        |
|-------|-------------------|-------------|------------------------------------|
| A     | Inlet door        | 0°          | 90°                                |
| B     | Chamber rotation  | 0° (center) | 90° / 180° / 270°                  |
| C     | Chamber floor     | 0°          | 90°                                |
| D     | Coin dispenser    | 0°          | 60° (sweep paddle, 1 coin/pulse)   |

---

## 10. Web Application

### 10.1 Pages / Screens

| Screen       | Content                                                             |
|--------------|---------------------------------------------------------------------|
| **Idle**     | EcoSwap logo, "Press START to begin" message, exchange rate info    |
| **Active**   | Real-time counter (bottles, cans), live webcam feed, last detection result |
| **Detecting**| Animated "Analyzing item..." overlay on webcam feed                 |
| **Result**   | Shows "BOTTLE ✓", "CAN ✓", or "REJECTED ✗" with animation          |
| **Summary**  | Total bottles, total cans, coins earned, leftover items, "Thank you" |
| **Admin**    | (Optional) System status, coin hopper level, manually trigger states |

### 10.2 UI Key Elements

- Live webcam feed panel (via backend `/video_feed` or WebSocket stream).
- Bottle counter badge (updates in real-time via WebSocket).
- Can counter badge (updates in real-time via WebSocket).
- Running coins total display.
- Exchange rate reminder: "5 bottles = ₱1 | 2 cans = ₱1".
- Status banner: current system state (IDLE / WAITING / DETECTING / etc.).

---

## 11. Communication Protocol

### 11.1 Backend WebSocket Endpoint

- URL: `ws://localhost:8000/ws` (for browser frontend)
- URL: `ws://<laptop-local-ip>:8000/ws/esp32` (for ESP32)

### 11.2 Frontend WebSocket Messages

**Backend → Frontend (UI Updates):**
```json
{ "type": "STATE_CHANGE", "state": "DETECTING" }
{ "type": "DETECTION_RESULT", "result": "BOTTLE", "bottle_count": 3, "can_count": 1 }
{ "type": "COUNTER_UPDATE", "bottles": 3, "cans": 1, "coins": 0 }
{ "type": "SESSION_SUMMARY", "bottles": 5, "cans": 2, "coins": 2, "leftover_bottles": 0, "leftover_cans": 0 }
{ "type": "ERROR", "message": "Camera not available" }
```

### 11.3 REST API Endpoints (Backend)

| Method | Path                         | Description                               |
|--------|------------------------------|-------------------------------------------|
| GET    | `/status`                    | Current system state and counters         |
| GET    | `/health`                    | Health check                              |
| GET    | `/video_feed`                | MJPEG webcam stream (with detection overlay) |
| POST   | `/simulate/start`            | Simulate START button (no hardware needed)|
| POST   | `/simulate/item_detected`    | Simulate item inserted                    |
| POST   | `/simulate/finish`           | Simulate FINISH button                    |
| POST   | `/simulate/reset`            | Force-reset to IDLE state                 |
| POST   | `/admin/login`               | Admin login → returns JWT token           |
| GET    | `/admin/stats`               | Overall stats (JWT required)              |
| GET    | `/admin/sessions`            | Session history list (JWT required)       |

---

## 12. Project File Structure

```
EcoSwap/
│
├── PROJECT_DETAILS.md              ← This file (source of truth)
│
├── backend/                        ← Python FastAPI backend
│   ├── main.py                     ← FastAPI app, WebSocket, full state machine
│   ├── detection.py                ← YOLOv8 inference (custom or COCO fallback)
│   ├── camera.py                   ← OpenCV threaded webcam capture
│   ├── coin_logic.py               ← Coin calculation logic
│   ├── admin.py                    ← Admin JWT auth + stats endpoints
│   ├── database.py                 ← SQLite session + detection log
│   ├── config.py                   ← Settings from .env
│   ├── models/
│   │   └── best.pt                 ← Trained YOLOv8 model weights (place here)
│   ├── requirements.txt
│   ├── .env.example                ← Copy to .env and configure
│   └── .env                        ← ESP32 IP, camera index, thresholds
│
├── frontend/                       ← React (Vite) + Tailwind CSS web application
│   ├── src/
│   │   ├── main.jsx                ← Entry point
│   │   ├── App.jsx                 ← Router: / (public) | /admin | /admin/dashboard
│   │   ├── index.css               ← Tailwind + custom CSS (dark green theme)
│   │   ├── config.js               ← VITE_BACKEND_HOST, WS_URL, API_URL
│   │   ├── contexts/
│   │   │   └── AppContext.jsx      ← Global WebSocket state (reducer)
│   │   ├── hooks/
│   │   │   └── useWebSocket.js     ← Auto-reconnecting WebSocket hook
│   │   ├── components/
│   │   │   ├── IdleScreen.jsx      ← Full-screen landing (logo, rates, CTA)
│   │   │   ├── ActiveScreen.jsx    ← Camera + live counters + FINISH button
│   │   │   ├── SummaryScreen.jsx   ← Session summary + coin payout
│   │   │   ├── StatusBanner.jsx    ← Top status bar (state, ESP32, backend)
│   │   │   └── CameraFeed.jsx      ← MJPEG stream + scan overlay + result flash
│   │   └── pages/
│   │       ├── MainPage.jsx        ← Routes IdleScreen / ActiveScreen / SummaryScreen
│   │       ├── AdminLogin.jsx      ← Admin login form (JWT)
│   │       └── AdminDashboard.jsx  ← Stats cards + session history table
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── firmware/                       ← ESP32 Arduino firmware
│   └── ecoswap_esp32/
│       ├── ecoswap_esp32.ino       ← Main Arduino sketch
│       ├── config.h                ← WiFi credentials, backend IP, pin map
│       ├── servo_control.h/.cpp    ← Servo helper functions
│       └── sensor.h/.cpp           ← Ultrasonic/IR sensor functions
│
├── ml/                             ← Machine learning training
│   ├── ecoswap.yaml                ← YOLOv8 dataset config
│   ├── train.py                    ← Training script
│   ├── evaluate.py                 ← Evaluation script
│   └── data/
│       ├── images/
│       │   ├── train/
│       │   └── val/
│       └── labels/
│           ├── train/
│           └── val/
│
└── docs/
    ├── wiring_diagram.png
    └── mechanical_sketch.png
```

---

## 13. Wiring & Pin Mapping

### 13.1 ESP32 Pin Assignment

| GPIO Pin | Connected To              | Notes                                      |
|----------|---------------------------|--------------------------------------------|
| GPIO 13  | Servo A (Inlet Door)      | PWM signal                                          |
| GPIO 12  | Servo B (Chamber Rotate)  | PWM signal                                          |
| GPIO 14  | Servo C (Chamber Floor)   | PWM signal                                          |
| GPIO 27  | Servo D (Coin Dispenser)  | PWM signal                                          |
| GPIO 5   | HC-SR04 TRIG              | Digital output                                      |
| GPIO 18  | HC-SR04 ECHO              | Digital input (use 1kΩ + 2kΩ voltage divider)       |
| GPIO 19  | START Button              | Digital input (internal pull-up)                    |
| GPIO 21  | FINISH Button             | Digital input (internal pull-up)                    |
| 5V (VIN) | Servo power rail (VCC)    | Use external 5V supply, NOT ESP32 3.3V pin           |
| GND      | Common ground             | Share GND between 5V supply and ESP32                |

> **Voltage Note:** ESP32 operates at 3.3V logic. The HC-SR04 ECHO pin outputs 5V — use a voltage divider (1kΩ + 2kΩ) to step it down to 3.3V to protect the ESP32 GPIO.

### 13.2 Power Distribution

```
[External 5V PSU] ──── VCC → All Servo VCC pins (A, B, C, D)
                  └─── GND → All Servo GND + ESP32 GND

[USB or ESP32 VIN] ─── Powers ESP32 logic only
```

---

## 14. Development Roadmap

### Phase 1 — Proof of Concept (Hardware)
- [ ] Assemble inlet door mechanism (Servo A + frame).
- [ ] Assemble detection chamber (Servo B rotation + Servo C floor).
- [ ] Build coin dispenser tube (Servo D).
- [ ] Wire sensor and buttons to ESP32.
- [ ] Flash basic ESP32 firmware (servo test, sensor test, button test).

### Phase 2 — Object Detection
- [ ] Collect and annotate training images (bottles + cans).
- [ ] Train YOLOv8n model locally.
- [ ] Validate model performance (target mAP > 0.85).
- [ ] Integrate model into Python detection script.
- [ ] Test live webcam inference.

### Phase 3 — Backend
- [ ] Implement FastAPI server with state machine.
- [ ] Implement WebSocket handler for ESP32 communication.
- [ ] Implement WebSocket handler for frontend communication.
- [ ] Implement coin calculation logic.
- [ ] Test end-to-end state transitions with mock hardware.

### Phase 4 — Frontend
- [ ] Scaffold React app (Vite + Tailwind).
- [ ] Implement all UI screens.
- [ ] Connect WebSocket for real-time updates.
- [ ] Display live webcam feed.

### Phase 5 — Integration
- [ ] Connect ESP32 firmware to backend WebSocket.
- [ ] Full end-to-end test: insert bottle → detect → bin → count.
- [ ] Full end-to-end test: insert can → detect → bin → count.
- [ ] Test FINISH flow → coin dispensing.
- [ ] Test rejected item flow.

### Phase 6 — Refinement & Deployment
- [ ] Tune servo angles for physical build.
- [ ] Tune detection confidence threshold.
- [ ] Add enclosure / housing.
- [ ] Add coin hopper level warning.
- [ ] Final testing and demo.

---

## 15. Open Questions & Decisions

| # | Question                                          | Status      | Decision / Notes                              |
|---|---------------------------------------------------|-------------|-----------------------------------------------|
| 1 | Beam-break vs HC-SR04 vs IR for inlet detection? | **Recommended:** Laser beam-break sensor for reliability | Final hardware test needed |
| 2 | Chamber lighting for consistent AI detection?    | Open        | Consider adding an LED strip inside chamber  |
| 3 | What if WiFi drops between ESP32 and laptop?     | Open        | Add reconnect logic in firmware; show error on UI |
| 4 | Carry over leftover items to next session?        | **Decided: NO** | Each session is independent |
| 5 | Coin hopper capacity & refill alert?             | Open        | Admin screen can show low coin warning        |
| 6 | Multiple users simultaneously?                   | **Decided: NO** | One user session at a time                   |
| 7 | Data logging / analytics?                        | Optional    | Log sessions to a JSON file or SQLite DB      |
| 8 | Physical size of the machine?                    | Open        | Design around standard water bottle size (~8cm dia) |
| 9 | Backend auto-start on laptop boot?               | Optional    | Can use a `.bat` script or Task Scheduler     |
| 10| Security of admin panel?                         | **Decided: JWT** | Admin login at `/admin` — JWT protected routes |

---

## 16. Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- A laptop webcam (built-in or USB)

### Step 1 — Backend

```bat
# 1. Copy and configure environment variables
copy backend\.env.example backend\.env
# Edit backend\.env with your settings (camera index, admin password, etc.)

# 2. Install Python dependencies
cd backend
pip install -r requirements.txt

# 3. Start the backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or simply double-click **`start_backend.bat`** in the project root.

Backend is now running at:
- API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Camera feed: `http://localhost:8000/video_feed`

### Step 2 — Frontend

```bat
# In a new terminal
cd frontend
npm install
npm run dev
```

Or double-click **`start_frontend.bat`**.

Frontend is now running at `http://localhost:5173`.

### Step 3 — Access

| URL | Purpose |
|-----|---------|
| `http://localhost:5173/` | Public kiosk interface |
| `http://localhost:5173/admin` | Admin login |
| `http://localhost:5173/admin/dashboard` | Admin dashboard (after login) |

### Step 4 — Simulate without hardware

Use the simulation endpoints to test the full flow without an ESP32:

```bash
# Start a session
curl -X POST http://localhost:8000/simulate/start

# Simulate inserting an item (triggers camera capture + AI)
curl -X POST http://localhost:8000/simulate/item_detected

# Finish the session (dispenses coins)
curl -X POST http://localhost:8000/simulate/finish
```

### Admin Login (default credentials)

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `EcoSwap2024!` |

> **Change these in `backend/.env` before deploying.**

### Detection Notes

- If `backend/models/best.pt` **exists** → custom model is used (train via `ml/train.py`).
- If it **does not exist** → COCO pretrained `yolov8n.pt` is downloaded automatically.
  - Bottles (COCO class 39) are detected natively.
  - Cans are distinguished from bottles using an aspect-ratio heuristic (`h/w ≤ 1.8 → CAN`).
- For crumpled item detection, a **custom trained model is strongly recommended**.
  Collect 100–200 photos of crushed/crumpled bottles and cans under your detection
  chamber lighting and train using `ml/train.py`.

---

*End of EcoSwap Project Details — v1.1*
