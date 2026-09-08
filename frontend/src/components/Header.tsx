import React from 'react';
import { Activity, Cpu, Wifi, Clock, Play, Shield } from 'lucide-react';

interface Props {
  mistralStatus: 'connected' | 'offline' | 'checking';
  lastUpdated: Date;
  isSimulating: boolean;
  onStartDemo: () => void;
}

export default function Header({ mistralStatus, lastUpdated, isSimulating, onStartDemo }: Props) {
  const timeStr = lastUpdated.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2d45] bg-[#0a0e1a]/95 backdrop-blur-xl">
      {/* Prototype badge */}
      <div className="prototype-badge px-4 py-1.5 flex items-center justify-center gap-3 text-xs font-mono font-bold tracking-widest text-amber-500">
        <span className="status-blink">⚠</span>
        PROTOTYPE · SIMULATED SENSOR DATA · NOT FOR OPERATIONAL USE · SIH2026 DEMONSTRATION
        <span className="status-blink">⚠</span>
      </div>

      <div className="px-4 py-3 flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Logo / title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center glow-blue">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {isSimulating && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full status-blink border-2 border-[#0a0e1a]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">MineSense AI</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">v1.0</span>
            </div>
            <p className="text-[11px] text-white/80 leading-tight">AI-Enabled Real-Time Mine Subsidence Monitoring & Early Warning Platform</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Time */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20/40">
            <Clock className="w-3.5 h-3.5 text-white/80" />
            <span className="text-xs font-mono text-white/80">{timeStr}</span>
          </div>

          {/* Demo button */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/80 border border-purple-500/40 hover:bg-purple-600 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">RUN DEMO</span>
          </button>

        </div>
      </div>
    </header>
  );
}
