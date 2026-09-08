import React from 'react';
import { Scenario } from '../types';
import { Play, Pause, RotateCcw, Zap, Brain } from 'lucide-react';

interface Props {
  currentScenario: Scenario;
  isSimulating: boolean;
  isAnalyzing: boolean;
  onScenarioChange: (s: Scenario) => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  onAnalyzeRisk: () => void;
}

const SCENARIOS: { id: Scenario; label: string; color: string; bg: string; desc: string }[] = [
  { id: 'NORMAL',   label: 'NORMAL',   color: 'text-white',  bg: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',   desc: 'All sensors nominal' },
  { id: 'WARNING',  label: 'WARNING',  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20', desc: 'Moderate deformation' },
  { id: 'CRITICAL', label: 'CRITICAL', color: 'text-red-400',    bg: 'bg-red-50 border-red-500/30 hover:bg-red-500/20',         desc: 'High subsidence risk' },
  { id: 'MONSOON',  label: 'MONSOON',  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',      desc: 'High moisture season' },
  { id: 'CUSTOM',   label: 'CUSTOM',   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20', desc: 'Manual input' },
];

export default function ScenarioButtons({
  currentScenario, isSimulating, isAnalyzing,
  onScenarioChange, onStartSimulation, onPauseSimulation,
  onResetSimulation, onAnalyzeRisk
}: Props) {
  return (
    <div className="mt-4 glass-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 mr-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Preset Scenarios</span>
        </div>

        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => onScenarioChange(s.id)}
            title={s.desc}
            className={`px-4 py-2 rounded-lg border text-xs font-bold tracking-widest transition-all ${s.bg} ${s.color} ${
              currentScenario === s.id ? 'ring-2 ring-current ring-offset-1 ring-offset-[#0a0e1a]' : ''
            }`}
          >
            {s.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Simulation controls */}
        <div className="flex items-center gap-2">
          {!isSimulating ? (
            <button onClick={onStartSimulation} className="btn-success flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Start Simulation
            </button>
          ) : (
            <button onClick={onPauseSimulation} className="btn-ghost flex items-center gap-1.5">
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}
          <button onClick={onResetSimulation} className="btn-ghost flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={onAnalyzeRisk}
            disabled={isAnalyzing}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</>
            ) : (
              <><Brain className="w-3.5 h-3.5" /> Analyze with AI</>
            )}
          </button>
        </div>
      </div>

      {/* Simulation note */}
      <p className="text-[10px] text-white/80 mt-2 font-mono">
        ℹ Simulation mode drifts sensor values gradually every 2s. AI is only called on explicit "Analyze" action — not every tick.
      </p>
    </div>
  );
}
