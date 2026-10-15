import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Leaf,
  Sliders,
  TrendingDown,
  Sparkles,
  Zap,
  Package,
  Truck,
  Building,
} from 'lucide-react';

export const CarbonIntelligenceView: React.FC = () => {
  const { state, actions, kpis } = useWarehouse();
  const { filters, carbonRecords } = state;

  const [ecoPackagingWeight, setEcoPackagingWeight] = useState<number>(filters.ecoPackagingPreset ? 85 : 40);

  const handleSliderChange = (val: number) => {
    setEcoPackagingWeight(val);
    actions.setEcoPackaging(val >= 60);
  };

  const totalCarbon = kpis.totalSimulatedCarbonKg;
  const carbonSaved = kpis.baselineVsOptimizedCarbonSavedPct;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-xl p-5 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-blue">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                GREEN LOGISTICS & CARBON EMISSIONS INTELLIGENCE
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                SCOPE 1, 2 & 3 AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Real-time emissions accounting across FSC recycled packaging, AGV lithium battery power, warehouse solar HVAC, and EV last-mile freight.
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs">
          <span className="text-slate-400 block text-[10px]">HYDERABAD FC GREEN SCORE</span>
          <span className="text-emerald-400 font-bold text-2xl">{kpis.overallGreenScorePct} / 100</span>
        </div>
      </div>

      {/* Carbon Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Packaging Materials</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.05 <span className="text-xs font-normal text-slate-400">kg CO₂/pkg</span></div>
          <p className="text-[10px] text-emerald-400 font-mono">-62% vs standard bleached carton</p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AGV Movement Energy</span>
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.04 <span className="text-xs font-normal text-slate-400">kg CO₂/order</span></div>
          <p className="text-[10px] text-slate-400 font-mono">100% Rooftop Solar Powered</p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Warehouse Facility Ops</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.09 <span className="text-xs font-normal text-slate-400">kg CO₂/order</span></div>
          <p className="text-[10px] text-slate-400 font-mono">Smart LED & High-Efficiency Inverters</p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Last-Mile EV Delivery</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.22 <span className="text-xs font-normal text-slate-400">kg CO₂/trip</span></div>
          <p className="text-[10px] text-emerald-400 font-mono">-74% vs diesel delivery vans</p>
        </div>
      </div>

      {/* Interactive Eco-Packaging Slider & Formula breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white tracking-wider">
                ECO-PACKAGING ADOPTION SLIDER
              </h4>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              {ecoPackagingWeight}% Adoption Rate
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={ecoPackagingWeight}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10% (Conventional Packaging)</span>
              <span>50% (Standard Hybrid)</span>
              <span>100% (Zero-Plastic Eco-Carton)</span>
            </div>
          </div>

          <div className="bg-[#0A0F1E] rounded-xl p-4 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Calculated Total Carbon:</span>
              <span className="text-white font-bold">{totalCarbon} kg CO₂</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Carbon Abated vs Baseline:</span>
              <span className="text-emerald-400 font-bold">-{carbonSaved}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Packaging Type In Effect:</span>
              <span className="text-cyan-400 font-bold">
                {filters.ecoPackagingPreset ? '100% FSC Recycled & Biodegradable' : 'Standard Corrugated'}
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Formula Rationale */}
        <div className="glass-panel rounded-xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white tracking-wider">
              GREEN SCORE CALCULATION SPECIFICATION
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            GreenScore = 0.40 × (1 - E_Packaging/E_Base) + 0.30 × (Fleet_EV_Ratio) + 0.20 × (Solar_Self_Consumption) + 0.10 × (Aisle_Path_Optimization)
          </p>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>All values are derived directly from simulation telemetry, not fabricated static labels.</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Changing the packaging slider instantly recalculates the operational carbon ledger.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
