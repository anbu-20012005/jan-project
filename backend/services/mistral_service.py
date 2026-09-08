"""
Mistral AI Service — MineSense AI Prototype

Connects to Mistral AI as the decision-support layer.
The API key is loaded exclusively from environment variables — never from frontend code.

Uses mistralai SDK v2.x (mistralai.client.Mistral)

DISCLAIMER: This prototype uses Mistral LLM as an advisory risk analysis layer.
It is not a scientifically validated subsidence prediction model.
Results are advisory and require field verification by qualified mine safety personnel.
"""

import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

SYSTEM_PROMPT = """You are the AI decision-support engine for MineSense AI, a prototype underground coal mine subsidence monitoring system developed for Smart India Hackathon 2026.

You analyze simulated multi-sensor observations from virtual sensor nodes deployed across mine zones.

Your responsibilities:
- Assess the severity of current ground conditions based on provided sensor readings
- Identify abnormal sensor patterns that could indicate subsidence risk
- Explain clearly why the risk level is at its current value
- Estimate near-term risk trend (INCREASING / STABLE / DECREASING)
- Provide an advisory warning appropriate to the risk level
- Recommend specific actions for mine safety personnel to inspect

Critical constraints you MUST follow:
- Do NOT claim certainty about subsidence events
- Do NOT invent or modify sensor measurements — use only the data provided
- Explicitly distinguish between simulated sensor readings and AI inference
- Your output is advisory only and must NOT replace qualified mine safety personnel
- This is a prototype system — state this clearly
- Do NOT claim this LLM is a scientifically validated subsidence prediction model

You MUST respond with ONLY valid JSON — no markdown, no explanation outside the JSON structure."""

ANALYSIS_USER_TEMPLATE = """Analyze the following simulated sensor data from MineSense AI prototype:

PRELIMINARY RISK ASSESSMENT (computed by deterministic Prototype Risk Fusion engine):
- Ground Confidence: {ground_confidence}%
- System Confidence: {system_confidence}%
- Preliminary Risk Score: {preliminary_risk_score}%
- Preliminary Risk Level: {risk_level}

SENSOR NODE READINGS (simulated — demonstration data):
{node_summary}

{community_context}

Based on this data, provide your advisory risk assessment as a JSON object with exactly this structure:
{{
  "risk_level": "SAFE|WATCH|WARNING|CRITICAL",
  "risk_score": <number 0-100>,
  "trend": "INCREASING|STABLE|DECREASING",
  "predicted_risk_6h": <number 0-100>,
  "predicted_risk_24h": <number 0-100>,
  "primary_factors": ["factor1", "factor2", "factor3"],
  "explanation": "2-3 sentence explanation of current conditions and risk assessment",
  "recommended_actions": ["action1", "action2", "action3"],
  "affected_zones": ["Zone A"],
  "ai_confidence": <float 0-1>
}}

Return ONLY the JSON object. No preamble, no markdown code blocks."""

STRICT_JSON_PROMPT = """You previously returned an invalid JSON response.
Return ONLY a valid JSON object matching this exact schema — no other text:
{
  "risk_level": string,
  "risk_score": number,
  "trend": string,
  "predicted_risk_6h": number,
  "predicted_risk_24h": number,
  "primary_factors": [string],
  "explanation": string,
  "recommended_actions": [string],
  "affected_zones": [string],
  "ai_confidence": number
}"""


def _format_node_summary(nodes: list, community_reports: list) -> tuple:
    lines = []
    for node in nodes:
        lines.append(
            f"Node {node['node_id']} ({node.get('zone', 'Unknown Zone')}):\n"
            f"  Tilt: {node['tilt']}°  Vibration: {node['vibration']}g  "
            f"Displacement: {node['displacement']}mm  Crack Index: {node['crack_index']}/100\n"
            f"  Soil Moisture: {node['soil_moisture']}%  RSSI: {node['rssi']}dBm  "
            f"SNR: {node['snr']}dB  Node Health: {node['node_health']}%"
        )
    community_ctx = ""
    if community_reports:
        community_ctx = "\nCOMMUNITY GROUND REPORTS (human observations):\n"
        for r in community_reports:
            community_ctx += f"  [{r.get('report_type', 'Report')}] at {r.get('location', 'Unknown')}: {r.get('description', '')}\n"
    return "\n".join(lines), community_ctx


def _build_fallback(preliminary_risk_score: float, risk_level: str, reason: str) -> dict:
    """Returns a safe, deterministic fallback when Mistral is unavailable."""
    trend_map = {
        "SAFE": "STABLE", "WATCH": "STABLE",
        "WARNING": "INCREASING", "CRITICAL": "INCREASING"
    }
    actions_map = {
        "SAFE": [
            "Continue routine monitoring",
            "Verify sensor calibration weekly",
            "Maintain communication infrastructure"
        ],
        "WATCH": [
            "Increase monitoring frequency to 15-minute intervals",
            "Notify shift supervisor of elevated readings",
            "Prepare evacuation checklist"
        ],
        "WARNING": [
            "Alert mine safety officer immediately",
            "Restrict personnel access to affected zones",
            "Deploy additional physical inspection team",
            "Activate local alarm systems"
        ],
        "CRITICAL": [
            "IMMEDIATE evacuation of affected zones",
            "Notify mine management and safety authority",
            "Activate full emergency response protocol",
            "Block all access to high-risk zones",
            "Contact DGMS emergency line"
        ]
    }
    return {
        "risk_level": risk_level,
        "risk_score": preliminary_risk_score,
        "trend": trend_map.get(risk_level, "STABLE"),
        "predicted_risk_6h": min(preliminary_risk_score + 5, 100),
        "predicted_risk_24h": min(preliminary_risk_score + 8, 100),
        "primary_factors": [
            "High displacement detected across multiple nodes",
            "Elevated tilt indicating ground deformation",
            "Increased crack index suggesting structural stress"
        ],
        "explanation": (
            f"PROTOTYPE FALLBACK ANALYSIS — AI API unavailable ({reason}). "
            f"Deterministic risk engine reports {risk_level} conditions with a preliminary score of {preliminary_risk_score:.1f}%. "
            "Field verification by qualified mine safety personnel is required."
        ),
        "recommended_actions": actions_map.get(risk_level, actions_map["WATCH"]),
        "affected_zones": [],
        "ai_confidence": 0.0,
        "source": "fallback",
        "disclaimer": (
            "AI API unavailable — prototype fallback analysis active. "
            "All sensor data is simulated. This is not a scientifically validated subsidence prediction."
        )
    }


def _strip_code_fences(content: str) -> str:
    """Remove markdown code fences if Mistral wraps JSON in them."""
    content = content.strip()
    if content.startswith("```"):
        parts = content.split("```")
        if len(parts) >= 3:
            inner = parts[1]
            if inner.startswith("json"):
                inner = inner[4:]
            return inner.strip()
        # Fallback: remove first ``` block opener
        content = content.replace("```json", "").replace("```", "").strip()
    return content


async def analyze_risk_with_mistral(
    nodes: list,
    ground_confidence: float,
    system_confidence: float,
    preliminary_risk_score: float,
    community_reports: Optional[list] = None
) -> dict:
    """
    Calls Mistral AI with structured sensor data and returns an advisory risk assessment.
    Falls back gracefully if the API is unavailable or returns invalid data.
    """
    from services.risk_engine import classify_risk_level
    risk_level = classify_risk_level(preliminary_risk_score)

    if not MISTRAL_API_KEY or MISTRAL_API_KEY in ("your_key_here", ""):
        logger.warning("MISTRAL_API_KEY not configured — using fallback analysis")
        return _build_fallback(preliminary_risk_score, risk_level, "API key not configured")

    node_summary, community_ctx = _format_node_summary(
        [n if isinstance(n, dict) else n.model_dump() for n in nodes],
        community_reports or []
    )

    user_message = ANALYSIS_USER_TEMPLATE.format(
        ground_confidence=round(ground_confidence, 1),
        system_confidence=round(system_confidence, 1),
        preliminary_risk_score=round(preliminary_risk_score, 1),
        risk_level=risk_level,
        node_summary=node_summary,
        community_context=community_ctx,
    )

    try:
        from mistralai.client import Mistral
        client = Mistral(api_key=MISTRAL_API_KEY)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ]

        # First attempt
        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )

        content = _strip_code_fences(response.choices[0].message.content)

        try:
            result = json.loads(content)
            result["source"] = "mistral"
            result["disclaimer"] = (
                "AI-assisted prototype risk assessment. All sensor data is simulated. "
                "This is advisory only and not a scientifically validated subsidence prediction. "
                "Field verification by qualified mine safety personnel is required."
            )
            return result
        except (json.JSONDecodeError, Exception):
            logger.warning("Mistral returned invalid JSON on first attempt — retrying")

            # Second attempt with strict JSON enforcement
            retry_messages = messages + [
                {"role": "assistant", "content": content},
                {"role": "user", "content": STRICT_JSON_PROMPT},
            ]
            retry_response = client.chat.complete(
                model=MISTRAL_MODEL,
                messages=retry_messages,
                temperature=0.1,
                max_tokens=1024,
            )
            retry_content = _strip_code_fences(retry_response.choices[0].message.content)
            try:
                result = json.loads(retry_content)
                result["source"] = "mistral"
                result["disclaimer"] = (
                    "AI-assisted prototype risk assessment. All sensor data is simulated. "
                    "Field verification required."
                )
                return result
            except (json.JSONDecodeError, Exception) as e:
                logger.error(f"Mistral retry also failed JSON parse: {e}")
                return _build_fallback(preliminary_risk_score, risk_level, "Invalid API response format")

    except Exception as e:
        logger.error(f"Mistral API error: {e}")
        error_type = type(e).__name__
        return _build_fallback(preliminary_risk_score, risk_level, f"API error: {error_type}")
