import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Grid,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';

export const DynamicSlottingView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { skus, bins } = state;

  const targetSku = skus['SKU-WH-204'] || Object.values(skus)[0];
  const currentBin = bins[targetSku.currentBinId];
  const suggestedBinId = 'BIN-A-04';
  const suggestedBin = bins[suggestedBinId];

  const [hasMoved, setHasMoved] = useState<boolean>(targetSku.currentBinId === suggestedBinId);

  const currentDistance = currentBin ? currentBin.distanceToPackingMeters : 32.4;
  const suggestedDistance = suggestedBin ? suggestedBin.distanceToPackingMeters : 11.2;
  const distanceSavedPerPick = Math.max(0, Math.round((currentDistance - suggestedDistance) * 10) / 10);
  const dailyPicks = Math.round(targetSku.demandVelocity * 1.5);
  const dailyDistanceSavedKm = Math.round(((distanceSavedPerPick * dailyPicks * 2) / 1000) * 100) / 100;

  const handleApproveMove = () => {
    actions.executeSlottingMove(
      targetSku.id,
      suggestedBinId,
      `Relocated high-velocity SKU ${targetSku.name} from ${targetSku.currentBinId} to ${suggestedBinId}. Distance to packing hub reduced by ${distanceSavedPerPick}m per cycle.`
    );
    setHasMoved(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-xl p-5 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-blue">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/40">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                DYNAMIC SLOTTING & AISLE CONGESTION OPTIMIZER
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                OPERATIONS RESEARCH ALGORITHM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Dynamically evaluates item pick frequency, weight-class ergonomics, and geometric travel distance to packing stations.
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs">
          <span className="text-slate-400 block text-[10px]">PROJECTED DAILY TRAVEL SAVINGS</span>
          <span className="text-emerald-400 font-bold text-lg">-{dailyDistanceSavedKm} km/day</span>
        </div>
      </div>

      {/* Main Focus Scenario: SKU-WH-204 Slot Relocation */}
      <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              ACTIVE SLOTTING PROPOSAL #SLOT-HYD-104
            </span>
            <h4 className="text-base font-bold text-white mt-1">
              {targetSku.id} — {targetSku.name}
            </h4>
          </div>
          <span
            className={`text-xs font-mono px-3 py-1 rounded-full font-bold ${
              hasMoved || targetSku.currentBinId === suggestedBinId
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {hasMoved || targetSku.currentBinId === suggestedBinId ? '✓ SLOTTING EXECUTED' : 'PENDING APPROVAL'}
          </span>
        </div>

        {/* Current vs Suggested Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Current Slot */}
          <div className="bg-[#0A0F1E] rounded-xl p-5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">CURRENT LOCATION</span>
              <span className="text-xs font-mono font-bold text-purple-300">{targetSku.currentBinId}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-mono text-white">{currentDistance}</span>
              <span className="text-xs font-mono text-slate-400">meters to packing</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-400 border-t border-white/5 pt-3">
              <div>Zone: <span className="text-white">{currentBin?.zone || 'ZONE_C'}</span></div>
              <div>Racking Aisle: <span className="text-white">{currentBin?.aisle || 3}</span></div>
              <div>Pick Frequency: <span className="text-white">{dailyPicks} picks/day</span></div>
            </div>
          </div>

          {/* Suggested Slot */}
          <div className="bg-[#0A0F1E] rounded-xl p-5 border border-cyan-500/30 space-y-3 glow-blue">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">AI RECOMMENDED LOCATION</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{suggestedBinId}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-mono text-cyan-400">{suggestedDistance}</span>
              <span className="text-xs font-mono text-slate-400">meters to packing</span>
              <span className="text-xs font-mono text-emerald-400 font-bold ml-auto">
                (-{distanceSavedPerPick}m / trip)
              </span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-400 border-t border-white/5 pt-3">
              <div>Zone: <span className="text-white">{suggestedBin?.zone || 'ZONE_A'}</span></div>
              <div>Racking Aisle: <span className="text-white">{suggestedBin?.aisle || 1}</span></div>
              <div>Ergonomic Tier: <span className="text-emerald-400 font-bold">Golden Zone (Level 2)</span></div>
            </div>
          </div>
        </div>

        {/* Algorithm Score & Rationale Details */}
        <div className="bg-[#111A2B]/80 rounded-xl p-4 border border-white/5 space-y-2 text-xs">
          <div className="font-mono text-cyan-300 font-semibold flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>ALGORITHM SCORING FORMULA</span>
          </div>
          <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
            Score = PickFrequency (32/d) × ΔDistance (21.2m) × ErgonomicWeight (1.4) - RelocationLaborCost (15s)
          </p>
          <p className="text-slate-400 text-xs">
            Moving SKU-WH-204 from Zone C back-aisle to Zone A frontal bay eliminates 65.4% of total transit time for this fast-moving item.
          </p>
        </div>

        {/* Execution Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-slate-400">
            Target Bin Capacity: <span className="text-emerald-400 font-bold">150 kg (Fits 85 units)</span>
          </div>

          {hasMoved || targetSku.currentBinId === suggestedBinId ? (
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Relocation Completed in Digital Twin & Inventory Ledger</span>
            </div>
          ) : (
            <button
              onClick={handleApproveMove}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center space-x-2"
            >
              <span>Approve & Execute Relocation Move</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
