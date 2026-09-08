import React from 'react';
import { Alert, RiskLevel } from '../types';
import { Bell, CheckCircle, X } from 'lucide-react';

interface Props {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const LEVEL_STYLES: Record<RiskLevel, { border: string; bg: string; dot: string; text: string }> = {
  SAFE:     { border: '#22c55e', bg: 'rgba(34,197,94,0.06)',  dot: 'bg-green-400',  text: 'text-white' },
  WATCH:    { border: '#eab308', bg: 'rgba(234,179,8,0.06)',  dot: 'bg-yellow-400', text: 'text-amber-500' },
  WARNING:  { border: '#f97316', bg: 'rgba(249,115,22,0.08)', dot: 'bg-orange-400', text: 'text-orange-400' },
  CRITICAL: { border: '#ef4444', bg: 'rgba(239,68,68,0.10)',  dot: 'bg-red-400',    text: 'text-red-400' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AlertCenter({ alerts, onAcknowledge }: Props) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const acknowledged   = alerts.filter(a =>  a.acknowledged);

  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Bell className="w-3.5 h-3.5 text-orange-400" />
        Alert Center
        {unacknowledged.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-red-500 status-blink">
            {unacknowledged.length}
          </span>
        )}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-6 text-white/80">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No alerts — system nominal</p>
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
        {unacknowledged.map(alert => {
          const style = LEVEL_STYLES[alert.risk_level];
          return (
            <div
              key={alert.id}
              className="alert-item slide-down"
              style={{ borderColor: style.border, background: style.bg }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot} status-blink`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold tracking-widest ${style.text}`}>{alert.risk_level}</span>
                      <span className="text-[10px] text-white/80 font-semibold">{alert.zone}</span>
                      <span className="ml-auto text-[9px] text-white/80 font-mono">{timeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-[10px] text-white/80 mt-0.5 leading-snug">{alert.message}</p>
                    <div className="text-[9px] text-white/80 font-mono mt-0.5">Risk Score: {alert.risk_score.toFixed(0)}%</div>
                  </div>
                </div>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex-shrink-0 text-white/80 hover:text-white/80 transition-colors"
                  title="Acknowledge"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {acknowledged.length > 0 && (
          <div className="pt-2 border-t border-white/20">
            <p className="text-[9px] text-white/80 uppercase tracking-wider font-bold mb-1">Acknowledged</p>
            {acknowledged.slice(0, 3).map(alert => {
              const style = LEVEL_STYLES[alert.risk_level];
              return (
                <div key={alert.id} className="py-1.5 opacity-40">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span className={`font-bold ${style.text}`}>{alert.risk_level}</span>
                    <span className="text-white/80">{alert.zone}</span>
                    <span className="ml-auto text-white/80 font-mono">{timeAgo(alert.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
