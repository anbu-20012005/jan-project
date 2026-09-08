import React, { useState } from 'react';
import { CommunityReport } from '../types';
import { Users, MapPin, Send } from 'lucide-react';

type ReportType = CommunityReport['report_type'];

interface Props {
  reports: CommunityReport[];
  onSubmit: (r: Omit<CommunityReport, 'id' | 'timestamp'>) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function CommunityReportPanel({ reports, onSubmit }: Props) {
  const [location, setLocation] = useState('');
  const [reportType, setReportType] = useState<ReportType>('Visible crack');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;
    onSubmit({ location, report_type: reportType, description });
    setLocation('');
    setDescription('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-teal-400" />
        Community Ground Report
        <span className="ml-auto text-[9px] font-mono text-teal-400/70 bg-teal-400/10 px-1.5 py-0.5 rounded border border-teal-400/20">PROTOTYPE</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 mb-3">
        <div>
          <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-1">Location</label>
          <input
            type="text"
            className="sensor-input"
            placeholder="e.g. Zone A shaft entrance"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-1">Report Type</label>
          <select
            className="sensor-input"
            value={reportType}
            onChange={e => setReportType(e.target.value as ReportType)}
          >
            <option>Visible crack</option>
            <option>Ground settlement</option>
            <option>Vibration</option>
            <option>Water accumulation</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-bold tracking-wider text-white/80 uppercase block mb-1">Description</label>
          <textarea
            className="sensor-input resize-none"
            rows={2}
            placeholder="Describe what you observed..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          {submitted ? '✓ Report Submitted' : 'Submit Report'}
        </button>
      </form>

      {reports.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {reports.slice(0, 5).map(r => (
            <div key={r.id} className="p-2 rounded-lg bg-teal-500/5 border border-teal-500/15 text-[10px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin className="w-2.5 h-2.5 text-teal-400" />
                <span className="font-bold text-teal-400">{r.report_type}</span>
                <span className="text-white/80 ml-auto font-mono">{timeAgo(r.timestamp)}</span>
              </div>
              <div className="text-white/80">{r.location}</div>
              <div className="text-white/80 mt-0.5">{r.description}</div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] font-mono text-white/80 mt-2">
        Community reports are included in Mistral AI analysis context.
      </p>
    </div>
  );
}
