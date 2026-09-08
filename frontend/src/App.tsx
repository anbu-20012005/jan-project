import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SensorNode, RiskLevel, Scenario, AIAnalysisResult,
  RiskEngineResult, Alert, ChartPoint, CommunityReport, AppState
} from './types';
import { buildNodesForScenario, driftNode } from './services/scenarios';
import {
  computeGroundConfidence, computeSystemConfidence,
  computePreliminaryRiskScore, classifyRiskLevel, getNodeRiskScore
} from './services/riskEngine';
import { analyzeRisk, checkHealth, sendTelegramAlert } from './services/api';
import Header from './components/Header';
import KPICards from './components/KPICards';
import SensorPanel from './components/SensorPanel';
import ScenarioButtons from './components/ScenarioButtons';
import RiskGauge from './components/RiskGauge';
import MineMap from './components/MineMap';
import SensorCharts from './components/SensorCharts';
import AlertCenter from './components/AlertCenter';
import AIExplanationPanel from './components/AIExplanationPanel';
import EarlyWarningBanner from './components/EarlyWarningBanner';
import NodeHealth from './components/NodeHealth';
import AlertSimulator from './components/AlertSimulator';
import DemoRunner from './components/DemoRunner';

const MAX_CHART_POINTS = 60;

function makeAlert(riskLevel: RiskLevel, nodes: SensorNode[], score: number): Alert {
  const zone = nodes[0]?.zone || 'Zone A';
  const messages: Record<RiskLevel, string> = {
    CRITICAL: `CRITICAL: High displacement (${nodes[0]?.displacement.toFixed(1)}mm), elevated tilt (${nodes[0]?.tilt.toFixed(1)}°), and crack index (${nodes[0]?.crack_index.toFixed(0)}/100) detected. Immediate inspection required.`,
    WARNING: `WARNING: Increasing vibration (${nodes[0]?.vibration.toFixed(2)}g) and elevated soil moisture (${nodes[0]?.soil_moisture.toFixed(0)}%) detected across multiple nodes.`,
    WATCH: `WATCH: Sensor readings trending upward. Monitor closely for further deformation indicators.`,
    SAFE: `System operating within normal parameters. All sensor readings nominal.`,
  };
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    risk_level: riskLevel,
    zone,
    message: messages[riskLevel],
    risk_score: score,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

export default function App() {
  const [nodes, setNodes] = useState<SensorNode[]>(buildNodesForScenario('NORMAL'));
  const [scenario, setScenario] = useState<Scenario>('NORMAL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<RiskEngineResult | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [mistralStatus, setMistralStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRiskLevelRef = useRef<RiskLevel>('SAFE');

  // ── Compute local risk on node change ─────────────────────────────────────
  const computeLocalRisk = useCallback((currentNodes: SensorNode[]) => {
    const gc = computeGroundConfidence(currentNodes);
    const sc = computeSystemConfidence(currentNodes);
    const prs = computePreliminaryRiskScore(gc, sc);
    const rl = classifyRiskLevel(prs);

    const affected = currentNodes
      .filter(n => getNodeRiskScore(n) >= 60)
      .map(n => n.zone || n.node_id)
      .filter((z, i, arr) => arr.indexOf(z) === i);

    const result: RiskEngineResult = {
      ground_confidence: gc,
      system_confidence: sc,
      preliminary_risk_score: prs,
      risk_level: rl,
      affected_zones: affected,
      node_count: currentNodes.length,
      source: 'deterministic',
    };
    setRiskResult(result);

    // Add chart point
    const avgTilt = currentNodes.reduce((a, n) => a + n.tilt, 0) / currentNodes.length;
    const avgDisp = currentNodes.reduce((a, n) => a + n.displacement, 0) / currentNodes.length;
    const avgVib = currentNodes.reduce((a, n) => a + n.vibration, 0) / currentNodes.length;
    const avgMoist = currentNodes.reduce((a, n) => a + n.soil_moisture, 0) / currentNodes.length;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setChartHistory(prev => {
      const next = [...prev, {
        time: timeStr,
        tilt: +avgTilt.toFixed(2),
        displacement: +avgDisp.toFixed(2),
        vibration: +avgVib.toFixed(3),
        soil_moisture: +avgMoist.toFixed(1),
        risk_score: prs,
      }];
      return next.slice(-MAX_CHART_POINTS);
    });

    // Generate alerts on level change
    if (rl !== prevRiskLevelRef.current && (rl === 'WARNING' || rl === 'CRITICAL')) {
      const newAlert = makeAlert(rl, currentNodes, prs);
      setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      sendTelegramAlert({
        risk_level: newAlert.risk_level,
        message: newAlert.message,
        zone: newAlert.zone,
        risk_score: newAlert.risk_score
      }).catch(err => console.error("Failed to send telegram alert:", err));
    }
    prevRiskLevelRef.current = rl;
    setLastUpdated(new Date());

    return result;
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    computeLocalRisk(nodes);
    checkHealth()
      .then(h => setMistralStatus(h.mistral_api === 'configured' ? 'connected' : 'offline'))
      .catch(() => setMistralStatus('offline'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scenario change ────────────────────────────────────────────────────────
  const handleScenarioChange = useCallback((sc: Scenario) => {
    const newNodes = buildNodesForScenario(sc);
    setScenario(sc);
    setNodes(newNodes);
    setAiResult(null);
    computeLocalRisk(newNodes);
  }, [computeLocalRisk]);

  // ── Manual node edit ───────────────────────────────────────────────────────
  const handleNodeEdit = useCallback((nodeId: string, field: keyof SensorNode, value: number) => {
    setNodes(prev => {
      const updated = prev.map(n => n.node_id === nodeId ? { ...n, [field]: value } : n);
      computeLocalRisk(updated);
      setScenario('CUSTOM');
      return updated;
    });
  }, [computeLocalRisk]);

  // ── Simulation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSimulating) {
      simIntervalRef.current = setInterval(() => {
        setNodes(prev => {
          const drifted = prev.map(n => driftNode(n, scenario));
          computeLocalRisk(drifted);
          return drifted;
        });
      }, 2000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }
    return () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current); };
  }, [isSimulating, scenario, computeLocalRisk]);

  // ── Mistral AI analysis ────────────────────────────────────────────────────
  const handleAnalyzeRisk = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const gc = computeGroundConfidence(nodes);
      const sc = computeSystemConfidence(nodes);
      const prs = computePreliminaryRiskScore(gc, sc);
      const result = await analyzeRisk({
        nodes,
        ground_confidence: gc,
        system_confidence: sc,
        preliminary_risk_score: prs,
        community_reports: communityReports.map(r => ({
          location: r.location,
          report_type: r.report_type,
          description: r.description,
        })),
      });
      setAiResult(result);
      if (result.risk_level === 'WARNING' || result.risk_level === 'CRITICAL') {
        setAlerts(prev => [makeAlert(result.risk_level, nodes, result.risk_score), ...prev].slice(0, 20));
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, communityReports, isAnalyzing]);

  const handleAddCommunityReport = (report: Omit<CommunityReport, 'id' | 'timestamp'>) => {
    setCommunityReports(prev => [{
      ...report,
      id: `report-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...prev]);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const riskLevel = riskResult?.risk_level || 'SAFE';
  const riskScore = riskResult?.preliminary_risk_score || 0;
  const gc = riskResult?.ground_confidence || 0;
  const sc = riskResult?.system_confidence || 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] grid-bg">
      {/* Demo runner (headless) */}
      <DemoRunner
        isDemoRunning={isDemoRunning}
        onStop={() => setIsDemoRunning(false)}
        onScenarioChange={handleScenarioChange}
        onAnalyzeRisk={handleAnalyzeRisk}
        onSetSimulating={setIsSimulating}
      />

      <Header
        mistralStatus={mistralStatus}
        lastUpdated={lastUpdated}
        isSimulating={isSimulating}
        onStartDemo={() => setIsDemoRunning(true)}
      />

      <EarlyWarningBanner riskLevel={riskLevel} riskScore={riskScore} />

      <main className="px-4 pb-8 max-w-[1600px] mx-auto">
        {/* KPI row */}
        <KPICards
          nodes={nodes}
          riskLevel={riskLevel}
          riskScore={riskScore}
          groundConfidence={gc}
          systemConfidence={sc}
        />

        {/* Scenario + Simulation Controls */}
        <ScenarioButtons
          currentScenario={scenario}
          isSimulating={isSimulating}
          isAnalyzing={isAnalyzing}
          onScenarioChange={handleScenarioChange}
          onStartSimulation={() => setIsSimulating(true)}
          onPauseSimulation={() => setIsSimulating(false)}
          onResetSimulation={() => {
            setIsSimulating(false);
            handleScenarioChange(scenario);
          }}
          onAnalyzeRisk={handleAnalyzeRisk}
        />

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          
          {/* Top Left/Center: Map, Gauge, Charts */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MineMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
              <RiskGauge
                riskScore={riskScore}
                riskLevel={riskLevel}
                groundConfidence={gc}
                systemConfidence={sc}
                aiResult={aiResult}
              />
            </div>
            <SensorCharts history={chartHistory} />
          </div>

          {/* Top Right: AI & Alerts */}
          <div className="flex flex-col gap-4">
            <AIExplanationPanel
              aiResult={aiResult}
              isAnalyzing={isAnalyzing}
              riskLevel={riskLevel}
              riskScore={riskScore}
              gc={gc}
              sc={sc}
              onAnalyze={handleAnalyzeRisk}
            />
            <AlertCenter
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>

          {/* Bottom Row: Controls & Health */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SensorPanel
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onEditNode={handleNodeEdit}
            />
            <NodeHealth nodes={nodes} />
            <AlertSimulator riskLevel={riskLevel} />
          </div>
          
        </div>
      </main>
    </div>
  );
}
