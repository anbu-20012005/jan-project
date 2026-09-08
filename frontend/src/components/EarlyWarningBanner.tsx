import React from 'react';
import { RiskLevel } from '../types';
import { AlertTriangle, CheckCircle, Eye, Siren } from 'lucide-react';

interface Props {
  riskLevel: RiskLevel;
  riskScore: number;
}

const BANNERS: Record<RiskLevel, {
  icon: React.ReactNode;
  text: string;
  sub: string;
  bg: string;
  border: string;
  textColor: string;
  pulse: boolean;
}> = {
  SAFE: {
    icon: <CheckCircle className="w-5 h-5" />,
    text: 'NORMAL CONDITIONS',
    sub: 'All sensor readings within acceptable parameters. Continue routine monitoring.',
    bg: 'bg-green-500/8',
    border: 'border-green-500/20',
    textColor: 'text-white',
    pulse: false,
  },
  WATCH: {
    icon: <Eye className="w-5 h-5" />,
    text: 'MONITOR CLOSELY',
    sub: 'Sensor readings trending upward. Increase monitoring frequency. Notify shift supervisor.',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/30',
    textColor: 'text-amber-500',
    pulse: false,
  },
  WARNING: {
    icon: <AlertTriangle className="w-5 h-5" />,
    text: 'EARLY WARNING — ELEVATED RISK',
    sub: 'Multiple sensors show increased deformation. Alert mine safety officer. Restrict access. Deploy inspection team.',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    textColor: 'text-orange-400',
    pulse: false,
  },
  CRITICAL: {
    icon: <Siren className="w-5 h-5" />,
    text: 'CRITICAL SUBSIDENCE RISK DETECTED',
    sub: 'IMMEDIATE ACTION REQUIRED. Evacuate affected zones. Notify management. Activate emergency response protocol.',
    bg: 'bg-red-50',
    border: 'border-red-500/50',
    textColor: 'text-red-400',
    pulse: true,
  },
};

export default function EarlyWarningBanner({ riskLevel, riskScore }: Props) {
  const cfg = BANNERS[riskLevel];

  return (
    <div className={`mx-4 mt-3 px-5 py-3 rounded-xl border flex items-center gap-4 transition-all duration-500 ${cfg.bg} ${cfg.border} ${cfg.pulse ? 'critical-pulse' : ''}`}>
      <div className={`${cfg.textColor} flex-shrink-0 ${cfg.pulse ? 'status-blink' : ''}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-extrabold tracking-widest ${cfg.textColor}`}>
            {riskLevel === 'CRITICAL' && '🔴 '}
            {riskLevel === 'WARNING' && '🟠 '}
            {riskLevel === 'WATCH' && '🟡 '}
            {riskLevel === 'SAFE' && '🟢 '}
            {cfg.text}
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${cfg.textColor}`} style={{ background: 'rgba(0,0,0,0.3)' }}>
            {riskScore.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-white/80 mt-0.5 truncate">{cfg.sub}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-[9px] font-mono text-white/80 uppercase tracking-wider">Advisory</div>
        <div className="text-[9px] font-mono text-white/80">Field verification required</div>
      </div>
    </div>
  );
}
