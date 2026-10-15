import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Activity,
  Layers,
} from 'lucide-react';
import type { WarehouseException } from '../../types/warehouse';

export const ExceptionCenterView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { exceptions } = state;

  const [selectedExId, setSelectedExId] = useState<string | null>('EX-HYD-01');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const exList = Object.values(exceptions);

  const filteredExceptions = exList.filter((e) => {
    return filterSeverity === 'ALL' || e.severity === filterSeverity;
  });

  const activeException = selectedExId ? exceptions[selectedExId] : filteredExceptions[0] || null;

  const handleResolve = (ex: WarehouseException) => {
    const note = resolutionNote || ex.suggestedAction;
    actions.resolveException(ex.id, note);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-xl p-4 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 glow-danger">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              INCIDENT RESPONSE & EXCEPTION-TO-RESOLUTION WORKFLOW
            </h3>
            <p className="text-xs text-slate-300">
              Structured operational lifecycle: EXCEPTION → ANALYSIS → DECISION → APPROVAL → RESOLUTION → KPI IMPACT.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-2.5 py-1 rounded ${filterSeverity === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-2.5 py-1 rounded ${filterSeverity === 'CRITICAL' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400'}`}
          >
            CRITICAL
          </button>
          <button
            onClick={() => setFilterSeverity('WARNING')}
            className={`px-2.5 py-1 rounded ${filterSeverity === 'WARNING' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            WARNING
          </button>
        </div>
      </div>

      {/* Main Grid: Exception List & Lifecycle Workflow Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exceptions Queue */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white tracking-wider">
              ACTIVE INCIDENTS ({filteredExceptions.length})
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Real-time alerts</span>
          </div>

          <div className="overflow-y-auto max-h-[580px] divide-y divide-white/5">
            {filteredExceptions.map((ex) => {
              const isSelected = activeException?.id === ex.id;
              const isCritical = ex.severity === 'CRITICAL';
              const isResolved = ex.status === 'RESOLVED';

              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExId(ex.id)}
                  className={`w-full text-left p-3.5 transition-colors space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-500/10 border-l-2 border-l-rose-500'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{ex.id}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isCritical
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans line-clamp-2">{ex.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Type: {ex.type}</span>
                    <span>T+{ex.timestampSimTime}s</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: 6-Stage Resolution Lifecycle */}
        {activeException ? (
          <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">
                  INCIDENT INVESTIGATION
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{activeException.id}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0A0F1E] text-slate-300 border border-white/10">
                  Target Entity: {activeException.entityId}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    activeException.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {activeException.severity}
                </span>
              </div>
            </div>

            {/* 6-Stage Visual Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
              <div className="bg-rose-950/60 text-rose-300 p-2 rounded-lg border border-rose-500/30">
                1. EXCEPTION
              </div>
              <div className="bg-slate-800 text-slate-200 p-2 rounded-lg border border-white/5">
                2. ANALYSIS
              </div>
              <div className="bg-slate-800 text-slate-200 p-2 rounded-lg border border-white/5">
                3. DECISION
              </div>
              <div className="bg-slate-800 text-slate-200 p-2 rounded-lg border border-white/5">
                4. APPROVAL
              </div>
              <div className={`p-2 rounded-lg border ${activeException.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-white/5'}`}>
                5. RESOLUTION
              </div>
              <div className="bg-slate-900 text-slate-500 p-2 rounded-lg border border-white/5">
                6. KPI IMPACT
              </div>
            </div>

            {/* AI Diagnostics & Root Cause */}
            <div className="space-y-3 text-xs font-mono">
              <div className="bg-[#0A0F1E] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">ROOT CAUSE ANALYSIS</span>
                <p className="text-slate-200 font-sans text-xs">{activeException.description}</p>
              </div>

              <div className="bg-[#0A0F1E] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-cyan-400 text-[10px] uppercase block">AI REASONING AUDIT</span>
                <p className="text-slate-300 font-sans text-xs">{activeException.aiExplanation}</p>
              </div>

              <div className="bg-[#0A0F1E] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-amber-400 text-[10px] uppercase block">RECOMMENDED CORRECTIVE ACTION</span>
                <p className="text-white font-sans text-xs font-semibold">{activeException.suggestedAction}</p>
              </div>

              <div className="bg-[#0A0F1E] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-emerald-400 text-[10px] uppercase block">MEASURED KPI IMPACT</span>
                <p className="text-emerald-300 font-sans text-xs">{activeException.kpiImpact}</p>
              </div>
            </div>

            {/* Resolution Form or Completed Notice */}
            {activeException.status !== 'RESOLVED' ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-[11px] font-mono text-slate-400 block">
                  RECORD RESOLUTION ACTION:
                </label>
                <input
                  type="text"
                  placeholder="Enter resolution notes (or leave blank to apply AI recommendation)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center justify-between">
                  {activeException.status === 'OPEN' && (
                    <button
                      onClick={() => actions.acknowledgeException(activeException.id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-all"
                    >
                      Acknowledge Incident
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(activeException)}
                    className="ml-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Resolution & Close Exception</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold block">✓ Exception Successfully Resolved</span>
                  <p className="text-[11px] text-slate-300">Action: {activeException.resolutionActionTaken}</p>
                </div>
                <span className="text-[10px] text-slate-400">
                  Resolved at T+{activeException.resolvedAtSimTime}s
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-8 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-mono">
            Select an exception to inspect the resolution workflow.
          </div>
        )}
      </div>
    </div>
  );
};
