import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Sparkles,
  Activity,
  Layers,
} from 'lucide-react';

export const SystemHealthLedgerView: React.FC = () => {
  const { state } = useWarehouse();
  const { events, decisions } = state;

  const [activeTab, setActiveTab] = useState<'EVENTS' | 'AI_DECISIONS'>('EVENTS');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const modules = ['ALL', 'COMMAND_CENTER', 'ALLOCATION', 'PICKING', 'PACKING', 'QC', 'AGV', 'SLOTTING', 'DISPATCH'];

  const filteredEvents = events.filter((e) => {
    const matchesMod = moduleFilter === 'ALL' || e.module === moduleFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMod && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              IMMUTABLE AUDIT LEDGER & REASONING AUDIT TRAIL
            </h3>
            <p className="text-xs text-slate-300">
              Append-only state transition recording for forensic verification, compliance audit, and AI explainability.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 bg-[#0A0F1E] p-1 rounded-lg border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              activeTab === 'EVENTS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            SIMULATION LEDGER ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('AI_DECISIONS')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              activeTab === 'AI_DECISIONS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI DECISIONS AUDIT ({decisions.length})
          </button>
        </div>
      </div>

      {activeTab === 'EVENTS' ? (
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden space-y-4 p-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {modules.map((m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-2 py-0.5 rounded ${
                    moduleFilter === m ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A0F1E] text-[10px] font-mono uppercase text-slate-400 sticky top-0 border-b border-white/5">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Sim Time</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Event Summary & Description</th>
                  <th className="p-3">Entity Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-slate-300">{evt.id}</td>
                    <td className="p-3 text-cyan-400">T+{evt.simTime}s</td>
                    <td className="p-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                        {evt.module}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : evt.severity === 'WARN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : evt.severity === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-white text-xs">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{evt.description}</div>
                    </td>
                    <td className="p-3 text-purple-300 font-semibold">{evt.entityId || 'SYSTEM'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AI Decision Audit Tab */
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-xs font-bold text-white tracking-wider">
              ALGORITHMIC DECISION AUDITS ({decisions.length})
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">
              Deterministic calculations with verifiable reasoning factors
            </span>
          </div>

          <div className="space-y-4">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-400">{dec.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                      {dec.module}
                    </span>
                    <span className="text-white font-sans font-semibold text-xs">{dec.triggerEvent}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px]">
                    Confidence: {(dec.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3 bg-[#111A2B] rounded-lg border border-white/5 text-slate-300 font-sans text-xs">
                  <span className="text-cyan-400 font-bold block mb-1 font-mono text-[11px]">
                    CHOSEN OPERATIONAL ACTION:
                  </span>
                  {dec.chosenAction}
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Reasoning Formula:</span> {dec.reasoningFormula}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                  <span className="text-slate-400">Expected: {dec.expectedImpact}</span>
                  <span className="text-emerald-400 font-sans font-medium">{dec.actualOutcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
