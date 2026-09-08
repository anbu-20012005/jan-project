// ── Sensor & Node types ────────────────────────────────────────────────────

export interface SensorNode {
  node_id: string;
  timestamp: string;
  tilt: number;          // degrees
  vibration: number;     // g
  displacement: number;  // mm
  crack_index: number;   // 0–100
  soil_moisture: number; // %
  rssi: number;          // dBm
  snr: number;           // dB
  node_health: number;   // %
  latitude: number;
  longitude: number;
  zone?: string;
  community_report?: string;
}

export type RiskLevel = 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type Trend = 'INCREASING' | 'STABLE' | 'DECREASING';
export type Scenario = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'MONSOON' | 'CUSTOM';

// ── AI Analysis result ─────────────────────────────────────────────────────

export interface AIAnalysisResult {
  risk_level: RiskLevel;
  risk_score: number;
  trend: Trend;
  predicted_risk_6h: number;
  predicted_risk_24h: number;
  primary_factors: string[];
  explanation: string;
  recommended_actions: string[];
  affected_zones: string[];
  ai_confidence: number;
  ground_confidence: number;
  system_confidence: number;
  preliminary_risk_score: number;
  node_count: number;
  source: 'mistral' | 'fallback' | 'deterministic';
  disclaimer: string;
}

// ── Risk engine result (fast/local) ────────────────────────────────────────

export interface RiskEngineResult {
  ground_confidence: number;
  system_confidence: number;
  preliminary_risk_score: number;
  risk_level: RiskLevel;
  affected_zones: string[];
  node_count: number;
  source: 'deterministic';
}

// ── Community report ────────────────────────────────────────────────────────

export interface CommunityReport {
  id: string;
  location: string;
  report_type: 'Visible crack' | 'Ground settlement' | 'Vibration' | 'Water accumulation' | 'Other';
  description: string;
  timestamp: string;
}

// ── Alert ───────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  risk_level: RiskLevel;
  zone: string;
  message: string;
  risk_score: number;
  timestamp: string;
  acknowledged: boolean;
}

// ── Chart data points ────────────────────────────────────────────────────────

export interface ChartPoint {
  time: string;
  tilt: number;
  displacement: number;
  vibration: number;
  soil_moisture: number;
  risk_score: number;
}

// ── App state ────────────────────────────────────────────────────────────────

export interface AppState {
  nodes: SensorNode[];
  scenario: Scenario;
  isSimulating: boolean;
  selectedNodeId: string | null;
  riskResult: RiskEngineResult | null;
  aiResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  chartHistory: ChartPoint[];
  alerts: Alert[];
  communityReports: CommunityReport[];
  mistralStatus: 'connected' | 'offline' | 'checking';
  lastUpdated: Date;
  isDemoRunning: boolean;
  demoStep: number;
}

// ── Zone ──────────────────────────────────────────────────────────────────────

export interface MineZone {
  id: string;
  name: string;
  nodes: string[];  // node_ids
  riskLevel: RiskLevel;
  riskScore: number;
  x: number;  // SVG x %
  y: number;  // SVG y %
  width: number;
  height: number;
}
