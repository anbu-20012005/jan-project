import React, { useEffect, useRef } from 'react';
import { Scenario } from '../types';

interface Props {
  isDemoRunning: boolean;
  onStop: () => void;
  onScenarioChange: (s: Scenario) => void;
  onAnalyzeRisk: () => void;
  onSetSimulating: (v: boolean) => void;
}

const DEMO_STEPS: Array<{
  delay: number;
  action: (props: Omit<Props, 'isDemoRunning'>) => void;
  description: string;
}> = [
  { delay: 0,     description: 'Starting in NORMAL state', action: p => p.onScenarioChange('NORMAL') },
  { delay: 1500,  description: 'Starting simulation',      action: p => p.onSetSimulating(true) },
  { delay: 4000,  description: 'Switching to WARNING',     action: p => p.onScenarioChange('WARNING') },
  { delay: 6000,  description: 'Analyzing with AI',  action: p => p.onAnalyzeRisk() },
  { delay: 10000, description: 'Switching to CRITICAL',   action: p => p.onScenarioChange('CRITICAL') },
  { delay: 13000, description: 'Re-analyzing Critical',   action: p => p.onAnalyzeRisk() },
  { delay: 18000, description: 'Demo complete',           action: p => p.onStop() },
];

export default function DemoRunner({
  isDemoRunning, onStop, onScenarioChange, onAnalyzeRisk, onSetSimulating
}: Props) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isDemoRunning) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }

    // Execute demo sequence
    DEMO_STEPS.forEach(step => {
      const timer = setTimeout(
        () => step.action({ onStop, onScenarioChange, onAnalyzeRisk, onSetSimulating }),
        step.delay
      );
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isDemoRunning]);

  if (!isDemoRunning) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 demo-banner">
      <div className="px-6 py-3 rounded-2xl bg-purple-900/90 border border-purple-500/60 backdrop-blur-xl flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-purple-400 status-blink" />
        <div>
          <div className="text-sm font-extrabold text-purple-200 tracking-wider">DEMO MODE RUNNING</div>
          <div className="text-xs text-purple-400">Automated scenario sequence in progress — for judge demonstration</div>
        </div>
        <button onClick={onStop} className="ml-4 px-3 py-1 rounded-lg bg-purple-800 text-purple-300 text-xs font-bold hover:bg-purple-700 transition-colors">
          Stop Demo
        </button>
      </div>
    </div>
  );
}
