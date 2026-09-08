from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SensorNode(BaseModel):
    node_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    tilt: float = Field(..., description="Tilt angle in degrees", ge=0, le=90)
    vibration: float = Field(..., description="Vibration in g", ge=0, le=10)
    displacement: float = Field(..., description="Displacement in mm", ge=0)
    crack_index: float = Field(..., description="Crack index 0-100", ge=0, le=100)
    soil_moisture: float = Field(..., description="Soil moisture percentage", ge=0, le=100)
    rssi: float = Field(..., description="RSSI in dBm", le=0)
    snr: float = Field(..., description="SNR in dB")
    node_health: float = Field(..., description="Node health 0-100%", ge=0, le=100)
    latitude: float
    longitude: float
    zone: Optional[str] = None
    community_report: Optional[str] = None


class AnalysisRequest(BaseModel):
    nodes: List[SensorNode]
    ground_confidence: float
    system_confidence: float
    preliminary_risk_score: float
    community_reports: Optional[List[dict]] = []


class RiskAnalysisResponse(BaseModel):
    risk_level: str
    risk_score: float
    trend: str
    predicted_risk_6h: float
    predicted_risk_24h: float
    primary_factors: List[str]
    explanation: str
    recommended_actions: List[str]
    affected_zones: List[str]
    ai_confidence: float
    source: str = "mistral"
    disclaimer: str = (
        "This is an AI-assisted prototype risk assessment for demonstration purposes. "
        "All sensor data is simulated. Results require field verification by qualified mine safety personnel."
    )


class CommunityReport(BaseModel):
    location: str
    report_type: str
    description: str
    timestamp: Optional[str] = None


class SensorDataIngestion(BaseModel):
    """
    Future hardware interface — ESP32 gateway will POST to /api/sensor-data
    using this same structure. The prototype populates this from frontend simulation.
    """
    nodes: List[SensorNode]
    gateway_id: Optional[str] = "GATEWAY-SIM-01"
    protocol: Optional[str] = "SIMULATED"
