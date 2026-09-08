import React from 'react';
import { RiskLevel } from '../types';
import { Network } from 'lucide-react';

interface Props {
  riskLevel: RiskLevel;
  mistralStatus: 'connected' | 'offline' | 'checking';
}

const LAYERS = [
  {
    id: 'sensing',
    label: 'Sensing Layer',
    items: ['ESP32 MCU*', 'MPU6050 IMU*', 'Displacement*', 'Crack Sensor*', 'Soil Moisture*'],
    note: '* Future hardware — currently simulated',
    color: '#06b6d4',
    icon: '📡',
  },
  {
    id: 'comms',
    label: 'Communication',
    items: ['LoRa 915MHz*', 'Mesh Network*', 'Virtual Gateway'],
    note: '* Future hardware',
    color: '#0ea5e9',
    icon: '📶',
  },
  {
    id: 'engine',
    label: 'Intelligence',
    items: ['Dual Confidence Engine', 'Neighbor Consensus', 'Sensor Trust Score', 'Mistral AI Analysis'],
    note: 'Active in prototype',
    color: '#8b5cf6',
    icon: '🧠',
  },
  {
    id: 'decision',
    label: 'Decision Layer',
    items: ['Risk Classification', 'GIS Risk Map', 'Explainable Warning'],
    note: 'Active in prototype',
    color: '#f97316',
    icon: '⚡',
  },
  {
    id: 'action',
    label: 'Action Layer',
    items: ['Dashboard Alert', 'Mobile Alert (Sim)', 'SMS Alert (Sim)', 'Local Alarm (Sim)'],
    note: 'Simulated in prototype',
    color: '#ef4444',
    icon: '🚨',
  },
];

export default function SystemArchDiagram({ riskLevel, mistralStatus }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Network className="w-3.5 h-3.5 text-sky-400" />
        Digital Twin — System Architecture
        <span className="ml-auto text-[9px] font-mono text-white/80">SIH26025 Production Blueprint</span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-1">
        {LAYERS.map((layer, idx) => (
          <React.Fragment key={layer.id}>
            <div
              className="flex-1 rounded-xl p-3 border transition-all duration-300"
              style={{
                background: `${layer.color}08`,
                borderColor: `${layer.color}25`,
              }}
            >
              <div className="text-center mb-2">
                <div className="text-lg">{layer.icon}</div>
                <div className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5" style={{ color: layer.color }}>
                  {layer.label}
                </div>
              </div>
              <div className="space-y-1">
                {layer.items.map(item => (
                  <div key={item} className="text-[9px] font-mono text-center px-1 py-0.5 rounded"
                    style={{ background: `${layer.color}10`, color: `${layer.color}CC` }}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="text-[8px] font-mono text-center mt-2 opacity-50" style={{ color: layer.color }}>
                {layer.note}
              </div>
            </div>

            {idx < LAYERS.length - 1 && (
              <div className="flex md:flex-col items-center justify-center text-white/80 px-1">
                <div className="text-xs">▼</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-white/80 border-t border-white/20 pt-2">
        <span>Current Risk: <span className="font-bold" style={{ color: riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'WARNING' ? '#f97316' : riskLevel === 'WATCH' ? '#eab308' : '#22c55e' }}>{riskLevel}</span></span>
        <span>Mistral: <span className={mistralStatus === 'connected' ? 'text-purple-400' : 'text-red-400'}>{mistralStatus.toUpperCase()}</span></span>
        <span>Mode: <span className="text-amber-500">PROTOTYPE SIMULATION</span></span>
      </div>
    </div>
  );
}
