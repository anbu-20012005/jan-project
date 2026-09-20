/**
 * API service — all requests proxy through Vite to FastAPI.
 * The Mistral API key NEVER leaves the backend.
 */

import axios from 'axios';
import { SensorNode, AIAnalysisResult, RiskEngineResult, CommunityReport } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000,  // Mistral can take ~15s
});

export interface AnalysisRequest {
  nodes: SensorNode[];
  ground_confidence: number;
  system_confidence: number;
  preliminary_risk_score: number;
  community_reports?: { location: string; report_type: string; description: string }[];
}

export async function analyzeRisk(req: AnalysisRequest): Promise<AIAnalysisResult> {
  const response = await api.post<AIAnalysisResult>('/analyze-risk', req);
  return response.data;
}

export async function computeRiskOnly(req: Omit<AnalysisRequest, 'community_reports'>): Promise<RiskEngineResult> {
  const response = await api.post<RiskEngineResult>('/compute-risk', req);
  return response.data;
}

export interface HealthResponse {
  status: string;
  mistral_api: 'configured' | 'not_configured';
  model: string;
  mode: string;
  version: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
}

export interface TelegramAlertRequest {
  risk_level: string;
  message: string;
  zone: string;
  risk_score: number;
}

export async function sendTelegramAlert(req: TelegramAlertRequest): Promise<void> {
  await api.post('/alerts/telegram', req);
}
