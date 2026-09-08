import React from 'react';
import { ChartPoint } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { BarChart2 } from 'lucide-react';

interface Props {
  history: ChartPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-2 text-[10px] font-mono border border-sky-500/20">
      <p className="text-white/80 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const chartProps = {
  margin: { top: 5, right: 8, left: -15, bottom: 0 },
};

const axisProps = {
  tick: { fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' },
  axisLine: { stroke: '#1e2d45' },
  tickLine: false,
};

export default function SensorCharts({ history }: Props) {
  const data = history.length > 0 ? history : [
    { time: '--', tilt: 0, displacement: 0, vibration: 0, soil_moisture: 0, risk_score: 0 }
  ];

  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
        Live Sensor Time-Series
        <span className="ml-auto text-[10px] text-white/80 font-mono">last {history.length} readings · 2s interval</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tilt + Displacement */}
        <div>
          <p className="text-[10px] font-bold text-white/80 mb-2 tracking-wider uppercase">Tilt (°) & Displacement (mm)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="tilt" stroke="#f97316" strokeWidth={1.5} dot={false} name="Tilt(°)" />
              <Line type="monotone" dataKey="displacement" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Disp(mm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vibration */}
        <div>
          <p className="text-[10px] font-bold text-white/80 mb-2 tracking-wider uppercase">Vibration (g)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} {...chartProps}>
              <defs>
                <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="vibration" stroke="#eab308" strokeWidth={1.5}
                fill="url(#vibGrad)" name="Vibration(g)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Moisture */}
        <div>
          <p className="text-[10px] font-bold text-white/80 mb-2 tracking-wider uppercase">Soil Moisture (%)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} {...chartProps}>
              <defs>
                <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="soil_moisture" stroke="#06b6d4" strokeWidth={1.5}
                fill="url(#moistGrad)" name="Moisture(%)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Score */}
        <div>
          <p className="text-[10px] font-bold text-white/80 mb-2 tracking-wider uppercase">Risk Score (%)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} {...chartProps}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              {/* Safe zone reference */}
              <Area type="monotone" dataKey="risk_score" stroke="#ef4444" strokeWidth={2}
                fill="url(#riskGrad)" name="Risk(%)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
