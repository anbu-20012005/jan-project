"""
Dual Confidence Risk Engine — Prototype Risk Fusion

This is a deterministic heuristic engine designed for the SIH2026 prototype.
It is NOT a trained ML model. It demonstrates the conceptual "Dual Confidence Engine"
architecture that will use real sensor calibration data in the production system.

Ground Confidence: measures physical risk from sensor readings.
System Confidence: measures data quality / network reliability.
Final Risk Score: combines physical risk weighted by system confidence.
"""

from typing import List, Tuple
import math
from models.sensor_models import SensorNode


# ── Thresholds (tuned for prototype demonstration) ──────────────────────────
TILT_MAX = 15.0          # degrees — beyond this is high risk
VIBRATION_MAX = 2.0      # g
DISPLACEMENT_MAX = 20.0  # mm
CRACK_MAX = 100.0
MOISTURE_HIGH = 80.0     # %
MOISTURE_LOW = 20.0
RSSI_MIN = -100.0        # dBm — below this = bad signal
RSSI_GOOD = -70.0
SNR_MIN = 0.0
SNR_GOOD = 8.0


def _normalize(value: float, low: float, high: float) -> float:
    """Clamp and normalize value to [0, 1]."""
    return max(0.0, min(1.0, (value - low) / (high - low)))


def _tilt_risk(tilt: float) -> float:
    return _normalize(tilt, 0.0, TILT_MAX)


def _vibration_risk(vibration: float) -> float:
    return _normalize(vibration, 0.0, VIBRATION_MAX)


def _displacement_risk(displacement: float) -> float:
    return _normalize(displacement, 0.0, DISPLACEMENT_MAX)


def _crack_risk(crack: float) -> float:
    return _normalize(crack, 0.0, CRACK_MAX)


def _moisture_risk(moisture: float) -> float:
    """
    Risk increases when moisture is very low (dry cracking) OR very high (saturation).
    Peak risk at 90% (saturated ground).
    """
    if moisture >= MOISTURE_HIGH:
        return _normalize(moisture, MOISTURE_HIGH, 100.0) * 0.5 + 0.5
    elif moisture < MOISTURE_LOW:
        return 0.1  # slightly elevated for very dry
    else:
        return _normalize(moisture, MOISTURE_LOW, MOISTURE_HIGH) * 0.3


def _rssi_quality(rssi: float) -> float:
    """Returns signal quality [0, 1], 1 = excellent."""
    return max(0.0, min(1.0, (rssi - RSSI_MIN) / (RSSI_GOOD - RSSI_MIN)))


def _snr_quality(snr: float) -> float:
    return max(0.0, min(1.0, (snr - SNR_MIN) / (SNR_GOOD - SNR_MIN)))


def _node_agreement_factor(nodes: List[SensorNode]) -> float:
    """
    Measures how much neighboring nodes agree on the physical risk.
    High agreement → higher system confidence.
    Variance in tilt across nodes indicates whether the pattern is localized or widespread.
    """
    if len(nodes) <= 1:
        return 0.5
    tilts = [n.tilt for n in nodes]
    displacements = [n.displacement for n in nodes]
    avg_tilt = sum(tilts) / len(tilts)
    avg_disp = sum(displacements) / len(displacements)
    tilt_variance = sum((t - avg_tilt) ** 2 for t in tilts) / len(tilts)
    disp_variance = sum((d - avg_disp) ** 2 for d in displacements) / len(displacements)
    # Lower variance = higher agreement
    tilt_agreement = max(0.0, 1.0 - min(1.0, tilt_variance / 25.0))
    disp_agreement = max(0.0, 1.0 - min(1.0, disp_variance / 50.0))
    return (tilt_agreement * 0.6 + disp_agreement * 0.4)


def compute_ground_confidence(nodes: List[SensorNode]) -> float:
    """
    Prototype Ground Confidence: how physically dangerous the ground conditions look.
    Weighted combination of per-node physical sensor risks.
    Returns value 0–100.
    """
    if not nodes:
        return 0.0

    per_node_risks = []
    for node in nodes:
        tr = _tilt_risk(node.tilt)
        vr = _vibration_risk(node.vibration)
        dr = _displacement_risk(node.displacement)
        cr = _crack_risk(node.crack_index)
        mr = _moisture_risk(node.soil_moisture)

        # Weighted average — displacement and tilt are primary indicators
        node_risk = (
            tr * 0.30 +
            vr * 0.20 +
            dr * 0.25 +
            cr * 0.15 +
            mr * 0.10
        )
        per_node_risks.append(node_risk)

    # Use 80th-percentile risk (most at-risk node dominates, not outliers)
    sorted_risks = sorted(per_node_risks, reverse=True)
    top_count = max(1, math.ceil(len(sorted_risks) * 0.4))
    dominant_risk = sum(sorted_risks[:top_count]) / top_count

    return round(dominant_risk * 100, 1)


def compute_system_confidence(nodes: List[SensorNode]) -> float:
    """
    Prototype System Confidence: how reliable the data is.
    Based on node health, RSSI, SNR, and cross-node agreement.
    Returns value 0–100.
    """
    if not nodes:
        return 0.0

    per_node_quality = []
    for node in nodes:
        health_q = node.node_health / 100.0
        rssi_q = _rssi_quality(node.rssi)
        snr_q = _snr_quality(node.snr)
        node_quality = (health_q * 0.5 + rssi_q * 0.25 + snr_q * 0.25)
        per_node_quality.append(node_quality)

    avg_quality = sum(per_node_quality) / len(per_node_quality)
    agreement = _node_agreement_factor(nodes)

    # System confidence = average node quality × agreement factor
    system_conf = avg_quality * 0.7 + agreement * 0.3
    return round(system_conf * 100, 1)


def compute_preliminary_risk_score(
    ground_confidence: float,
    system_confidence: float
) -> float:
    """
    Prototype Risk Fusion Formula:

    Final Risk = Ground_Confidence × (0.6 + 0.4 × System_Confidence/100)

    Rationale:
      - Even with poor system confidence we still show 60% of the ground risk
        (fail-safe: low quality data doesn't suppress a real emergency).
      - High system confidence boosts the final score, providing the dual-confidence
        reinforcement described in the SIH proposal.

    Returns value 0–100.
    """
    quality_weight = 0.6 + 0.4 * (system_confidence / 100.0)
    risk = ground_confidence * quality_weight
    return round(min(risk, 100.0), 1)


def classify_risk_level(score: float) -> str:
    if score < 30:
        return "SAFE"
    elif score < 60:
        return "WATCH"
    elif score < 80:
        return "WARNING"
    else:
        return "CRITICAL"


def get_affected_zones(nodes: List[SensorNode], threshold: float = 60.0) -> List[str]:
    """Return zones where risk is elevated."""
    zone_risks: dict = {}
    for node in nodes:
        zone = node.zone or f"Zone-{node.node_id[-2:]}"
        node_risk = (
            _tilt_risk(node.tilt) * 0.30 +
            _vibration_risk(node.vibration) * 0.20 +
            _displacement_risk(node.displacement) * 0.25 +
            _crack_risk(node.crack_index) * 0.15 +
            _moisture_risk(node.soil_moisture) * 0.10
        ) * 100
        if zone not in zone_risks or node_risk > zone_risks[zone]:
            zone_risks[zone] = node_risk
    return [z for z, r in zone_risks.items() if r >= threshold]


def full_risk_assessment(nodes: List[SensorNode]) -> Tuple[float, float, float, str]:
    """
    Runs the full Prototype Risk Fusion pipeline.
    Returns: (ground_confidence, system_confidence, preliminary_risk_score, risk_level)
    """
    gc = compute_ground_confidence(nodes)
    sc = compute_system_confidence(nodes)
    prs = compute_preliminary_risk_score(gc, sc)
    rl = classify_risk_level(prs)
    return gc, sc, prs, rl
