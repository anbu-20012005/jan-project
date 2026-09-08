import React from 'react';
import { SensorNode } from '../types';
import { MapPin } from 'lucide-react';
import { getNodeRiskScore, riskColor } from '../services/riskEngine';

interface Props {
  nodes: SensorNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

export default function MineMap({ nodes, selectedNodeId, onSelectNode }: Props) {
  return (
    <div className="glass-card p-4 relative overflow-hidden h-[300px]">
      <div className="section-header flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        GIS Mine Risk Map
        <span className="ml-auto text-[9px] font-mono text-amber-500/70 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">PROTOTYPE LAYOUT</span>
      </div>

      <div className="flex gap-4 items-center text-[9px] font-mono mb-2">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> SAFE</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> WATCH</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> WARNING</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> CRITICAL</div>
      </div>

      <div className="absolute inset-x-4 bottom-4 top-[70px] border border-white/20 bg-[#060b14] rounded-lg p-4 overflow-hidden grid-bg">
        <div className="relative w-full h-full flex gap-4">
          
          {/* Zone A */}
          <div className="flex-1 border border-white/20 border-dashed rounded-lg relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 left-2 text-[10px] font-bold text-white/80">Zone A</div>
            {nodes.filter(n => n.zone === 'Zone A').map((node, i) => {
              const risk = getNodeRiskScore(node);
              const rLevel = risk >= 75 ? 'CRITICAL' : risk >= 40 ? 'WARNING' : risk >= 30 ? 'WATCH' : 'SAFE';
              const color = riskColor(rLevel);
              const top = i === 0 ? '40%' : '70%';
              const left = i === 0 ? '30%' : '60%';
              
              return (
                <div
                  key={node.node_id}
                  onClick={() => onSelectNode(node.node_id === selectedNodeId ? null : node.node_id)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{ top, left }}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${selectedNodeId === node.node_id ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color, borderColor: color }}
                    >
                      {risk >= 75 && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }} />}
                    </div>
                    <div className="mt-1 text-[9px] font-mono font-bold whitespace-nowrap bg-black/60 px-1 rounded" style={{ color }}>
                      {node.node_id}
                    </div>
                    <div className="text-[8px] font-mono text-white/80 mt-0.5">{risk}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zone B */}
          <div className="flex-1 border border-white/20 border-dashed rounded-lg relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 left-2 text-[10px] font-bold text-white/80">Zone B</div>
            {nodes.filter(n => n.zone === 'Zone B').map((node, i) => {
              const risk = getNodeRiskScore(node);
              const rLevel = risk >= 75 ? 'CRITICAL' : risk >= 40 ? 'WARNING' : risk >= 30 ? 'WATCH' : 'SAFE';
              const color = riskColor(rLevel);
              const top = i === 0 ? '30%' : '60%';
              const left = i === 0 ? '40%' : '70%';
              
              return (
                <div
                  key={node.node_id}
                  onClick={() => onSelectNode(node.node_id === selectedNodeId ? null : node.node_id)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{ top, left }}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${selectedNodeId === node.node_id ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color, borderColor: color }}
                    >
                      {risk >= 75 && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }} />}
                    </div>
                    <div className="mt-1 text-[9px] font-mono font-bold whitespace-nowrap bg-black/60 px-1 rounded" style={{ color }}>
                      {node.node_id}
                    </div>
                    <div className="text-[8px] font-mono text-white/80 mt-0.5">{risk}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Zone C & D & E - just render anywhere for remaining if needed */}
          {nodes.filter(n => !['Zone A', 'Zone B'].includes(n.zone || '')).map((node, i) => {
              const risk = getNodeRiskScore(node);
              const rLevel = risk >= 75 ? 'CRITICAL' : risk >= 40 ? 'WARNING' : risk >= 30 ? 'WATCH' : 'SAFE';
              const color = riskColor(rLevel);
              const top = '80%';
              const left = `${10 + (i * 20)}%`;
              
              return (
                <div
                  key={node.node_id}
                  onClick={() => onSelectNode(node.node_id === selectedNodeId ? null : node.node_id)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{ top, left }}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${selectedNodeId === node.node_id ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color, borderColor: color }}
                    >
                      {risk >= 75 && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }} />}
                    </div>
                    <div className="mt-1 text-[9px] font-mono font-bold whitespace-nowrap bg-black/60 px-1 rounded" style={{ color }}>
                      {node.node_id}
                    </div>
                    <div className="text-[8px] font-mono text-white/80 mt-0.5">{risk}%</div>
                  </div>
                </div>
              );
            })}

        </div>
      </div>
    </div>
  );
}
