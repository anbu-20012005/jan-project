import React from 'react';
import { AIAnalysisResult, RiskLevel } from '../types';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { riskColor } from '../services/riskEngine';

interface Props {
  aiResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  gc: number;
  sc: number;
  onAnalyze: () => void;
}

export default function AIExplanationPanel({ aiResult, isAnalyzing, riskLevel, riskScore, gc, sc, onAnalyze }: Props) {
  const color = riskColor(riskLevel);

  return (
    <div className="glass-card p-4">
      <div className="section-header flex items-center gap-2">
        <Brain className="w-3.5 h-3.5 text-purple-400" />
        AI Decision Support
        {aiResult && (
          <span className={`ml-auto text-[9px] font-mono px-2 py-0.5 rounded border ${
            aiResult.source === 'mistral'
              ? 'text-purple-400 bg-purple-400/10 border-purple-400/20'
              : 'text-amber-500 bg-yellow-400/10 border-yellow-400/20'
          }`}>
            {aiResult.source?.toUpperCase() || 'FALLBACK'}
          </span>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full btn-primary flex items-center justify-center gap-2 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <><div className="spinner" style={{ width: 14, height: 14 }} /> Calling AI...</>
        ) : (
          <><Brain className="w-4 h-4" /> {aiResult ? 'Refresh Analysis' : 'Analyze with AI'}</>
        )}
      </button>

      {isAnalyzing && (
        <div className="text-center text-xs text-white/80 mb-4 font-mono animate-pulse">
          Sending sensor data to AI... this may take 10–20 seconds.
        </div>
      )}

      {!aiResult && !isAnalyzing && (
        <div className="text-center py-8 text-white/80">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Analyze with AI" to get an AI-assisted risk assessment.</p>
          <p className="text-xs mt-1 text-white/80">Only called on explicit user action.</p>
        </div>
      )}

      {aiResult && !isAnalyzing && (
        <div className="space-y-3 slide-down">
          {/* Disclaimer */}
          <div className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-[9px] font-mono text-yellow-600 leading-relaxed">
              ⚠ AI-assisted prototype risk assessment. Advisory only.
              All sensor data is simulated. Not a validated subsidence prediction model.
              Requires field verification by qualified mine safety personnel.
            </p>
          </div>

          {/* Why is the system warning? */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/80 uppercase mb-2">
              Why Is The System Warning?
            </h3>

            {/* Primary factors */}
            <div className="space-y-1.5 mb-3">
              {aiResult.primary_factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 text-[9px] font-bold flex items-center justify-center"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                    {i + 1}
                  </span>
                  <span className="text-white/80">{f}</span>
                </div>
              ))}
            </div>

            {/* AI explanation */}
            <div className="p-3 rounded-lg bg-white/10  border border-white/20">
              <div className="text-[9px] font-bold tracking-widest text-purple-400 uppercase mb-1.5">AI Assessment</div>
              <p className="text-xs text-white/80 leading-relaxed">{aiResult.explanation}</p>
            </div>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 rounded-lg bg-white/10  border border-white/20">
              <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider mb-1">Trend</div>
              <div className={`flex items-center gap-1.5 font-bold text-sm ${
                aiResult.trend === 'INCREASING' ? 'text-red-400' :
                aiResult.trend === 'DECREASING' ? 'text-white' : 'text-white/80'
              }`}>
                {aiResult.trend === 'INCREASING' && <TrendingUp className="w-4 h-4" />}
                {aiResult.trend === 'DECREASING' && <TrendingDown className="w-4 h-4" />}
                {aiResult.trend === 'STABLE'     && <Minus className="w-4 h-4" />}
                {aiResult.trend}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/10  border border-white/20 text-center">
              <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider">6h Risk</div>
              <div className="text-base font-extrabold font-mono text-orange-400">{aiResult.predicted_risk_6h}%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/10  border border-white/20 text-center">
              <div className="text-[9px] text-white/80 uppercase font-bold tracking-wider">24h Risk</div>
              <div className="text-base font-extrabold font-mono text-red-400">{aiResult.predicted_risk_24h}%</div>
            </div>
          </div>

          {/* Recommended actions */}
          <div>
            <div className="text-[10px] font-bold tracking-widest text-white/80 uppercase mb-2">Recommended Actions</div>
            <div className="space-y-1.5">
              {aiResult.recommended_actions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/10 border border-white/20 text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected zones */}
          {aiResult.affected_zones?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-widest text-white/80 uppercase mb-1.5">Affected Zones</div>
              <div className="flex flex-wrap gap-1.5">
                {aiResult.affected_zones.map(z => (
                  <span key={z} className="px-2.5 py-1 rounded-full text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20">
                    {z}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI confidence */}
          <div className="flex justify-between text-[10px] font-mono text-white/80 pt-1 border-t border-white/20">
            <span>AI Confidence: {(aiResult.ai_confidence * 100).toFixed(0)}%</span>
            <span>Ground: {gc.toFixed(0)}% · System: {sc.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
