"""
Analysis routes — MineSense AI Backend
"""

import logging
from fastapi import APIRouter, HTTPException
from models.sensor_models import AnalysisRequest, SensorDataIngestion
from services.risk_engine import (
    compute_ground_confidence,
    compute_system_confidence,
    compute_preliminary_risk_score,
    classify_risk_level,
    full_risk_assessment,
    get_affected_zones,
)
from services.mistral_service import analyze_risk_with_mistral

router = APIRouter(prefix="/api", tags=["analysis"])
logger = logging.getLogger(__name__)


@router.post("/analyze-risk")
async def analyze_risk(request: AnalysisRequest):
    """
    Main AI analysis endpoint.
    1. Validates sensor data
    2. Runs deterministic Prototype Risk Fusion engine
    3. Calls Mistral AI for advisory analysis
    4. Returns structured risk assessment
    """
    if not request.nodes:
        raise HTTPException(status_code=400, detail="At least one sensor node is required")

    nodes_dict = [n.model_dump() for n in request.nodes]

    # Use pre-computed confidence values if provided, otherwise compute here
    gc = request.ground_confidence if request.ground_confidence > 0 else compute_ground_confidence(request.nodes)
    sc = request.system_confidence if request.system_confidence > 0 else compute_system_confidence(request.nodes)
    prs = request.preliminary_risk_score if request.preliminary_risk_score > 0 else compute_preliminary_risk_score(gc, sc)

    logger.info(
        f"Risk analysis: gc={gc}% sc={sc}% prs={prs}% nodes={len(request.nodes)}"
    )

    result = await analyze_risk_with_mistral(
        nodes=nodes_dict,
        ground_confidence=gc,
        system_confidence=sc,
        preliminary_risk_score=prs,
        community_reports=request.community_reports or [],
    )

    # Always include engine metrics in response
    result["ground_confidence"] = gc
    result["system_confidence"] = sc
    result["preliminary_risk_score"] = prs
    result["node_count"] = len(request.nodes)
    result["affected_zones"] = result.get("affected_zones") or get_affected_zones(request.nodes)

    return result


@router.post("/compute-risk")
async def compute_risk_only(request: AnalysisRequest):
    """
    Fast deterministic-only risk computation — no Mistral call.
    Used for real-time chart updates during simulation.
    """
    if not request.nodes:
        raise HTTPException(status_code=400, detail="At least one sensor node is required")

    gc, sc, prs, rl = full_risk_assessment(request.nodes)
    zones = get_affected_zones(request.nodes)

    return {
        "ground_confidence": gc,
        "system_confidence": sc,
        "preliminary_risk_score": prs,
        "risk_level": rl,
        "affected_zones": zones,
        "node_count": len(request.nodes),
        "source": "deterministic",
    }


@router.post("/sensor-data")
async def ingest_sensor_data(payload: SensorDataIngestion):
    """
    Future hardware endpoint — ESP32 LoRa gateway will POST here.
    For prototype, this is simulated from the frontend.
    """
    gc, sc, prs, rl = full_risk_assessment(payload.nodes)
    return {
        "received": len(payload.nodes),
        "gateway_id": payload.gateway_id,
        "protocol": payload.protocol,
        "ground_confidence": gc,
        "system_confidence": sc,
        "preliminary_risk_score": prs,
        "risk_level": rl,
        "message": "Sensor data ingested (simulated gateway)"
    }


@router.get("/health")
async def health_check():
    """Backend health check — also reports Mistral connectivity."""
    import os
    from dotenv import load_dotenv
    load_dotenv()
    key = os.getenv("MISTRAL_API_KEY", "")
    mistral_status = "configured" if (key and key != "your_key_here") else "not_configured"
    return {
        "status": "online",
        "mistral_api": mistral_status,
        "model": os.getenv("MISTRAL_MODEL", "mistral-small-latest"),
        "mode": "prototype_simulation",
        "version": "1.0.0-sih2026"
    }
