import React, { useState } from 'react';
import { SensorNode } from '../types';
import { classifyRiskLevel, getNodeRiskScore, riskColor } from '../services/riskEngine';
import { ChevronDown, ChevronUp, Radio, Edit3 } from 'lucide-react';

interface NodeRowProps {
  node: SensorNode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (field: keyof SensorNode, value: number) => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function NodeRow({ node, isSelected, onSelect, onEdit }: NodeRowProps) {
  const score = getNodeRiskScore(node);
  const level = classifyRiskLevel(score);
  const color = riskColor(level);

  const fields: { key: keyof SensorNode; label: string; unit: string; min: number; max: number; step: number }[] = [
    { key: 'tilt',          label: 'Tilt',         unit: '°',    min: 0,    max: 90,   step: 0.1 },
    { key: 'vibration',     label: 'Vibration',    unit: 'g',    min: 0,    max: 10,   step: 0.01 },
    { key: 'displacement',  label: 'Displacement', unit: 'mm',   min: 0,    max: 100,  step: 0.1 },
    { key: 'crack_index',   label: 'Crack Index',  unit: '/100', min: 0,    max: 100,  step: 1 },
    { key: 'soil_moisture', label: 'Soil Moist.',  unit: '%',    min: 0,    max: 100,  step: 0.5 },
    { key: 'rssi',          label: 'RSSI',         unit: 'dBm',  min: -120, max: -20,  step: 1 },
    { key: 'snr',           label: 'SNR',          unit: 'dB',   min: -10,  max: 30,   step: 0.5 },
    { key: 'node_health',   label: 'Health',       unit: '%',    min: 0,    max: 100,  step: 1 },
  ];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 mb-2 overflow-hidden ${
        isSelected ? 'border-sky-500/60 bg-sky-500/5' : 'border-[#1e2d45] bg-[#111827]/80'
      }`}
    >
      {/* Node header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10/5 transition-colors"
        onClick={onSelect}
      >
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
            style={{ background: `${color}20`, border: `2px solid ${color}60`, color }}
          >
            {node.node_id.slice(-2)}
          </div>
          {level === 'CRITICAL' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full status-blink" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/80">{node.node_id}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color, background: `${color}15` }}>{level}</span>
          </div>
          <div className="text-[10px] text-white/80">{node.zone} · {score}% risk</div>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3 text-white" />
          {isSelected ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
        </div>
      </div>

      {/* Expanded editor */}
      {isSelected && (
        <div className="px-3 pb-3 border-t border-[#1e2d45]/60">
          <div className="flex items-center gap-1 mb-2 mt-2">
            <Edit3 className="w-3 h-3 text-sky-400" />
            <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">Edit Sensor Values (Simulated)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-0.5">
                  {f.label} <span className="text-white/80 font-normal">{f.unit}</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="sensor-input flex-1"
                    value={+(node[f.key] as number).toFixed(2)}
                    step={f.step}
                    min={f.min}
                    max={f.max}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) onEdit(f.key, clamp(v, f.min, f.max));
                    }}
                  />
                </div>
                <input
                  type="range"
                  className="w-full mt-0.5 accent-sky-500"
                  value={node[f.key] as number}
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  onChange={e => onEdit(f.key, clamp(parseFloat(e.target.value), f.min, f.max))}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-0.5">Latitude</label>
              <input type="number" className="sensor-input" value={node.latitude.toFixed(4)}
                onChange={e => onEdit('latitude', parseFloat(e.target.value) || 0)} step={0.0001} />
            </div>
            <div>
              <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-0.5">Longitude</label>
              <input type="number" className="sensor-input" value={node.longitude.toFixed(4)}
                onChange={e => onEdit('longitude', parseFloat(e.target.value) || 0)} step={0.0001} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  nodes: SensorNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onEditNode: (nodeId: string, field: keyof SensorNode, value: number) => void;
}

export default function SensorPanel({ nodes, selectedNodeId, onSelectNode, onEditNode }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 text-sky-400" />
        Virtual Sensor Gateway
        <span className="ml-auto text-[9px] font-mono text-amber-500/80 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
          SIMULATED
        </span>
      </div>
      <p className="text-[10px] text-white/80 mb-3 font-mono">
        Click a node to expand and edit sensor values. Changes update the risk engine in real time.
      </p>
      <div className="max-h-[600px] overflow-y-auto pr-1">
        {nodes.map(node => (
          <NodeRow
            key={node.node_id}
            node={node}
            isSelected={selectedNodeId === node.node_id}
            onSelect={() => onSelectNode(selectedNodeId === node.node_id ? null : node.node_id)}
            onEdit={(field, value) => onEditNode(node.node_id, field, value)}
          />
        ))}
      </div>
    </div>
  );
}
