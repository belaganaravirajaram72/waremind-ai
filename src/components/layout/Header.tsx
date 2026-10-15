import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Leaf,
  AlertTriangle,
  Radio,
  Sliders,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { state, actions, kpis } = useWarehouse();
  const { simClock, filters } = state;

  const formatSimTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Facility Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center glow-blue">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-wider text-white">WAREMIND AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                v2.0 PRO
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-tight">
              HYDERABAD FC • SMART OPERATIONS
            </p>
          </div>
        </div>

        {/* Operational Status Pill */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-emerald-400 font-mono font-medium tracking-wide">
            OPERATIONAL • HIGH THROUGHPUT
          </span>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="hidden xl:flex items-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Fulfillment:</span>
          <span className="font-mono font-bold text-cyan-400">{kpis.fulfillmentRatePct}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">AGV Fleet:</span>
          <span className="font-mono font-bold text-orange-400">{kpis.agvFleetUtilizationPct}% Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Green Score:</span>
          <span className="font-mono font-bold text-emerald-400">{kpis.overallGreenScorePct}/100</span>
        </div>
        {kpis.openExceptionsCount > 0 && (
          <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono font-semibold">{kpis.openExceptionsCount} Alert{kpis.openExceptionsCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Simulation Engine Controls */}
      <div className="flex items-center space-x-3">
        {/* Sim Clock Display */}
        <div className="bg-[#111A2B] border border-white/10 rounded-lg px-3 py-1 flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <div className="text-right">
            <div className="font-mono text-xs font-semibold text-white tracking-widest">
              {formatSimTime(simClock.simTimeSeconds)}
            </div>
            <div className="text-[9px] uppercase font-mono text-slate-400">
              SIM DAY {simClock.dayNumber}
            </div>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => actions.setSimRunning(!simClock.isRunning)}
          className={`p-2 rounded-lg border transition-all ${
            simClock.isRunning
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title={simClock.isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          aria-label={simClock.isRunning ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {simClock.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Speed Selector */}
        <div className="hidden sm:flex bg-[#111A2B] border border-white/10 rounded-lg p-0.5 space-x-1">
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => actions.setSimSpeed(spd)}
              className={`px-2 py-1 text-xs font-mono rounded ${
                simClock.speedMultiplier === spd
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Reset Simulation */}
        <button
          onClick={() => actions.resetSim()}
          className="p-2 rounded-lg bg-[#111A2B] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
          title="Reset Simulation State"
          aria-label="Reset Simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play Demo Button */}
        <button
          onClick={() => actions.triggerDemoStep(1)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>PLAY DEMO</span>
        </button>

        {/* Performance Mode / Reduced Motion Toggle */}
        <button
          onClick={() => actions.toggleReducedMotion()}
          className={`p-2 rounded-lg border transition-all ${
            filters.reducedMotion
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
              : 'bg-[#111A2B] border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Low Power / Reduced Motion"
          aria-label="Toggle Reduced Motion"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
