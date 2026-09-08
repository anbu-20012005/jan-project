/**
 * Frontend risk engine — mirrors the backend heuristics so the UI
 * can show live risk scores without waiting for an API call.
 * The authoritative calculation always comes from the backend.
 */

import { SensorNode, RiskLevel } from '../types';

const TILT_MAX = 15;
const VIBRATION_MAX = 2;
const DISPLACEMENT_MAX = 20;
const CRACK_MAX = 100;
const RSSI_MIN = -100;
const RSSI_GOOD = -70;
const SNR_MIN = 0;
const SNR_GOOD = 8;

const clamp01 = (v: number, lo: number, hi: number) =>
  Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

function moistureRisk(m: number) {
  if (m >= 80) return clamp01(m, 80, 100) * 0.5 + 0.5;
  if (m < 20) return 0.1;
  return clamp01(m, 20, 80) * 0.3;
}

export function computeGroundConfidence(nodes: SensorNode[]): number {
  if (!nodes.length) return 0;
  const risks = nodes.map(n => (
    clamp01(n.tilt, 0, TILT_MAX) * 0.30 +
    clamp01(n.vibration, 0, VIBRATION_MAX) * 0.20 +
    clamp01(n.displacement, 0, DISPLACEMENT_MAX) * 0.25 +
    clamp01(n.crack_index, 0, CRACK_MAX) * 0.15 +
    moistureRisk(n.soil_moisture) * 0.10
  ));
  const sorted = [...risks].sort((a, b) => b - a);
  const topCount = Math.max(1, Math.ceil(sorted.length * 0.4));
  const dominant = sorted.slice(0, topCount).reduce((a, b) => a + b, 0) / topCount;
  return Math.round(dominant * 100 * 10) / 10;
}

export function computeSystemConfidence(nodes: SensorNode[]): number {
  if (!nodes.length) return 0;
  const qualities = nodes.map(n => (
    (n.node_health / 100) * 0.5 +
    clamp01(n.rssi, RSSI_MIN, RSSI_GOOD) * 0.25 +
    clamp01(n.snr, SNR_MIN, SNR_GOOD) * 0.25
  ));
  const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length;
  const tilts = nodes.map(n => n.tilt);
  const avgTilt = tilts.reduce((a, b) => a + b, 0) / tilts.length;
  const variance = tilts.reduce((a, t) => a + (t - avgTilt) ** 2, 0) / tilts.length;
  const agreement = Math.max(0, 1 - Math.min(1, variance / 25));
  return Math.round((avg * 0.7 + agreement * 0.3) * 100 * 10) / 10;
}

export function computePreliminaryRiskScore(gc: number, sc: number): number {
  const weight = 0.6 + 0.4 * (sc / 100);
  return Math.round(Math.min(gc * weight, 100) * 10) / 10;
}

export function classifyRiskLevel(score: number): RiskLevel {
  if (score < 30) return 'SAFE';
  if (score < 60) return 'WATCH';
  if (score < 80) return 'WARNING';
  return 'CRITICAL';
}

export function getNodeRiskScore(node: SensorNode): number {
  const raw =
    clamp01(node.tilt, 0, TILT_MAX) * 0.30 +
    clamp01(node.vibration, 0, VIBRATION_MAX) * 0.20 +
    clamp01(node.displacement, 0, DISPLACEMENT_MAX) * 0.25 +
    clamp01(node.crack_index, 0, CRACK_MAX) * 0.15 +
    moistureRisk(node.soil_moisture) * 0.10;
  return Math.round(raw * 100);
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'SAFE':     return '#22c55e';
    case 'WATCH':    return '#eab308';
    case 'WARNING':  return '#f97316';
    case 'CRITICAL': return '#ef4444';
  }
}

export function riskBgClass(level: RiskLevel): string {
  switch (level) {
    case 'SAFE':     return 'bg-risk-safe';
    case 'WATCH':    return 'bg-risk-watch';
    case 'WARNING':  return 'bg-risk-warning';
    case 'CRITICAL': return 'bg-risk-critical';
  }
}
