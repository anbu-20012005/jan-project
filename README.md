# MineSense AI
## AI-Enabled Real-Time Mine Subsidence Monitoring & Early Warning Platform

**Smart India Hackathon 2026 — Problem Statement SIH26025**

> **PROTOTYPE NOTICE:** All sensor data in this prototype is **simulated** through the Virtual Sensor Gateway.
> No physical hardware is connected. This is a demonstration system for SIH2026.

---

## 🚀 Quick Start (2 Commands)

```bash
# Terminal 1 — Backend
cd backend
python main.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

Or use the Windows launcher: double-click **`start.bat`**

---

## Project Overview

MineSense AI is a prototype platform demonstrating how underground coal mines can be monitored for subsidence risk using:

- **Multi-sensor fusion** — Tilt, vibration, displacement, crack index, soil moisture
- **Dual Confidence Engine** — Ground Confidence (physical risk) + System Confidence (data quality)
- **Mistral AI** — Advisory risk assessment and explainable warnings
- **GIS-style mine map** — Zone-level risk visualization
- **Real-time simulation** — Gradual sensor drift with scenario presets

---

## Architecture

```
SIMULATED SENSORS (Virtual Gateway)
          ↓
   SENSOR VALIDATION
          ↓
  DUAL CONFIDENCE ENGINE
   ├─ Ground Confidence (physical risk from tilt, vibration, displacement, crack, moisture)
   └─ System Confidence (data quality from node health, RSSI, SNR, node agreement)
          ↓
  PROTOTYPE RISK FUSION
   Risk = GroundConf × (0.6 + 0.4 × SysConf/100)
          ↓
   MISTRAL AI ANALYSIS
   (advisory only — not a validated ML model)
          ↓
   EXPLAINABLE WARNING
          ↓
   GIS MINE DASHBOARD
```

---

## Features

| Feature | Status |
|---|---|
| Virtual Sensor Gateway (6 nodes) | ✅ Active |
| Manual sensor value editing | ✅ Active |
| Preset scenarios (NORMAL/WARNING/CRITICAL/MONSOON) | ✅ Active |
| Live simulation with drift | ✅ Active |
| Dual Confidence Engine | ✅ Active |
| Prototype Risk Fusion Formula | ✅ Active |
| GIS Mine Map (Zones A–E) | ✅ Active |
| Risk Heatmap | ✅ Active |
| Live Sensor Charts (Recharts) | ✅ Active |
| Mistral AI Advisory Analysis | ✅ Active |
| AI Fallback Mode | ✅ Active |
| Alert Center | ✅ Active |
| Node Health & Connectivity | ✅ Active |
| Community Ground Report | ✅ Active |
| System Architecture Diagram | ✅ Active |
| Graduated Alert Channels (Simulated) | ✅ Active |
| Demo Mode (Auto Scenario Sequence) | ✅ Active |

---

## Technology Stack

### Backend
- **Python 3.11+**
- **FastAPI** — REST API server
- **Mistral AI SDK** — AI advisory layer
- **python-dotenv** — Environment variable management
- **Uvicorn** — ASGI server

### Frontend
- **React 19 + TypeScript**
- **Vite 8** — Build tool / dev server
- **Tailwind CSS v4** — Styling
- **Recharts** — Time-series charts
- **Lucide React** — Icons
- **Axios** — HTTP client

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Mistral AI API key (get one at https://console.mistral.ai)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the **project root** (next to `backend/` and `frontend/`):

```env
MISTRAL_API_KEY=your_actual_mistral_api_key_here
MISTRAL_MODEL=mistral-small-latest
```

> ⚠️ **NEVER** commit this file. It is listed in `.gitignore`.

The `.env.example` file is provided as a template — do not put your real key there.

---

## How to Start Backend

```bash
cd backend
python main.py
```

The backend starts on **http://localhost:8000**

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

---

## How to Start Frontend

```bash
cd frontend
npm run dev
```

The dashboard opens at **http://localhost:5173**

The Vite dev server proxies all `/api` calls to the FastAPI backend — the Mistral API key **never** touches the browser.

---

## How to Use Demo Mode

1. Open the dashboard at http://localhost:5173
2. Click the **"RUN DEMO"** button in the top-right header
3. The system automatically:
   - Loads NORMAL scenario (all green nodes)
   - Starts simulation
   - Switches to WARNING (sensors increase)
   - Calls Mistral for analysis
   - Switches to CRITICAL (red zones, emergency banner)
   - Re-analyzes with Mistral
4. Total demo time: ~18 seconds

---

## Mistral AI Configuration

The system uses Mistral as a **decision-support advisory layer only**.

| Setting | Default |
|---|---|
| Model | `mistral-small-latest` |
| API key | From `MISTRAL_API_KEY` env var |
| Call trigger | Only on explicit "Analyze with Mistral AI" button click |
| Retry | Automatic JSON retry once |
| Fallback | Full deterministic fallback if API unavailable |

**Mistral is NOT called during simulation ticks** — only on explicit user action.

---

## Prototype Limitations

1. **No real hardware** — All sensor nodes are virtual. The Virtual Sensor Gateway simulates ESP32/MPU6050/displacement/crack/soil sensor readings.
2. **No trained ML model** — The Prototype Risk Fusion engine uses transparent heuristic formulas, not a trained classifier.
3. **AI advisory only** — Mistral LLM output is advisory and not a scientifically validated subsidence prediction model.
4. **No real alerts** — SMS, mobile, and local alarm channels are simulated visually.
5. **No database** — State is in-memory only; refreshing the page resets to NORMAL scenario.
6. **No authentication** — For prototype demonstration only; do not deploy publicly.

---

## Future Hardware Integration

In the production system, the Virtual Sensor Gateway will be replaced by:

```
ESP32 MCU (per node)
  ├── MPU6050 IMU → tilt + vibration
  ├── Linear displacement sensor
  ├── Crack propagation sensor
  └── Soil moisture sensor
         ↓
    LoRa 915MHz (mesh network)
         ↓
    Central LoRa Gateway
         ↓
    POST /api/sensor-data (same JSON structure)
         ↓
    MineSense AI Backend (unchanged)
```

The `SensorNode` data structure is already designed to accept real hardware data. The ESP32 gateway will POST the same JSON payload to:

```
POST /api/sensor-data
```

No backend changes are needed for hardware integration.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | System info |
| `/api/health` | GET | Health check + Mistral status |
| `/api/analyze-risk` | POST | Full AI analysis (calls Mistral) |
| `/api/compute-risk` | POST | Fast deterministic risk only |
| `/api/sensor-data` | POST | Future hardware data ingestion |
| `/docs` | GET | Interactive API documentation |

---

## Project Authors

Smart India Hackathon 2026 — Team MineSense AI
Problem Statement: SIH26025

> Built for demonstration purposes only. Not for operational mine safety use.
