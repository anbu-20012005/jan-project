import React from 'react';
import { RiskLevel } from '../types';
import { Smartphone, MessageSquare, Volume2, Monitor } from 'lucide-react';

interface Props {
  riskLevel: RiskLevel;
}

const CHANNELS = [
  { id: 'dashboard', label: 'Dashboard', icon: Monitor,      minLevel: 'SAFE' },
  { id: 'mobile',    label: 'Mobile Alert', icon: Smartphone, minLevel: 'WATCH' },
  { id: 'sms',       label: 'SMS Alert',    icon: MessageSquare, minLevel: 'WARNING' },
  { id: 'alarm',     label: 'Local Alarm',  icon: Volume2,    minLevel: 'CRITICAL' },
];

const LEVEL_ORDER: Record<RiskLevel, number> = { SAFE: 0, WATCH: 1, WARNING: 2, CRITICAL: 3 };

export default function AlertSimulator({ riskLevel }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        Graduated Alert Channels
        <span className="ml-auto text-[9px] font-mono text-amber-500/70 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">SIMULATED</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CHANNELS.map(ch => {
          const isActive = LEVEL_ORDER[riskLevel] >= LEVEL_ORDER[ch.minLevel as RiskLevel];
          const Icon = ch.icon;
          return (
            <div
              key={ch.id}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-500 ${
                isActive
                  ? 'border-orange-500/40 bg-orange-500/10'
                  : 'border-white/20 bg-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive ? 'bg-orange-500/20' : 'bg-slate-800'
              } ${isActive && ch.id === 'alarm' ? 'status-blink' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-white/80'}`} />
              </div>
              <div className="text-center">
                <div className={`text-[10px] font-bold ${isActive ? 'text-orange-300' : 'text-white/80'}`}>
                  {ch.label}
                </div>
                <div className={`text-[9px] font-mono ${isActive ? 'text-orange-500' : 'text-white/80'}`}>
                  {isActive ? '● ACTIVE' : '○ INACTIVE'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono text-white/80 mt-2 text-center">
        In production: real SMS, mobile push, and local hardware alarm.
        All simulated in this prototype.
      </p>
    </div>
  );
}
