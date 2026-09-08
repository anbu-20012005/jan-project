import React from 'react';
import { RiskLevel, AIAnalysisResult } from '../types';
import { riskColor } from '../services/riskEngine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  riskScore: number;
  riskLevel: RiskLevel;
  groundConfidence: number;
  systemConfidence: number;
  aiResult: AIAnalysisResult | null;
}

function GaugeArc({ score, color }: { score: number; color: string }) {
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = -220;
  const endAngle = 40;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (score / 100) * totalAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (start: number, end: number, r: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleX = cx + (radius - 10) * Math.cos(toRad(valueAngle));
  const needleY = cy + (radius - 10) * Math.sin(toRad(valueAngle));

  const zones = [
    { start: startAngle,                          end: startAngle + totalAngle * 0.30, color: '#22c55e' },
    { start: startAngle + totalAngle * 0.30, end: startAngle + totalAngle * 0.60, color: '#eab308' },
    { start: startAngle + totalAngle * 0.60, end: startAngle + totalAngle * 0.80, color: '#f97316' },
    { start: startAngle + totalAngle * 0.80, end: endAngle,                        color: '#ef4444' },
  ];

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[220px] mx-auto">
      {/* Background arc */}
      <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#1e2d45" strokeWidth="12" strokeLinecap="round" />
      {/* Zone arcs */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.start, z.end, radius)} fill="none" stroke={z.color} strokeWidth="12"
          strokeLinecap="round" opacity={0.25} />
      ))}
      {/* Value arc */}
      <path d={arcPath(startAngle, valueAngle, radius)} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" className="gauge-ring" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map(v => {
        const angle = startAngle + (v / 100) * totalAngle;
        const innerR = radius - 18;
        const outerR = radius - 10;
        const x1 = cx + innerR * Math.cos(toRad(angle));
        const y1 = cy + innerR * Math.sin(toRad(angle));
        const x2 = cx + outerR * Math.cos(toRad(angle));
        const y2 = cy + outerR * Math.sin(toRad(angle));
        return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2" />;
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={cx} cy={cy} r="5" fill={color} />
      {/* Center text */}
      <text x={cx} y={cy + 25} textAnchor="middle" fontSize="22" fontWeight="900"
        fontFamily="JetBrains Mono" fill={color}>{score.toFixed(0)}%</text>
      {/* Zone labels */}
      <text x="28" y="130" fontSize="7" fill="#22c55e" fontWeight="700">SAFE</text>
      <text x="155" y="130" fontSize="7" fill="#ef4444" fontWeight="700">CRIT</text>
    </svg>
  );
}

function ConfidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

export default function RiskGauge({ riskScore, riskLevel, groundConfidence, systemConfidence, aiResult }: Props) {
  const color = riskColor(riskLevel);
  const trend = aiResult?.trend;

  const TrendIcon = trend === 'INCREASING' ? TrendingUp :
                    trend === 'DECREASING' ? TrendingDown : Minus;
  const trendColor = trend === 'INCREASING' ? '#ef4444' :
                     trend === 'DECREASING' ? '#22c55e' : '#94a3b8';

  return (
    <div className="glass-card p-4 flex flex-col">
      <div className="section-header flex items-center gap-2">
        Prototype Risk Fusion
        <span className="ml-auto text-[9px] text-white/80 font-mono">Dual Confidence Engine</span>
      </div>

      <GaugeArc score={riskScore} color={color} />

      {/* Risk level badge */}
      <div className="text-center -mt-2 mb-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-widest"
          style={{ background: `${color}15`, border: `1.5px solid ${color}50`, color }}
        >
          {riskLevel === 'CRITICAL' && <span className="status-blink">⚠</span>}
          {riskLevel}
        </div>
      </div>

      {/* Confidence bars */}
      <div className="mb-4">
        <ConfidenceBar label="Ground Confidence" value={groundConfidence} color="#f97316" />
        <ConfidenceBar label="System Confidence" value={systemConfidence} color="#06b6d4" />
      </div>

      {/* Trend + predictions from AI */}
      {aiResult && (
        <div className="border-t border-[#1e2d45] pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">AI Trend</span>
            <div className="flex items-center gap-1.5" style={{ color: trendColor }}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-xs font-bold">{trend}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider">6-Hour</div>
              <div className="text-lg font-extrabold font-mono text-orange-400">{aiResult.predicted_risk_6h}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider">24-Hour</div>
              <div className="text-lg font-extrabold font-mono text-red-400">{aiResult.predicted_risk_24h}%</div>
            </div>
          </div>
          <div className="text-[10px] text-white/80 font-mono text-center">
            AI Confidence: {(aiResult.ai_confidence * 100).toFixed(0)}% · Source: {aiResult.source?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Formula disclosure */}
      <div className="mt-3 p-2 rounded-lg bg-white/10  border border-white/20">
        <p className="text-[9px] font-mono text-white/80 leading-relaxed">
          Prototype Risk Fusion Formula:<br/>
          <span className="text-white/80">Risk = GroundConf × (0.6 + 0.4 × SysConf/100)</span><br/>
          Not a trained ML model. Deterministic heuristic only.
        </p>
      </div>
    </div>
  );
}
