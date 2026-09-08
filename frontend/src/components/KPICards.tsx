import React from 'react';
import { SensorNode, RiskLevel } from '../types';
import { Cpu, CheckCircle, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { getNodeRiskScore } from '../services/riskEngine';

interface Props {
  nodes: SensorNode[];
  riskLevel: RiskLevel;
  riskScore: number;
  groundConfidence: number;
  systemConfidence: number;
}

export default function KPICards({ nodes, riskLevel, riskScore, groundConfidence, systemConfidence }: Props) {
  const safeNodes = nodes.filter(n => getNodeRiskScore(n) < 40).length;
  const criticalNodes = nodes.filter(n => getNodeRiskScore(n) >= 75).length;
  const watchWarnNodes = nodes.length - safeNodes - criticalNodes;

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'SAFE': return 'text-green-500';
      case 'WATCH': return 'text-yellow-500';
      case 'WARNING': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
      <div className="glass-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">Active Nodes</span>
          <Cpu className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-sky-400">{nodes.length}</span>
          <span className="text-sm text-white/80 ml-1">/ {nodes.length}</span>
        </div>
        <div className="flex gap-1 mt-2">
          {nodes.map((n, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${getNodeRiskScore(n) >= 75 ? 'bg-red-500' : getNodeRiskScore(n) >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`} />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">Safe Nodes</span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-green-500">{safeNodes}</span>
        </div>
        <div className="text-[10px] text-white/80 mt-2">of {nodes.length} total nodes</div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">Watch/Warn</span>
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-yellow-500">{watchWarnNodes}</span>
        </div>
        <div className="text-[10px] text-white/80 mt-2">watch / warning state</div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">Sys. Confidence</span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-cyan-400">{systemConfidence.toFixed(0)}<span className="text-lg">%</span></span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1 mt-3">
          <div className="bg-cyan-400 h-1 rounded-full transition-all duration-500" style={{ width: `${systemConfidence}%` }} />
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">Overall Risk</span>
          <AlertTriangle className={`w-4 h-4 ${getRiskColor(riskLevel)}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold ${getRiskColor(riskLevel)}`}>{riskScore.toFixed(0)}<span className="text-lg">%</span></span>
        </div>
        <div className={`text-xs font-extrabold tracking-wider mt-1 ${getRiskColor(riskLevel)}`}>{riskLevel}</div>
      </div>
    </div>
  );
}
