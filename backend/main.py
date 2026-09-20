"""
MineSense AI — FastAPI Backend
Smart India Hackathon 2026 Prototype

DISCLAIMER: This is a prototype system for demonstration purposes.
All sensor data is simulated through the Virtual Sensor Gateway.
The Mistral AI integration provides advisory risk assessment only.
This is not a scientifically validated subsidence prediction system.
"""

import os
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load from project root .env (parent of backend/)
_root_env = Path(__file__).parent.parent / ".env"
if _root_env.exists():
    load_dotenv(dotenv_path=_root_env)
else:
    load_dotenv()  # fallback: search upward

from routes.analysis import router as analysis_router
from routes.alerts import router as alerts_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MineSense AI Backend",
    description=(
        "AI-Enabled Real-Time Mine Subsidence Monitoring & Early Warning Platform — "
        "SIH2026 Prototype. All sensor data is simulated."
    ),
    version="1.0.0-sih2026",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow the Vite dev server to talk to this FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(alerts_router)


@app.get("/")
async def root():
    return {
        "project": "MineSense AI",
        "subtitle": "AI-Enabled Real-Time Mine Subsidence Monitoring & Early Warning Platform",
        "version": "1.0.0-sih2026",
        "event": "Smart India Hackathon 2026",
        "problem_statement": "SIH26025",
        "mode": "PROTOTYPE — SIMULATED SENSOR DATA",
        "disclaimer": (
            "This prototype uses simulated sensor data for demonstration. "
            "No physical hardware is connected. "
            "AI analysis is advisory only and requires field verification."
        ),
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting MineSense AI backend on port {port}")
    logger.info(f"Mistral model: {os.getenv('MISTRAL_MODEL', 'mistral-small-latest')}")
    mistral_key = os.getenv("MISTRAL_API_KEY", "")
    if not mistral_key or mistral_key == "your_key_here":
        logger.warning(
            "MISTRAL_API_KEY not set — AI analysis will use deterministic fallback. "
            "Set MISTRAL_API_KEY in backend/.env or root .env to enable Mistral integration."
        )
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
