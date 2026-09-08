import React from 'react';
import { SensorNode } from '../types';
import { Server } from 'lucide-react';

interface Props {
  nodes: SensorNode[];
}

function getStatusLabel(health: number): { label: string; color: string } {
  if (health >= 90) return { label: 'ONLINE',   color: '#22c55e' };
  if (health >= 70) return { label: 'DEGRADED', color: '#eab308' };
  if (health >= 50) return { label: 'POOR',     color: '#f97316' };
  return { label: 'CRITICAL', color: '#ef4444' };
}

function SignalBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex gap-0.5 items-end h-4">
      {[20, 40, 60, 80, 100].map((threshold, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm transition-all duration-300"
          style={{
            height: `${(i + 1) * 20}%`,
            background: pct >= threshold ? color : '#1e2d45',
          }}
        />
      ))}
    </div>
  );
}

export default function NodeHealth({ nodes }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        Node Health & Connectivity
      </div>

      <div className="space-y-2">
        {nodes.map(node => {
          const { label, color } = getStatusLabel(node.node_health);
          const rssiNorm = Math.max(0, Math.min(100, ((node.rssi + 100) / 60) * 100));

          return (
            <div key={node.node_id} className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/20">
              {/* Node ID + status */}
              <div className="w-20 flex-shrink-0">
                <div className="text-xs font-bold font-mono text-white/80">{node.node_id}</div>
                <div className="text-[10px] font-bold" style={{ color }}>{label}</div>
              </div>

              {/* Health bar */}
              <div className="flex-1">
                <div className="flex justify-between text-[9px] font-mono mb-0.5">
                  <span className="text-white/80">Health</span>
                  <span style={{ color }}>{node.node_health.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${node.node_health}%`, background: color }}
                  />
                </div>
              </div>

              {/* RSSI signal bars */}
              <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                <SignalBar value={rssiNorm} max={100} color="#06b6d4" />
                <span className="text-[8px] font-mono text-white/80">{node.rssi.toFixed(0)}dBm</span>
              </div>

              {/* SNR */}
              <div className="flex-shrink-0 text-center w-12">
                <div className="text-xs font-bold font-mono text-sky-400">{node.snr.toFixed(1)}</div>
                <div className="text-[8px] text-white/80">dB SNR</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono text-white/80 mt-2 text-center">
        System Confidence uses these metrics · Node health = simulated
      </p>
    </div>
  );
}
